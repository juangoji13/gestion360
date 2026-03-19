import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Share, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Share2, Printer, Edit2, Send, Info, Trash2, DollarSign, CreditCard, ChevronLeft, Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../context/AuthContext';
import { useInvoices } from '../hooks/useInvoices';
import { COLORS, SIZES, PREMIUM_COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function InvoiceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { invoice: initialInvoice, items: initialItems, isPreview } = route.params || {};
    const { business } = useAuth();
    const { updateStatus, deleteInvoice, addPayment, fetchInvoiceItems, createInvoice } = useInvoices();
    
    const [invoice, setInvoice] = useState(initialInvoice);
    const [items, setItems] = useState(initialItems || []);
    const [isSaving, setIsSaving] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isLoadingItems, setIsLoadingItems] = useState(!initialItems);

    React.useEffect(() => {
        if (isPreview) {
            navigation.setOptions({
                headerLeft: () => null,
                title: 'Vista Previa'
            });
        }
    }, [isPreview, navigation]);

    React.useEffect(() => {
        if (!initialItems && invoice?.id) {
            loadItems();
        }
    }, []);

    const loadItems = async () => {
        setIsLoadingItems(true);
        const data = await fetchInvoiceItems(invoice.id);
        setItems(data);
        setIsLoadingItems(false);
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setIsSaving(true);
            await updateStatus(invoice.id, newStatus);
            setInvoice({ ...invoice, status: newStatus });
            Alert.alert('Éxito', `Factura marcada como ${newStatus === 'paid' ? 'Pagada' : 'Pendiente'}`);
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmar Eliminación',
            '¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSaving(true);
                            await deleteInvoice(invoice.id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la factura.');
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAddPayment = async () => {
        if (!paymentAmount || isNaN(paymentAmount)) return;
        try {
            setIsSaving(true);
            await addPayment(invoice.id, invoice.amount_paid, paymentAmount);
            setInvoice({ ...invoice, amount_paid: (Number(invoice.amount_paid || 0) + Number(paymentAmount)) });
            setPaymentModalVisible(false);
            setPaymentAmount('');
            Alert.alert('Éxito', 'Abono registrado correctamente');
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el abono.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = () => {
        if (isPreview) {
            navigation.goBack();
        } else {
            navigation.navigate('NewInvoice', { 
                editingInvoice: invoice, 
                editingItems: items 
            });
        }
    };

    const handleEmit = async () => {
        if (invoice.id && !isPreview) {
            Alert.alert('Éxito', 'La factura ya ha sido emitida.');
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
            return;
        }

        try {
            setIsSaving(true);
            
            const invoiceData = {
                business_id: invoice.business_id,
                client_id: invoice.client_id,
                invoice_number: invoice.invoice_number,
                status: 'pending',
                total: invoice.total,
                subtotal: invoice.subtotal,
                tax_amount: invoice.tax_amount,
                discount_amount: invoice.discount_amount
            };

            const invoiceItems = items.map(it => ({
                product_id: it.product_id,
                quantity: it.quantity,
                unit_price: it.price || it.unit_price,
                total: (it.price || it.unit_price) * it.quantity
            }));

            await createInvoice(invoiceData, invoiceItems);
            
            Alert.alert('Éxito', 'Factura emitida correctamente');
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            console.error('Error al emitir factura:', error);
            Alert.alert('Error', 'No se pudo emitir la factura. Inténtelo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        try {
            const html = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #000; background-color: #fff; line-height: 1.4; }
                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                            .business-name { font-size: 26px; font-weight: 900; color: #000; margin: 0; text-transform: uppercase; }
                            .business-info { font-size: 12px; color: #334155; margin-top: 8px; font-weight: 500; }
                            .invoice-meta { text-align: right; }
                            .invoice-title { font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; margin: 0; letter-spacing: 1px; }
                            .invoice-number { font-size: 22px; font-weight: 900; color: #000; margin: 5px 0; }
                            .client-section { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 2px solid #000; }
                            .section-label { font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #000; display: inline-block; }
                            .client-name { font-size: 16px; font-weight: bold; color: #000; margin-top: 5px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { text-align: left; font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; border-bottom: 2px solid #000; padding: 12px 5px; }
                            td { padding: 15px 5px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #000; }
                            .text-right { text-align: right; }
                            .text-center { text-center; }
                            .summary-container { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; margin-top: 20px; }
                            .summary-row { display: flex; justify-content: space-between; width: 250px; font-size: 14px; color: #334155; font-weight: 600; }
                            .total-row { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 15px 0; margin-top: 10px; color: #000; font-weight: 900; font-size: 22px; width: 250px; }
                            .footer { margin-top: 60px; border-top: 1px dashed #000; padding-top: 20px; font-size: 11px; color: #475569; font-style: italic; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <h1 class="business-name">${business?.name || 'Gestion360'}</h1>
                                <div class="business-info">
                                    ${business?.id_number ? `<div>NIT: ${business.id_number}</div>` : ''}
                                    ${business?.address ? `<div>${business.address}</div>` : ''}
                                    ${business?.phone ? `<div>Tel: ${business.phone}</div>` : ''}
                                </div>
                            </div>
                            <div class="invoice-meta">
                                <p class="invoice-title">Factura de Venta</p>
                                <p class="invoice-number">#${invoice.invoice_number}</p>
                                <p style="font-size: 18px; font-weight: bold; color: #000103ff;">${new Date(invoice.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div class="client-section">
                            <div class="section-label">Cliente</div>
                            <div class="client-name">${invoice.client?.name || 'Cliente Genérico'}</div>
                            ${invoice.client?.id_number ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">NIT: ${invoice.client.id_number}</div>` : ''}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 60%;">Producto</th>
                                    <th style="width: 15%;" class="text-center">Cant</th>
                                    <th style="width: 25%;" class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items?.map(it => `
                                    <tr>
                                        <td>${it.name}</td>
                                        <td class="text-center">${it.quantity}</td>
                                        <td class="text-right">$ ${(Number(it.quantity || 0) * (Number(it.price || 0) || Number(it.unit_price || 0))).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="summary-container">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span>$ ${(Number(invoice.subtotal) || 0).toLocaleString()}</span>
                            </div>
                            ${invoice.discount_amount > 0 ? `
                                <div class="summary-row" style="color: #10b981;">
                                    <span>Descuento</span>
                                    <span>-$ ${(Number(invoice.discount_amount) || 0).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            ${invoice.tax_amount > 0 ? `
                                <div class="summary-row">
                                    <span>IVA (19%)</span>
                                    <span>$ ${(Number(invoice.tax_amount) || 0).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            <div class="summary-row total-row">
                                <span>TOTAL</span>
                                <span>$ ${(Number(invoice.total) || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="footer">
                            Gracias por su compra. Esta factura ha sido generada por ${business?.name || 'Gestion360'}.
                        </div>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            
            // Personalizar nombre del archivo: FAC-001_11-3-26.pdf
            const now = new Date();
            const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear().toString().slice(-2)}`;
            const fileName = `${invoice.invoice_number}_${dateStr}.pdf`.replace(/\s+/g, '_');
            const newUri = `${FileSystem.cacheDirectory}${fileName}`;
            
            await FileSystem.moveAsync({
                from: uri,
                to: newUri
            });

            await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
            console.error(error.message);
        }
    };

    if (!invoice) return null;

    return (
        <LinearGradient 
            colors={COLORS.darkGradient} 
            style={styles.container}
        >
            <View style={styles.topBlur} />

            {/* Header Sticky con Acciones Premium */}
            <View style={styles.premiumHeader}>
                {!isPreview && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color="#fff" size={24} />
                    </TouchableOpacity>
                )}
                
                <View style={styles.actionNav}>
                    {isPreview ? (
                        <>
                            <TouchableOpacity 
                                style={styles.navItem} 
                                onPress={handleEdit}
                            >
                                <View style={styles.navIconBox}>
                                    <Edit2 color={COLORS.textSecondary} size={20} />
                                </View>
                                <Text style={styles.navLabel}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.navItem} onPress={handleShare}>
                                <View style={styles.navIconBox}>
                                    <Send color={COLORS.textSecondary} size={20} />
                                </View>
                                <Text style={styles.navLabel}>Enviar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.navItem} 
                                onPress={handleEmit}
                                disabled={isSaving}
                            >
                                <View style={styles.navIconBox}>
                                    {isSaving ? (
                                        <ActivityIndicator color={COLORS.textSecondary} size="small" />
                                    ) : (
                                        <Check color={COLORS.textSecondary} size={20} />
                                    )}
                                </View>
                                <Text style={styles.navLabel}>Emitir</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {invoice.status !== 'paid' && (
                                <>
                                    <TouchableOpacity 
                                        style={[styles.navItem, isLoadingItems && { opacity: 0.5 }]} 
                                        onPress={handleEdit}
                                        disabled={isLoadingItems}
                                    >
                                        <View style={styles.navIconBox}>
                                            {isLoadingItems ? (
                                                <ActivityIndicator size="small" color={COLORS.textSecondary} />
                                            ) : (
                                                <Edit2 color={COLORS.textSecondary} size={20} />
                                            )}
                                        </View>
                                        <Text style={styles.navLabel}>{isLoadingItems ? 'Cargando...' : 'Editar'}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.navItem} onPress={() => setPaymentModalVisible(true)}>
                                        <View style={styles.navIconBox}>
                                            <CreditCard color={COLORS.success} size={20} />
                                        </View>
                                        <Text style={styles.navLabel}>Abonar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.centerAction} onPress={() => handleUpdateStatus('paid')}>
                                        <View style={styles.centerIconBox}>
                                            <DollarSign color="#fff" size={24} />
                                        </View>
                                        <Text style={[styles.navLabel, { color: COLORS.success, fontWeight: '800' }]}>Pagar</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity style={styles.navItem} onPress={handleShare}>
                                <View style={styles.navIconBox}>
                                    <Share2 color={COLORS.textSecondary} size={20} />
                                </View>
                                <Text style={styles.navLabel}>Enviar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.navItem} onPress={handleDelete}>
                                <View style={styles.navIconBox}>
                                    <Trash2 color={COLORS.danger} size={20} />
                                </View>
                                <Text style={styles.navLabel}>Eliminar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Invoice Paper Component */}
                <LinearGradient 
                    colors={[PREMIUM_COLORS.paperLight, PREMIUM_COLORS.paperBlue]} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.invoicePaper}
                >
                    {/* Header Section: Business Info */}
                    <View style={styles.topSection}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>{business?.name || 'Mi Negocio'}</Text>
                            {business?.id_number && <Text style={styles.nitLabel}>NIT: {business.id_number}</Text>}
                            {business?.address && <Text style={styles.companySub}>{business.address}</Text>}
                            {business?.phone && <Text style={styles.companySub}>Tel: {business.phone}</Text>}
                            
                            {/* Meta Info aligned below business info as requested */}
                            <View style={styles.metaInfoInline}>
                                <Text style={styles.docLabel}>FACTURA DE VENTA </Text>
                                <Text style={styles.docNumberSmall}>#{invoice.invoice_number}</Text>
                                <Text style={styles.docDateSmall}>
                                 - {new Date(invoice.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Client Card */}
                    <View style={styles.cardRow}>
                        <View style={[styles.infoCard, { flex: 1 }]}>
                            <Text style={styles.cardLabel}>CLIENTE</Text>
                            <Text style={styles.clientName}>{invoice.client?.name || 'Cliente Genérico'}</Text>
                            {invoice.client?.id_number && <Text style={styles.clientNit}>NIT: {invoice.client.id_number}</Text>}
                        </View>
                    </View>

                    {/* Items Table with Quantity Total */}
                    <View style={styles.itemsContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableLabel, { flex: 7 }]}>PRODUCTO</Text>
                            <Text style={[styles.tableLabel, { flex: 2, textAlign: 'center' }]}>CANT</Text>
                            <Text style={[styles.tableLabel, { flex: 3, textAlign: 'right' }]}>TOTAL</Text>
                        </View>
                        {items?.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.itemName, { flex: 7 }]}>{item.name}</Text>
                                <Text style={[styles.itemQty, { flex: 2, textAlign: 'center' }]}>{item.quantity}</Text>
                                <Text style={[styles.itemTotal, { flex: 3, textAlign: 'right' }]}>$ {(Number(item.quantity || 0) * (Number(item.price || 0) || Number(item.unit_price || 0))).toLocaleString()}</Text>
                            </View>
                        ))}
                        {/* Summary of Quantities */}
                        <View style={styles.totalQtyRow}>
                            <Text style={styles.totalQtyLabel}>Cantidad Total:</Text>
                            <Text style={styles.totalQtyValue}>{items?.reduce((sum, it) => sum + Number(it.quantity || 0), 0)}</Text>
                        </View>
                    </View>

                    {/* Summary Section */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>$ ${(Number(invoice.subtotal) || 0).toLocaleString()}</Text>
                        </View>
                        {invoice.discount_amount > 0 && (
                            <View style={styles.summaryItem}>
                                <Text style={[styles.summaryLabel, { color: PREMIUM_COLORS.emeraldPremium }]}>Descuento:</Text>
                                <Text style={[styles.summaryValue, { color: PREMIUM_COLORS.emeraldPremium }]}>-$ ${(Number(invoice.discount_amount) || 0).toLocaleString()}</Text>
                            </View>
                        )}
                        {invoice.tax_amount > 0 && (
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>IVA (19%):</Text>
                                <Text style={styles.summaryValue}>$ ${(Number(invoice.tax_amount) || 0).toLocaleString()}</Text>
                            </View>
                        )}
                        <View style={styles.totalBlock}>
                            <Text style={styles.totalLabel}>TOTAL:</Text>
                            <Text style={styles.totalValue}>$ {Number(invoice.total || 0).toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Footer / Legal */}
                    <View style={styles.footerSection}>
                        <View style={styles.legalNotice}>
                            <Info color={PREMIUM_COLORS.slate400} size={14} />
                            <Text style={styles.legalText}>
                                Gracias por su compra, factura emitida por {business?.name || 'Gestion360'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Floating Actions */}
            {!isPreview && (
                <View style={styles.bottomBar}>
                    <BlurBackground />
                    <View style={[styles.actionRow, invoice.status === 'paid' && { justifyContent: 'center' }]}>
                        {invoice.status !== 'paid' && (
                            <TouchableOpacity 
                                style={[styles.editBtn, isLoadingItems && { opacity: 0.5 }]} 
                                onPress={handleEdit}
                                disabled={isLoadingItems}
                            >
                                {isLoadingItems ? (
                                    <ActivityIndicator size="small" color={PREMIUM_COLORS.electricBlue} />
                                ) : (
                                    <Edit2 color={PREMIUM_COLORS.electricBlue} size={20} />
                                )}
                                <Text style={styles.editBtnText}>{isLoadingItems ? 'Cargando...' : 'Editar'}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.sendBtn, isSaving && { opacity: 0.7 }, invoice.status === 'paid' && { flex: 0, width: '100%' }]}
                            onPress={handleShare}
                            disabled={isSaving}
                        >
                            <LinearGradient 
                                colors={[PREMIUM_COLORS.electricBlue, PREMIUM_COLORS.electricBlueDark]}
                                style={styles.sendGradient}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Share2 color="#fff" size={20} />
                                        <Text style={styles.sendBtnText}>Compartir PDF</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* Modal para Abonar */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={paymentModalVisible}
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Registrar Abono</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Pendiente:</Text>
                            <Text style={styles.paymentBalance}>$ {(Number(invoice.total || 0) - Number(invoice.amount_paid || 0)).toLocaleString()}</Text>
                        </View>

                        <TextInput
                            style={styles.paymentInput}
                            placeholder="Monto a abonar"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="numeric"
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            autoFocus
                        />

                        <TouchableOpacity 
                            style={styles.confirmPaymentBtn}
                            onPress={handleAddPayment}
                            disabled={isSaving || !paymentAmount}
                        >
                            <LinearGradient 
                                colors={[COLORS.success, '#059669']}
                                style={styles.paymentGradient}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.paymentBtnText}>Confirmar Abono</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </LinearGradient>
    );
}

const BlurBackground = () => (
    <View style={styles.blurWrapper}>
        <LinearGradient 
            colors={['transparent', 'rgba(15, 23, 42, 0.95)']} 
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} 
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.4,
        backgroundColor: COLORS.success + '10',
        opacity: 0.5,
    },
    premiumHeader: {
        paddingTop: 60,
        backgroundColor: '#0a0a0c',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        marginBottom: 16,
        paddingLeft: 4,
    },
    actionNav: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    navItem: {
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    navIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    centerAction: {
        alignItems: 'center',
        gap: 6,
        flex: 1.2,
        marginTop: -20,
    },
    centerIconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.success,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 3,
        borderColor: '#0a0a0c',
    },
    scrollContent: {
        padding: 24,
    },
    invoicePaper: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 15,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 16,
        marginBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    nitLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 2,
    },
    companySub: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 1,
    },
    metaInfoInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#f8fafc',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    docLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 0.5,
    },
    docNumberSmall: {
        fontSize: 11,
        fontWeight: '900',
        color: '#0f172a',
    },
    docDateSmall: {
        fontSize: 10,
        color: '#64748b',
        marginLeft: 4,
    },
    cardRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        minHeight: 60,
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    clientName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    clientNit: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    itemsContainer: {
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 10,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    tableLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
        paddingHorizontal: 4,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    itemQty: {
        fontSize: 13,
        color: '#64748b',
    },
    itemTotal: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    totalQtyRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        gap: 12,
    },
    totalQtyLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    totalQtyValue: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f172a',
        minWidth: 40,
        textAlign: 'center',
    },
    summaryContainer: {
        marginTop: 24,
        alignItems: 'flex-end',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 180,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    totalBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 180,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#f1f5f9',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f172a',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.success,
    },
    footerSection: {
        marginTop: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    legalNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
    },
    legalText: {
        fontSize: 10,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    blurWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editBtn: {
        flex: 1,
        height: 54,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editBtnText: {
        color: COLORS.success,
        fontSize: 15,
        fontWeight: 'bold',
    },
    sendBtn: {
        flex: 2,
        height: 54,
        borderRadius: 18,
        overflow: 'hidden',
    },
    sendGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    sendBtnText: {
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
        backgroundColor: '#0a0a0c',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
    paymentInfo: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    paymentLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    paymentBalance: {
        color: COLORS.warning,
        fontSize: 24,
        fontWeight: 'bold',
    },
    paymentInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    confirmPaymentBtn: {
        height: 54,
        borderRadius: 18,
        overflow: 'hidden',
    },
    paymentGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
