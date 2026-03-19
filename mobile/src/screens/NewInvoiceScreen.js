import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator, Modal, FlatList, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Plus, Trash2, ChevronRight, Search, Check, AlertCircle, Minus, User as UserIcon, Calendar, Tag, Percent, Ticket, LayoutGrid, FileText, Sparkles, MoreHorizontal, Edit2, DollarSign } from 'lucide-react-native';
import { COLORS, SIZES, PREMIUM_COLORS } from '../constants/theme';
import { useClients } from '../hooks/useClients';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { OfflineManager } from '../services/OfflineManager';

const { width } = Dimensions.get('window');

// We use the global theme COLORS instead of local constants
const ROUND_EPSILON = Number.EPSILON || 2.220446049250313e-16;

const round2 = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return Math.round((num + ROUND_EPSILON) * 100) / 100;
};

const InvoiceItem = ({ item, index, onUpdateQuantity, onUpdatePrice, onDelete }) => (
    <View style={styles.itemWrapper}>
        <View style={styles.itemGlassCard}>
            <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemNameText}>{item.name}</Text>
                    <Text style={styles.itemSkuText}>Ref: {item.sku}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.deleteIconButton} 
                    onPress={() => onDelete(index)}
                >
                    <Trash2 color="#ef4444" size={18} />
                </TouchableOpacity>
            </View>
            <View style={styles.itemFooter}>
                <View style={styles.footerInputs}>
                    <View>
                        <Text style={styles.miniLabel}>Cantidad</Text>
                        <View style={styles.miniQtyContainer}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdateQuantity(index, -1)}>
                                <Minus color={COLORS.textSecondary} size={14} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.miniInput}
                                value={(item.quantity ?? 0).toString()}
                                onChangeText={(t) => onUpdateQuantity(index, t)}
                                keyboardType="decimal-pad"
                            />
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdateQuantity(index, 1)}>
                                <Plus color={COLORS.success} size={14} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.miniLabel}>Precio Unitario</Text>
                        <View style={styles.miniPriceContainer}>
                            <Text style={styles.miniCurrency}>$</Text>
                            <TextInput
                                style={styles.miniInputP}
                                value={(item.price ?? 0).toString()}
                                onChangeText={(t) => onUpdatePrice(index, t)}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>
                </View>
        
                <View style={styles.itemTotalBox}>
                    <Text style={styles.miniLabel}>Subtotal</Text>
                    <Text style={styles.itemTotalText}>${round2((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}</Text>
                </View>
            </View>
        </View>
    </View>
);

export default function NewInvoiceScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { editingInvoice, editingItems } = route.params || {};
    const { business } = useAuth();
    const { clients, loading: loadingClients } = useClients();
    const { products, loading: loadingProducts } = useProducts();
    const { createInvoice, updateInvoice, invoices } = useInvoices();

    const [selectedClient, setSelectedClient] = useState(editingInvoice?.client || null);
    const [items, setItems] = useState(editingItems || []);
    const [applyIVA, setApplyIVA] = useState(editingInvoice?.tax_amount > 0);
    const [ivaPercent, setIvaPercent] = useState('19');
    const [applyDiscount, setApplyDiscount] = useState(editingInvoice?.discount_amount > 0);
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
    const [discountValue, setDiscountValue] = useState(editingInvoice?.discount_amount?.toString() || '0');
    const [initialPayment, setInitialPayment] = useState(editingInvoice?.amount_paid?.toString() || '0');
    const [saving, setSaving] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState(editingInvoice?.invoice_number || '');
    const [notes, setNotes] = useState(editingInvoice?.notes || '');

    const [clientModalVisible, setClientModalVisible] = useState(false);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (!editingInvoice) {
            if (invoices.length > 0) {
                const lastNum = invoices[0].invoice_number || '';
                const match = lastNum.match(/(\d+)/);
                const nextVal = match ? parseInt(match[0]) + 1 : invoices.length + 1;
                setInvoiceNumber(`FAC-${String(nextVal).padStart(4, '0')}`);
            } else {
                setInvoiceNumber('FAC-0001');
            }
        }
    }, [invoices, editingInvoice]);

    const subtotal = round2(items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)), 0));
    
    // Cálculo de descuento dinámico
    const rawDiscount = parseFloat(discountValue) || 0;
    const discount = applyDiscount 
        ? (discountType === 'percent' ? round2(subtotal * (rawDiscount / 100)) : round2(rawDiscount))
        : 0;

    const subtotalAfterDiscount = Math.max(0, round2(subtotal - discount));
    
    // IVA dinámico
    const iva = applyIVA ? round2(subtotalAfterDiscount * (parseFloat(ivaPercent) / 100 || 0)) : 0;
    const total = round2(subtotalAfterDiscount + iva);

    const handleAddItem = (product) => {
        const existing = items.find(it => it.product_id === product.id);
        if (existing) {
            setItems(items.map(it => it.product_id === product.id ? { ...it, quantity: it.quantity + 1 } : it));
        } else {
            setItems([...items, {
                product_id: product.id,
                name: product.name,
                price: product.sale_price,
                purchase_price: product.base_price || 0,
                quantity: 1,
                total: product.sale_price,
                sku: product.sku || 'N/A'
            }]);
        }
        setProductModalVisible(false);
    };

    const updateItemQuantity = (index, deltaOrValue) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            let newQty;
            if (typeof deltaOrValue === 'string') {
                // Solo permitimos dígitos para evitar confusiones con separadores
                newQty = parseInt(deltaOrValue.replace(/[^0-9]/g, '')) || 0;
            } else {
                newQty = Math.max(0, item.quantity + deltaOrValue);
            }
            return { ...item, quantity: newQty, total: Math.round(item.price * newQty) };
        }));
    };

    const updateItemPrice = (index, priceText) => {
        // Permitimos números y detectamos si el usuario usa punto o coma como separador de miles
        // Si el texto tiene formato como "15.000", lo limpiamos a "15000"
        const cleanVal = priceText.replace(/[^\d]/g, '');
        const newPrice = parseFloat(cleanVal) || 0;
        
        setItems(prev => {
            const next = [...prev];
            next[index] = { 
                ...next[index], 
                price: newPrice, 
                total: Math.round(newPrice * next[index].quantity) 
            };
            return next;
        });
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
            amount_paid: parseFloat(initialPayment) || 0,
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
            
            const isOffline = await OfflineManager.checkIsOffline();
            
            const invoiceData = {
                business_id: business.id,
                client_id: selectedClient.id,
                invoice_number: invoiceNumber,
                status: (parseFloat(initialPayment) >= total) ? 'paid' : 'pending',
                total: total,
                subtotal: subtotal,
                tax_amount: iva,
                discount_amount: discount,
                discount_type: discountType,
                amount_paid: parseFloat(initialPayment) || 0,
                notes: notes
            };

            const invoiceItems = items.map(it => ({
                product_id: it.product_id,
                quantity: it.quantity,
                unit_price: it.price,
                purchase_price: it.purchase_price || 0,
                total: it.price * it.quantity
            }));

            if (isOffline) {
                await OfflineManager.saveToQueue(invoiceData, invoiceItems);
                Alert.alert(
                    'Modo Sin Conexión', 
                    'No hay conexión a internet. La factura se ha guardado localmente y se sincronizará automáticamente cuando recuperes la conexión.',
                    [
                        { text: 'Entendido', onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }]
                        }) }
                    ]
                );
                return;
            }

            if (editingInvoice) {
                await updateInvoice(editingInvoice.id, invoiceData, invoiceItems);
            } else {
                await createInvoice(invoiceData, invoiceItems);
            }
            
            Alert.alert(
                'Éxito', 
                'Factura guardada correctamente.',
                [
                    { text: 'Ir al Inicio', onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }]
                    }) },
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

    const ClientGlassSelect = () => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>CLIENTE*</Text>
            <TouchableOpacity 
                style={[styles.inputContainer, !selectedClient && { borderColor: 'rgba(255,255,255,0.05)' }]} 
                onPress={() => setClientModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.iconBox}>
                    <UserIcon size={18} color={selectedClient ? COLORS.success : COLORS.textSecondary} strokeWidth={1.5} />
                </View>
                <Text style={[styles.inputText, !selectedClient && { color: COLORS.textSecondary + '80' }]}>
                    {selectedClient ? selectedClient.name : 'Seleccionar Cliente'}
                </Text>
                {selectedClient && <ChevronRight color={COLORS.textSecondary} size={18} />}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{editingInvoice ? 'Editar Factura' : 'Nueva Factura'}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color={COLORS.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ClientGlassSelect />

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>NO. FACTURA</Text>
                            <View style={styles.inputContainer}>
                                <View style={styles.iconBox}>
                                    <Tag size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={invoiceNumber}
                                    onChangeText={setInvoiceNumber}
                                    placeholder="FR-001"
                                    placeholderTextColor={COLORS.textSecondary + '80'}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>FECHA EMISIÓN</Text>
                            <View style={[styles.inputContainer, { backgroundColor: 'rgba(255,255,255,0.01)' }]}>
                                <View style={styles.iconBox}>
                                    <Calendar size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
                                </View>
                                <Text style={styles.inputText}>{new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRowItems}>
                            <Text style={styles.label}>PRODUCTOS / SERVICIOS *</Text>
                            <TouchableOpacity onPress={() => setProductModalVisible(true)} style={styles.addSmallBtn}>
                                <Plus size={14} color={COLORS.success} strokeWidth={2.5} />
                                <Text style={styles.addSmallText}>Añadir</Text>
                            </TouchableOpacity>
                        </View>

                        {items.length === 0 ? (
                            <TouchableOpacity style={styles.emptyItemsBox} onPress={() => setProductModalVisible(true)}>
                                <LayoutGrid color={COLORS.textSecondary} size={32} strokeWidth={1} />
                                <Text style={styles.emptyText}>Toca para agregar productos</Text>
                            </TouchableOpacity>
                        ) : (
                        items.map((item, index) => (
                            <InvoiceItem 
                                key={index} 
                                item={item} 
                                index={index} 
                                onUpdateQuantity={updateItemQuantity} 
                                onUpdatePrice={updateItemPrice} 
                                onDelete={(idx) => setItems(items.filter((_, i) => i !== idx))}
                            />
                        ))
                    )}
                </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>AJUSTES DE FACTURA</Text>
                        <View style={styles.glassPanel}>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: applyIVA ? `${COLORS.success}20` : 'rgba(255,255,255,0.05)' }]}>
                                        <Percent color={applyIVA ? COLORS.success : COLORS.textSecondary} size={16} strokeWidth={2} />
                                    </View>
                                    <Text style={[styles.toggleText, applyIVA && { color: COLORS.text }]}>Aplicar IVA</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    {applyIVA && (
                                        <View style={styles.smallInputWrapper}>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={ivaPercent}
                                                onChangeText={setIvaPercent}
                                                keyboardType="decimal-pad"
                                                maxLength={2}
                                            />
                                            <Text style={styles.smallInputSuffix}>%</Text>
                                        </View>
                                    )}
                                    <Switch
                                        value={applyIVA}
                                        onValueChange={setApplyIVA}
                                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.success }}
                                        thumbColor="#fff"
                                    />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: applyDiscount ? `${COLORS.success}20` : 'rgba(255,255,255,0.05)' }]}>
                                        <Ticket color={applyDiscount ? COLORS.success : COLORS.textSecondary} size={16} strokeWidth={2} />
                                    </View>
                                    <Text style={[styles.toggleText, applyDiscount && { color: COLORS.text }]}>Descuento</Text>
                                </View>
                                <Switch
                                    value={applyDiscount}
                                    onValueChange={setApplyDiscount}
                                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.success }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {applyDiscount && (
                                <View style={styles.discountExpanded}>
                                    <View style={styles.discountTypeSelector}>
                                        <TouchableOpacity 
                                            style={[styles.typeBtn, discountType === 'fixed' && styles.typeBtnActive]}
                                            onPress={() => setDiscountType('fixed')}
                                        >
                                            <Text style={[styles.typeBtnText, discountType === 'fixed' && styles.typeBtnTextActive]}>Monto fijo ($)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.typeBtn, discountType === 'percent' && styles.typeBtnActive]}
                                            onPress={() => setDiscountType('percent')}
                                        >
                                            <Text style={[styles.typeBtnText, discountType === 'percent' && styles.typeBtnTextActive]}>Porcentaje (%)</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={discountType === 'fixed' ? "Valor a descontar..." : "Porcentaje..."}
                                            placeholderTextColor={COLORS.textSecondary + '80'}
                                            value={discountValue}
                                            onChangeText={setDiscountValue}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>RESUMEN DE ORDEN</Text>
                        <View style={styles.summaryPanel}>
                            <View style={styles.summaryLine}>
                                <Text style={styles.summaryLineLabel}>Subtotal</Text>
                                <Text style={styles.summaryLineValue}>${(subtotal || 0).toLocaleString()}</Text>
                            </View>
                            {discount > 0 && (
                                <View style={styles.summaryLine}>
                                    <Text style={styles.summaryLineLabel}>Descuento</Text>
                                    <Text style={[styles.summaryLineValue, { color: COLORS.success }]}>-${(discount || 0).toLocaleString()}</Text>
                                </View>
                            )}
                            {iva > 0 && (
                                <View style={styles.summaryLine}>
                                    <Text style={styles.summaryLineLabel}>IVA ({ivaPercent}%)</Text>
                                    <Text style={styles.summaryLineValue}>${(iva || 0).toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryTotalLine}>
                                <Text style={styles.summaryTotalLabel}>Total a Pagar</Text>
                                <Text style={styles.summaryTotalValue}>${(total || 0).toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>PAGOS PREVIOS</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.iconBox}>
                                <DollarSign size={18} color={initialPayment ? COLORS.success : COLORS.textSecondary} strokeWidth={1.5} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Abono inicial recibido ($)..."
                                placeholderTextColor={COLORS.textSecondary + '80'}
                                value={initialPayment}
                                onChangeText={setInitialPayment}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <View style={styles.iconBox}>
                                <FileText size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
                            </View>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Observaciones o notas de envío..."
                                placeholderTextColor={COLORS.textSecondary + '80'}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.btnSecondary} 
                    onPress={handlePreview}
                    disabled={saving}
                >
                    <Text style={styles.btnSecondaryText}>Vista Previa</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.btnPrimaryWrapper} 
                    onPress={handleSave} 
                    disabled={saving}
                >
                    <LinearGradient
                        colors={COLORS.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.btnPrimaryGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Check color="#fff" size={20} strokeWidth={2.5} />
                                <Text style={styles.btnPrimaryText}>{editingInvoice ? 'Actualizar Factura' : 'Crear Factura'}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Modal de Clientes */}
            <Modal visible={clientModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Buscar Cliente</Text>
                            <TouchableOpacity onPress={() => setClientModalVisible(false)} style={styles.closeModalBtn}>
                                <X color={COLORS.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchBox}>
                            <Search color={COLORS.textSecondary} size={20} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Escribe el nombre del cliente..."
                                placeholderTextColor={COLORS.textSecondary + '80'}
                                value={clientSearch}
                                onChangeText={setClientSearch}
                            />
                        </View>
                        <FlatList
                            data={clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => { setSelectedClient(item); setClientModalVisible(false); }}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                        <UserIcon color={COLORS.text} size={20} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </View>
                                    {selectedClient?.id === item.id && <Check color={COLORS.success} size={20} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal de Productos */}
            <Modal visible={productModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Agregar Producto</Text>
                            <TouchableOpacity onPress={() => setProductModalVisible(false)} style={styles.closeModalBtn}>
                                <X color={COLORS.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchBox}>
                            <Search color={COLORS.textSecondary} size={20} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Escribe el nombre del producto..."
                                placeholderTextColor={COLORS.textSecondary + '80'}
                                value={productSearch}
                                onChangeText={setProductSearch}
                            />
                        </View>
                        <FlatList
                            data={products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleAddItem(item)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(45, 212, 191, 0.1)' }]}>
                                        <Tag color={COLORS.success} size={20} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                        <Text style={styles.modalItemSub}>${(item.sale_price || 0).toLocaleString()} • Stock: {item.stock}</Text>
                                    </View>
                                    <Plus color={COLORS.success} size={20} />
                                </TouchableOpacity>
                            )}
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
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'rgba(10, 10, 12, 0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 220,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    labelRowItems: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    inputText: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    addSmallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    addSmallText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '600',
    },
    emptyItemsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    itemWrapper: {
        marginBottom: 12,
    },
    itemGlassCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    itemNameText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSkuText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    deleteIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 16,
    },
    footerInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    miniLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    miniQtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 44,
    },
    qtyBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniInput: {
        width: 50,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 0,
    },
    miniPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 44,
        paddingHorizontal: 12,
        flex: 1,
        minWidth: 120,
    },
    priceSymbol: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    miniPriceInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 0,
    },
    miniInputP: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 0,
        marginLeft: 4,
    },
    miniCurrency: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    itemTotalBox: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTotalText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    glassPanel: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 16,
    },
    smallInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        height: 36,
        width: 80,
    },
    smallInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 0,
    },
    smallInputSuffix: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginLeft: 2,
    },
    discountExpanded: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    discountTypeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    typeBtnText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    typeBtnTextActive: {
        color: COLORS.text,
        fontWeight: '600',
    },
    summaryPanel: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
        padding: 20,
        gap: 12,
    },
    summaryLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLineLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    summaryLineValue: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '500',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        marginVertical: 4,
    },
    summaryTotalLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    summaryTotalLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    summaryTotalValue: {
        color: COLORS.success,
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        backgroundColor: '#0a0a0c',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    btnSecondary: {
        flex: 1,
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnSecondaryText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    btnPrimaryWrapper: {
        flex: 2,
    },
    btnPrimaryGradient: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        maxHeight: '80%',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeModalBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    modalInput: {
        flex: 1,
        color: COLORS.text,
        marginLeft: 12,
        fontSize: 15,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalItemText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    modalItemSub: {
        color: COLORS.textSecondary,
        fontSize: 13,
    }
});
