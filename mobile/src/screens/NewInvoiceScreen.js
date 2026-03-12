import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator, Modal, FlatList, Alert, Dimensions } from 'react-native';
import { X, Plus, Trash2, ChevronRight, Search, Check, AlertCircle, Minus, User as UserIcon, Calendar, Tag, Percent, Ticket, LayoutGrid, FileText, Sparkles, MoreHorizontal, Edit2 } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useClients } from '../hooks/useClients';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

const PREMIUM_COLORS = {
    charcoal: '#0a0a0c',
    electricBlue: '#2563eb',
    emeraldPremium: '#10b981',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    warningYellow: '#eab308',
};

export default function NewInvoiceScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { editingInvoice, editingItems } = route.params || {};
    const { business } = useAuth();
    const { clients, loading: loadingClients } = useClients();
    const { products, loading: loadingProducts } = useProducts();
    const { createInvoice, invoices } = useInvoices();

    const [selectedClient, setSelectedClient] = useState(editingInvoice?.client || null);
    const [items, setItems] = useState(editingItems || []);
    const [applyIVA, setApplyIVA] = useState(editingInvoice?.tax_amount > 0);
    const [applyDiscount, setApplyDiscount] = useState(editingInvoice?.discount_amount > 0);
    const [discountValue, setDiscountValue] = useState(editingInvoice?.discount_amount?.toString() || '0');
    const [saving, setSaving] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState(editingInvoice?.invoice_number || '');

    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (!editingInvoice) {
            if (invoices.length > 0) {
                const lastNum = invoices[0].invoice_number;
                const match = lastNum.match(/(\d+)/);
                const nextVal = match ? parseInt(match[0]) + 1 : invoices.length + 1;
                setInvoiceNumber(`FAC-${String(nextVal).padStart(4, '0')}`);
            } else {
                setInvoiceNumber('FAC-0001');
            }
        }
    }, [invoices, editingInvoice]);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = applyDiscount ? parseFloat(discountValue) || 0 : 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const iva = applyIVA ? subtotalAfterDiscount * 0.19 : 0;
    const total = subtotalAfterDiscount + iva;

    const handleAddItem = (product) => {
        const existing = items.find(it => it.product_id === product.id);
        if (existing) {
            setItems(items.map(it => it.product_id === product.id ? { ...it, quantity: it.quantity + 1 } : it));
        } else {
            setItems([...items, {
                product_id: product.id,
                name: product.name,
                price: product.sale_price,
                quantity: 1,
                total: product.sale_price,
                sku: product.sku || 'N/A'
            }]);
        }
        setProductModalVisible(false);
    };

    const updateItemQuantity = (index, deltaOrValue) => {
        const newItems = [...items];
        let newQty;
        if (typeof deltaOrValue === 'string') {
            newQty = parseInt(deltaOrValue) || 0;
        } else {
            newQty = Math.max(0, newItems[index].quantity + deltaOrValue);
        }
        newItems[index].quantity = newQty;
        setItems(newItems);
    };

    const updateItemPrice = (index, priceText) => {
        const newItems = [...items];
        const newPrice = parseFloat(priceText) || 0;
        newItems[index].price = newPrice;
        setItems(newItems);
    };

    const handlePreview = () => {
        if (!selectedClient) return Alert.alert('Error', 'Debe seleccionar un cliente');
        if (items.length === 0) return Alert.alert('Error', 'Debe agregar al menos un producto');

        const invoiceData = {
            business_id: business.id,
            client_id: selectedClient.id,
            invoice_number: invoiceNumber,
            status: 'pending',
            total: total,
            subtotal: subtotal,
            tax_amount: iva,
            discount_amount: discount,
            created_at: new Date().toISOString(),
            client: selectedClient
        };

        navigation.navigate('InvoiceDetail', { 
            invoice: invoiceData, 
            items: items 
        });
    };

    const handleSave = async () => {
        if (!selectedClient) return Alert.alert('Error', 'Debe seleccionar un cliente');
        if (items.length === 0) return Alert.alert('Error', 'Debe agregar al menos un producto');

        try {
            setSaving(true);
            const invoiceData = {
                business_id: business.id,
                client_id: selectedClient.id,
                invoice_number: invoiceNumber,
                status: 'pending',
                total: total,
                subtotal: subtotal,
                tax_amount: iva,
                discount_amount: discount
            };

            const invoiceItems = items.map(it => ({
                product_id: it.product_id,
                quantity: it.quantity,
                unit_price: it.price,
                total: it.price * it.quantity
            }));

            if (editingInvoice) {
                // Lógica de actualización (Podría requerir una nueva función en el hook o rpc)
                const { error: updateError } = await supabase
                    .from('invoices')
                    .update(invoiceData)
                    .eq('id', editingInvoice.id);
                
                if (updateError) throw updateError;
                
                // Actualizar ítems (Eliminar y volver a insertar es lo más sencillo)
                await supabase.from('invoice_items').delete().eq('invoice_id', editingInvoice.id);
                await supabase.from('invoice_items').insert(
                    invoiceItems.map(it => ({ ...it, invoice_id: editingInvoice.id }))
                );
            } else {
                await createInvoice(invoiceData, invoiceItems);
            }
            
            Alert.alert(
                'Éxito', 
                'Factura guardada correctamente.',
                [
                    { text: 'Ver Detalle', onPress: () => handlePreview() },
                    { text: 'Ir al Inicio', onPress: () => navigation.navigate('MainTabs') },
                    { text: 'Nueva Factura', onPress: () => {
                        setSelectedClient(null);
                        setItems([]);
                        setInvoiceNumber('');
                    }}
                ]
            );
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['rgba(37, 99, 235, 0.08)', 'transparent']} style={styles.bgGradientLeft} />
            <LinearGradient colors={['rgba(16, 185, 129, 0.05)', 'transparent']} style={styles.bgGradientRight} />

            <View style={styles.stickyHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <X color="#94a3b8" size={22} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nueva Factura</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.mainContentWrapper}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.sectionLabel}>Cliente Receptor</Text>
                        <TouchableOpacity onPress={() => setClientModalVisible(true)}>
                            <Text style={styles.changeText}>Cambiar</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.glassCard} onPress={() => setClientModalVisible(true)}>
                        <View style={styles.cardInner}>
                            <View style={styles.clientAvatarBox}>
                                <UserIcon color={PREMIUM_COLORS.electricBlue} size={24} />
                            </View>
                            <View style={styles.clientInfo}>
                                <Text style={styles.clientNameText}>{selectedClient ? selectedClient.name : 'Seleccionar Cliente'}</Text>
                                {selectedClient?.balance !== undefined && (
                                    <View style={styles.balanceRow}>
                                        <View style={styles.dot} />
                                        <Text style={styles.balanceText}>Pendiente: <Text style={styles.balanceValue}>${selectedClient.balance.toLocaleString()}</Text></Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <ChevronRight color={PREMIUM_COLORS.slate600} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.row, { gap: 16 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>No. Factura</Text>
                        <View style={styles.glassCardSmall}>
                            <Tag color={PREMIUM_COLORS.slate500} size={18} />
                            <TextInput
                                style={styles.invoiceInput}
                                value={invoiceNumber}
                                onChangeText={setInvoiceNumber}
                                placeholderTextColor={PREMIUM_COLORS.slate600}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionLabel}>Fecha Emisión</Text>
                        <View style={styles.glassCardSmall}>
                            <Calendar color={PREMIUM_COLORS.electricBlue} size={18} />
                            <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.sectionTitle}>Ítems del Pedido</Text>
                        <TouchableOpacity style={styles.addBtnPremium} onPress={() => setProductModalVisible(true)}>
                            <Plus color={PREMIUM_COLORS.electricBlue} size={18} />
                            <Text style={styles.addBtnText}>Agregar</Text>
                        </TouchableOpacity>
                    </View>

                    {items.length === 0 ? (
                        <View style={styles.emptyItemsBox}>
                            <LayoutGrid color={PREMIUM_COLORS.slate600} size={40} strokeWidth={1} />
                            <Text style={styles.emptyText}>No hay productos agregados</Text>
                        </View>
                    ) : (
                        items.map((item, index) => (
                            <View key={index} style={styles.itemWrapper}>
                                <View style={styles.itemGlassCard}>
                                    <View style={styles.itemHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemNameText}>{item.name}</Text>
                                            <Text style={styles.itemSkuText}>Ref: {item.sku}</Text>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.deleteIconButton} 
                                            onPress={() => setItems(items.filter((_, i) => i !== index))}
                                        >
                                            <Trash2 color="#ef4444" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.itemFooter}>
                                        <View style={styles.footerInputs}>
                                            <View>
                                                <Text style={styles.miniLabel}>Cant.</Text>
                                                <View style={styles.miniQtyContainer}>
                                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQuantity(index, -1)}>
                                                        <Minus color={PREMIUM_COLORS.slate500} size={14} />
                                                    </TouchableOpacity>
                                                    <TextInput
                                                        style={styles.miniInput}
                                                        value={item.quantity.toString()}
                                                        onChangeText={(t) => updateItemQuantity(index, t)}
                                                        keyboardType="numeric"
                                                    />
                                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQuantity(index, 1)}>
                                                        <Plus color={PREMIUM_COLORS.electricBlue} size={14} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View>
                                                <Text style={styles.miniLabel}>P. Unit</Text>
                                                <View style={styles.miniPriceContainer}>
                                                    <Text style={styles.miniCurrency}>$</Text>
                                                    <TextInput
                                                        style={styles.miniInputP}
                                                        value={item.price.toString()}
                                                        onChangeText={(t) => updateItemPrice(index, t)}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.itemTotalBox}>
                                            <Text style={styles.miniLabel}>Subtotal</Text>
                                            <Text style={styles.itemTotalText}>${(item.price * item.quantity).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <View style={styles.toggleCard}>
                        <View style={styles.toggleLeft}>
                            <View style={styles.toggleIconBox}>
                                <Percent color={PREMIUM_COLORS.slate400} size={18} />
                            </View>
                            <Text style={styles.toggleTitle}>Aplicar IVA (19%)</Text>
                        </View>
                        <Switch
                            value={applyIVA}
                            onValueChange={setApplyIVA}
                            trackColor={{ false: '#1e293b', true: PREMIUM_COLORS.electricBlue }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={[styles.toggleCard, !applyDiscount && { opacity: 0.6 }]}>
                        <View style={styles.toggleLeft}>
                            <View style={styles.toggleIconBox}>
                                <Ticket color={PREMIUM_COLORS.slate500} size={18} />
                            </View>
                            <Text style={styles.toggleTitle}>Aplicar Descuento</Text>
                        </View>
                        <Switch
                            value={applyDiscount}
                            onValueChange={setApplyDiscount}
                            trackColor={{ false: '#1e293b', true: PREMIUM_COLORS.electricBlue }}
                            thumbColor="#fff"
                        />
                    </View>
                    {applyDiscount && (
                        <View style={styles.discountInputBox}>
                            <TextInput
                                style={styles.discountInput}
                                placeholder="Valor del descuento..."
                                placeholderTextColor={PREMIUM_COLORS.slate600}
                                value={discountValue}
                                onChangeText={setDiscountValue}
                                keyboardType="numeric"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.summaryGlassCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toLocaleString()}</Text>
                    </View>
                    {applyDiscount && (
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: PREMIUM_COLORS.emeraldPremium }]}>Descuento</Text>
                            <Text style={[styles.summaryValue, { color: PREMIUM_COLORS.emeraldPremium }]}>-${discount.toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Impuestos (IVA 19%)</Text>
                        <Text style={styles.summaryValue}>${iva.toLocaleString()}</Text>
                    </View>
                    <View style={styles.hDivider} />
                    <View style={styles.totalBlock}>
                        <View>
                            <Text style={styles.totalMeta}>Total a Pagar</Text>
                            <Text style={styles.totalCurrency}>COP</Text>
                        </View>
                        <Text style={styles.grandTotalText}>$ {total.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Observaciones Internas</Text>
                    <View style={styles.glassCardTextarea}>
                        <TextInput
                            style={styles.textarea}
                            placeholder="Añade notas sobre el envío o términos especiales..."
                            placeholderTextColor={PREMIUM_COLORS.slate600}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>

            <View style={styles.bottomActions}>
                <LinearGradient colors={['transparent', PREMIUM_COLORS.charcoal]} style={styles.bottomFade} />
                <View style={styles.actionRowBottom}>
                    <TouchableOpacity 
                        style={styles.previewBtn} 
                        onPress={handlePreview}
                        disabled={saving}
                    >
                        <FileText color={PREMIUM_COLORS.electricBlue} size={20} />
                        <Text style={styles.previewBtnText}>Previsualizar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.saveSubmitBtn} 
                        onPress={handleSave} 
                        disabled={saving}
                    >
                        <LinearGradient
                            colors={['#2563eb', '#1d4ed8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.submitGradient}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Sparkles color="#fff" size={18} />
                                    <Text style={styles.submitBtnText}>Guardar</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 34 }} />
            </View>

            {/* Modal de Clientes */}
            <Modal visible={clientModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
                            <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.modalClose}>
                                <X color="#fff" size={20} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchBox}>
                            <Search color={PREMIUM_COLORS.slate500} size={18} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Buscar cliente..."
                                placeholderTextColor={PREMIUM_COLORS.slate600}
                                value={clientSearch}
                                onChangeText={setClientSearch}
                            />
                        </View>
                        <FlatList
                            data={clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => { setSelectedClient(item); setClientModalVisible(false); }}
                                >
                                    <View style={styles.modalItemLeft}>
                                        <View style={styles.modalAvatar}>
                                            <UserIcon color={PREMIUM_COLORS.electricBlue} size={20} />
                                        </View>
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </View>
                                    {selectedClient?.id === item.id && <Check color={PREMIUM_COLORS.emeraldPremium} size={20} />}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal de Productos */}
            <Modal visible={productModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Agregar Producto</Text>
                            <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.modalClose}>
                                <X color="#fff" size={20} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchBox}>
                            <Search color={PREMIUM_COLORS.slate500} size={18} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Buscar producto..."
                                placeholderTextColor={PREMIUM_COLORS.slate600}
                                value={productSearch}
                                onChangeText={setProductSearch}
                            />
                        </View>
                        <FlatList
                            data={products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleAddItem(item)}
                                >
                                    <View style={styles.modalItemLeft}>
                                        <View style={[styles.modalAvatar, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                            <Tag color={PREMIUM_COLORS.emeraldPremium} size={20} />
                                        </View>
                                        <View>
                                            <Text style={styles.modalItemText}>{item.name}</Text>
                                            <Text style={styles.modalItemSub}>Stock: {item.stock} | ${item.sale_price.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                    <Plus color={PREMIUM_COLORS.electricBlue} size={20} />
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PREMIUM_COLORS.charcoal,
    },
    mainContentWrapper: {
        flex: 1,
        margin: 12,
        marginBottom: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.015)',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    bgGradientLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width * 0.5,
        height: 400,
    },
    bgGradientRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: width * 0.5,
        height: 400,
    },
    stickyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: 'rgba(10, 10, 12, 0.6)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: -0.3,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 28,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 12,
    },
    sectionLabel: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    changeText: {
        color: PREMIUM_COLORS.electricBlue,
        fontSize: 11,
        fontWeight: '600',
    },
    glassCard: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    clientAvatarBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(37, 99, 235, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientInfo: {
        gap: 2,
    },
    clientNameText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: PREMIUM_COLORS.warningYellow,
    },
    balanceText: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 12,
    },
    balanceValue: {
        color: PREMIUM_COLORS.warningYellow,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 28,
    },
    glassCardSmall: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
        marginTop: 10,
    },
    invoiceInput: {
        flex: 1,
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: 'bold',
        padding: 0,
    },
    dateText: {
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: 'bold',
    },
    addBtnPremium: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(37, 99, 235, 0.2)',
    },
    addBtnText: {
        color: PREMIUM_COLORS.electricBlue,
        fontSize: 13,
        fontWeight: 'bold',
    },
    deleteIconButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    qtyBtn: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTotalBox: {
        alignItems: 'flex-end',
    },
    itemGlassCard: {
        backgroundColor: 'rgba(10, 10, 12, 0.4)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    itemNameText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    itemSkuText: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 12,
        marginTop: 2,
    },
    itemTotalText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    footerInputs: {
        flexDirection: 'row',
        gap: 24,
    },
    miniLabel: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    miniQtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    miniInput: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: 'bold',
        minWidth: 20,
        textAlign: 'center',
        padding: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    miniPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    miniCurrency: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 13,
    },
    miniInputP: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: 'bold',
        padding: 0,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    editIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyItemsBox: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyText: {
        color: PREMIUM_COLORS.slate600,
        fontSize: 14,
    },
    toggleCard: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
        marginBottom: 12,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    toggleTitle: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '600',
    },
    discountInputBox: {
        marginTop: 4,
        paddingHorizontal: 4,
    },
    discountInput: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
    },
    summaryGlassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 32,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 28,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 14,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: 'bold',
    },
    hDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 12,
    },
    totalBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 8,
    },
    totalMeta: {
        color: PREMIUM_COLORS.electricBlue,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    totalCurrency: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    grandTotalText: {
        color: PREMIUM_COLORS.emeraldPremium,
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        textShadowColor: 'rgba(16, 185, 129, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    glassCardTextarea: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
        marginTop: 8,
    },
    textarea: {
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 22,
        padding: 0,
        textAlignVertical: 'top',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    bottomFade: {
        position: 'absolute',
        top: -60,
        left: 0,
        right: 0,
        height: 100,
    },
    actionRowBottom: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    previewBtn: {
        flex: 1,
        height: 54,
        borderRadius: 18,
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 1.5,
        borderColor: 'rgba(37, 99, 235, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    previewBtnText: {
        color: PREMIUM_COLORS.electricBlue,
        fontSize: 15,
        fontWeight: 'bold',
    },
    saveSubmitBtn: {
        flex: 1.2,
        height: 54,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: PREMIUM_COLORS.electricBlue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '80%',
        padding: 24,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    modalInput: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    modalItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    modalAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalItemText: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '600',
    },
    modalItemSub: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 12,
        marginTop: 2,
    },
    modalDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
