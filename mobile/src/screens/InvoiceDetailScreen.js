import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Share, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Share2, Printer, Edit2, Send, Info, Trash2, DollarSign, CreditCard, ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../context/AuthContext';
import { useInvoices } from '../hooks/useInvoices';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PREMIUM_COLORS = {
    charcoal: '#0a0a0c',
    electricBlue: '#3b82f6',
    electricBlueDark: '#2563eb',
    emeraldPremium: '#10b981',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate800: '#1e293b',
    slate900: '#0f172a',
    paperLight: '#f8fafc',
    paperBlue: '#eff6ff',
};

export default function InvoiceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { invoice: initialInvoice, items: initialItems } = route.params || {};
    const { business } = useAuth();
    const { updateStatus, deleteInvoice, addPayment, fetchInvoiceItems } = useInvoices();
    
    const [invoice, setInvoice] = useState(initialInvoice);
    const [items, setItems] = useState(initialItems || []);
    const [isSaving, setIsSaving] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isLoadingItems, setIsLoadingItems] = useState(!initialItems);

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
        navigation.navigate('NewInvoice', { 
            editingInvoice: invoice, 
            editingItems: items 
        });
    };

    const handleEmit = async () => {
        if (invoice.id) {
            Alert.alert('Éxito', 'La factura ya ha sido emitida.');
            navigation.navigate('MainTabs');
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
            navigation.navigate('MainTabs');
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
        <View style={styles.container}>
            {/* Header Sticky con Acciones Premium */}
            <View style={styles.premiumHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                
                <View style={styles.actionNav}>
                    {invoice.status !== 'paid' && (
                        <>
                            <TouchableOpacity 
                                style={[styles.navItem, isLoadingItems && { opacity: 0.5 }]} 
                                onPress={handleEdit}
                                disabled={isLoadingItems}
                            >
                                <View style={styles.navIconBox}>
                                    {isLoadingItems ? (
                                        <ActivityIndicator size="small" color={PREMIUM_COLORS.slate400} />
                                    ) : (
                                        <Edit2 color={PREMIUM_COLORS.slate400} size={20} />
                                    )}
                                </View>
                                <Text style={styles.navLabel}>{isLoadingItems ? 'Cargando...' : 'Editar'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.navItem} onPress={() => setPaymentModalVisible(true)}>
                                <View style={styles.navIconBox}>
                                    <CreditCard color={PREMIUM_COLORS.emeraldPremium} size={20} />
                                </View>
                                <Text style={styles.navLabel}>Abonar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.centerAction} onPress={() => handleUpdateStatus('paid')}>
                                <View style={styles.centerIconBox}>
                                    <DollarSign color="#fff" size={24} />
                                </View>
                                <Text style={[styles.navLabel, { color: PREMIUM_COLORS.electricBlue, fontWeight: '800' }]}>Pagar</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.navItem} onPress={handleShare}>
                        <View style={styles.navIconBox}>
                            <Share2 color={PREMIUM_COLORS.slate400} size={20} />
                        </View>
                        <Text style={styles.navLabel}>Enviar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={handleDelete}>
                        <View style={styles.navIconBox}>
                            <Trash2 color="#ef4444" size={20} />
                        </View>
                        <Text style={styles.navLabel}>Eliminar</Text>
                    </TouchableOpacity>
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
                                <X color={PREMIUM_COLORS.slate400} size={24} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Pendiente:</Text>
                            <Text style={styles.paymentBalance}>$ {(Number(invoice.total || 0) - Number(invoice.amount_paid || 0)).toLocaleString()}</Text>
                        </View>

                        <TextInput
                            style={styles.paymentInput}
                            placeholder="Monto a abonar"
                            placeholderTextColor={PREMIUM_COLORS.slate500}
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
                                colors={[PREMIUM_COLORS.emeraldPremium, '#059669']}
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
        </View>
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
        backgroundColor: PREMIUM_COLORS.slate900,
    },
    premiumHeader: {
        paddingTop: 60,
        backgroundColor: COLORS.card,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    navLabel: {
        color: PREMIUM_COLORS.slate500,
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
        backgroundColor: PREMIUM_COLORS.electricBlue,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PREMIUM_COLORS.electricBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 3,
        borderColor: COLORS.card,
    },
    scrollContent: {
        padding: 24,
    },
    invoicePaper: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
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
        borderBottomColor: '#dbeafe',
        paddingBottom: 16,
        marginBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontWeight: '900',
        color: PREMIUM_COLORS.electricBlueDark,
        letterSpacing: -0.5,
    },
    nitLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate500,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 2,
    },
    companySub: {
        fontSize: 11,
        color: PREMIUM_COLORS.slate600,
        marginTop: 1,
    },
    metaInfoInline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    docLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate500,
        letterSpacing: 0.5,
    },
    docNumberSmall: {
        fontSize: 11,
        fontWeight: '900',
        color: PREMIUM_COLORS.slate900,
    },
    docDateSmall: {
        fontSize: 10,
        color: PREMIUM_COLORS.slate500,
        marginLeft: 4,
    },
    cardRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eff6ff',
        minHeight: 60,
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate400,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    clientName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate800,
    },
    clientNit: {
        fontSize: 11,
        color: PREMIUM_COLORS.slate600,
        marginTop: 2,
    },
    itemsContainer: {
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#eff6ff',
        paddingBottom: 10,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    tableLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate400,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(219, 234, 254, 0.5)',
        paddingHorizontal: 4,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: PREMIUM_COLORS.slate800,
    },
    itemQty: {
        fontSize: 13,
        color: PREMIUM_COLORS.slate600,
    },
    itemTotal: {
        fontSize: 13,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.slate900,
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
        color: PREMIUM_COLORS.slate500,
        textTransform: 'uppercase',
    },
    totalQtyValue: {
        fontSize: 14,
        fontWeight: '900',
        color: PREMIUM_COLORS.slate900,
        minWidth: 40,
        textAlign: 'center',
    },
    summaryContainer: {
        marginTop: 24,
        alignItems: 'flex-end',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#eff6ff',
        paddingTop: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 180,
    },
    summaryLabel: {
        fontSize: 13,
        color: PREMIUM_COLORS.slate500,
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: PREMIUM_COLORS.slate800,
    },
    totalBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 180,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: 'rgba(59, 130, 246, 0.2)',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '900',
        color: PREMIUM_COLORS.slate900,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: PREMIUM_COLORS.electricBlue,
    },
    footerSection: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#dbeafe',
        borderStyle: 'dashed',
    },
    legalNotice: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 16,
    },
    legalText: {
        fontSize: 11,
        color: PREMIUM_COLORS.slate400,
        fontStyle: 'italic',
        lineHeight: 16,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        paddingHorizontal: 24,
        paddingTop: 20,
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
        gap: 16,
    },
    editBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: PREMIUM_COLORS.electricBlue,
    },
    sendBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: PREMIUM_COLORS.electricBlue,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    sendGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    sendBtnText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    paymentInfo: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentLabel: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 14,
    },
    paymentBalance: {
        color: PREMIUM_COLORS.emeraldPremium,
        fontSize: 18,
        fontWeight: 'bold',
    },
    paymentInput: {
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    confirmPaymentBtn: {
        height: 56,
        borderRadius: 16,
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
