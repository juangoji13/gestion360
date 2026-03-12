import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { 
    ChevronLeft, TrendingUp, DollarSign, PieChart, Clock, 
    ShoppingBag, ArrowUpRight, MessageCircle, Phone, MapPin, 
    FileText, UserRoundPen, Edit 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { ReportService } from '../services/ReportService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const PREMIUM_COLORS = {
    charcoal: '#0a0a0c',
    electricBlue: '#2563eb',
    emeraldPremium: '#10b981',
    glassWhite: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    slate400: '#94a3b8',
    slate500: '#64748b',
    warningYellow: '#eab308',
    slate300: '#cbd5e1',
};

const KPICard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <View style={styles.kpiCard}>
        <View style={styles.kpiHeader}>
            <View style={[styles.kpiIconBox, { backgroundColor: `${color}15` }]}>
                <Icon color={color} size={20} />
            </View>
            {trend && (
                <View style={styles.trendBadge}>
                    <TrendingUp color={PREMIUM_COLORS.emeraldPremium} size={12} />
                    <Text style={styles.trendText}>{trend}</Text>
                </View>
            )}
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={styles.kpiSubtext}>{subtext}</Text>
    </View>
);

export default function ClientDashboardScreen({ route, navigation }) {
    const { client: initialClient } = route.params;
    const { business } = useAuth();
    const { invoices, loading, fetchInvoices } = useInvoices();
    const { clients } = useClients();
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Obtener el cliente actualizado de la lista global
    const client = clients.find(c => c.id === initialClient.id) || initialClient;

    const [stats, setStats] = useState({
        totalSales: 0,
        netProfit: 0,
        margin: 0,
        pendingBalance: client.balance || 0,
        invoiceCount: 0
    });

    useEffect(() => {
        calculateStats();
    }, [invoices, client]);

    const calculateStats = async () => {
        const clientInvoices = invoices.filter(inv => inv.client_id === client.id);
        const totalSales = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        
        // Calcular utilidad real sumando todos los items
        let totalProfit = 0;
        clientInvoices.forEach(inv => {
            if (inv.invoice_items) {
                inv.invoice_items.forEach(item => {
                    const price = parseFloat(item.unit_price) || 0;
                    const cost = parseFloat(item.purchase_price) || 0;
                    const qty = parseFloat(item.quantity) || 0;
                    totalProfit += (price - cost) * qty;
                });
            }
        });

        const margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

        setStats({
            totalSales,
            netProfit: totalProfit,
            margin,
            pendingBalance: client.balance || 0,
            invoiceCount: clientInvoices.length
        });
    };

    const handleRefresh = () => {
        fetchInvoices();
    };

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        await ReportService.generateClientReport(business, client, invoices);
        setIsGenerating(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['rgba(37, 99, 235, 0.12)', 'transparent']} style={styles.bgGradient} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <View style={styles.clientProfileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName} numberOfLines={1}>{client.name}</Text>
                        <Text style={styles.clientDoc}>{client.tax_id || 'ID no registrado'}</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        style={styles.actionBtnHeader}
                        onPress={() => navigation.navigate('ClientEdit', { client })}
                    >
                        <Edit color={PREMIUM_COLORS.slate300} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionBtnHeader, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}
                        onPress={handleGeneratePDF}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <ActivityIndicator size="small" color={PREMIUM_COLORS.electricBlue} /> : <FileText color={PREMIUM_COLORS.electricBlue} size={20} />}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={PREMIUM_COLORS.electricBlue} />}
            >
                {/* Contact Quick Info */}
                <View style={styles.contactBar}>
                    <View style={styles.contactItem}>
                        <Phone color={PREMIUM_COLORS.slate500} size={14} />
                        <Text style={styles.contactText}>{client.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <MapPin color={PREMIUM_COLORS.slate500} size={14} />
                        <Text style={styles.contactText}>{client.address || 'Sin dirección'}</Text>
                    </View>
                </View>

                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCol}>
                        <KPICard 
                            title="Total Facturado" 
                            value={`$${stats.totalSales.toLocaleString()}`}
                            subtext={`${stats.invoiceCount} Facturas`}
                            icon={ShoppingBag}
                            color={PREMIUM_COLORS.electricBlue}
                        />
                        <KPICard 
                            title="Margen Promedio" 
                            value={`${stats.margin.toFixed(1)}%`}
                            subtext="Rendimiento neto"
                            icon={PieChart}
                            color={PREMIUM_COLORS.warningYellow}
                        />
                    </View>
                    <View style={styles.kpiCol}>
                        <KPICard 
                            title="Utilidad Neta" 
                            value={`$${stats.netProfit.toLocaleString()}`}
                            subtext="Basado en costos"
                            icon={TrendingUp}
                            color={PREMIUM_COLORS.emeraldPremium}
                        />
                        <KPICard 
                            title="Saldo Pendiente" 
                            value={`$${stats.pendingBalance.toLocaleString()}`}
                            subtext="Por cobrar"
                            icon={Clock}
                            color="#ef4444"
                        />
                    </View>
                </View>

                {/* Recent Activity Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Facturas' })}>
                        <Text style={styles.seeAllText}>Ver todas</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color={PREMIUM_COLORS.electricBlue} style={{ marginTop: 20 }} />
                ) : (
                    invoices.filter(inv => inv.client_id === client.id).slice(0, 5).map((inv, idx) => (
                        <TouchableOpacity 
                            key={inv.id} 
                            style={styles.activityCard}
                            onPress={() => navigation.navigate('InvoiceDetail', { invoice: inv })}
                        >
                            <View style={styles.activityIconBox}>
                                <DollarSign color={inv.status === 'paid' ? PREMIUM_COLORS.emeraldPremium : PREMIUM_COLORS.warningYellow} size={18} />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>Factura {inv.invoice_number}</Text>
                                <Text style={styles.activityDate}>{new Date(inv.created_at).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.activityRight}>
                                <Text style={styles.activityAmount}>${inv.total.toLocaleString()}</Text>
                                <Text style={[styles.activityStatus, { color: inv.status === 'paid' ? PREMIUM_COLORS.emeraldPremium : PREMIUM_COLORS.warningYellow }]}>
                                    {inv.status === 'paid' ? 'Pagada' : 'Pendiente'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PREMIUM_COLORS.charcoal,
    },
    bgGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    clientProfileHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarLarge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: PREMIUM_COLORS.electricBlue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    clientName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clientDoc: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtnHeader: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    contactBar: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 13,
    },
    kpiGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    kpiCol: {
        flex: 1,
        gap: 16,
    },
    kpiCard: {
        backgroundColor: PREMIUM_COLORS.glassWhite,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: PREMIUM_COLORS.glassBorder,
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    kpiIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    kpiValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    kpiTitle: {
        color: PREMIUM_COLORS.slate400,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    kpiSubtext: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 11,
        marginTop: 4,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    trendText: {
        color: PREMIUM_COLORS.emeraldPremium,
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    seeAllText: {
        color: PREMIUM_COLORS.electricBlue,
        fontSize: 13,
        fontWeight: '600',
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    activityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    activityDate: {
        color: PREMIUM_COLORS.slate500,
        fontSize: 12,
        marginTop: 2,
    },
    activityRight: {
        alignItems: 'flex-end',
    },
    activityAmount: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    activityStatus: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    }
});
