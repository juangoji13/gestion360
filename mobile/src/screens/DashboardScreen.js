import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Bell, Plus, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, LogOut, FileText, LayoutGrid, Receipt, Users, Settings2, PlusSquare, UserPlus } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useStats } from '../hooks/useStats';
import { useInvoices } from '../hooks/useInvoices';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const KPICard = ({ title, value, icon: Icon, color, growth, subtitle }) => (
    <View style={styles.glassCardKPI}>
        {/* Absolute blur spot background */}
        <View style={[styles.blurSpot, { backgroundColor: color + '15' }]} />

        <View style={styles.cardHeaderKPI}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon color={color} size={20} />
            </View>
            {growth && (
                <View style={[styles.growthBox, { backgroundColor: color + '15', borderColor: color + '20' }]}>
                    <Text style={[styles.growthText, { color: color }]}>{growth}</Text>
                </View>
            )}
        </View>

        <View style={styles.cardBodyKPI}>
            <Text style={styles.kpiLabel}>{title}</Text>
            <Text style={styles.kpiValueMainText}>{value}</Text>
        </View>
    </View>
);

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { signOut, user, business } = useAuth();
    const [range, setRange] = React.useState('7d');
    const { totalIncome, netProfit, pendingInvoices, paidInvoices, chartData, loading, error, refresh } = useStats();
    const { invoices, loading: loadingInvoices, refresh: refreshInvoices } = useInvoices();

    useFocusEffect(
        React.useCallback(() => {
            refresh(range);
            refreshInvoices();
        }, [range])
    );

    const recentInvoices = invoices.slice(0, 3);

    const RANGES = [
        { key: 'today', label: 'Hoy' },
        { key: '7d', label: '7 días' },
        { key: '30d', label: '30 días' },
        { key: 'all', label: 'Año' },
    ];

    if (loading && !totalIncome) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ color: COLORS.text, marginTop: 20 }}>Cargando diseño premium...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.stickyHeader}>
                <View style={styles.headerContent}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarBorder}>
                            <LinearGradient colors={[COLORS.primary + '66', COLORS.secondary + '66']} style={styles.avatarGradient}>
                                <View style={styles.avatarInner}>
                                    <View style={styles.avatarIconPlaceholder}>
                                        <User color={COLORS.text} size={22} />
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                        <View style={styles.businessInfo}>
                            <Text style={styles.businessSub}>{business?.name || 'TECH SOLUTIONS S.A.S'}</Text>
                            <Text style={styles.userNameText}>Hola, {user?.email?.split('@')[0] || 'Alejandro'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => console.log('Notificaciones')}>
                        <Bell color={COLORS.textSecondary} size={22} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refresh(range)} tintColor={COLORS.primary} />}>
                <View style={styles.rangeBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeInner}>
                        {RANGES.map((r) => (
                            <TouchableOpacity key={r.key} style={[styles.rangeItem, range === r.key && styles.rangeItemActive]} onPress={() => setRange(r.key)}>
                                <Text style={[styles.rangeText, range === r.key && styles.rangeTextActive]}>{r.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                {error && (
                    <View style={styles.errorCard}>
                        <AlertCircle color={COLORS.danger} size={18} />
                        <Text style={styles.errorMsg}>{error}</Text>
                    </View>
                )}
                <View style={styles.kpiGrid}>
                    <KPICard title="Ingresos Totales" value={`$${(totalIncome || 0).toLocaleString()}`} icon={DollarSign} color={COLORS.primary} />
                    <KPICard title="Ganancia Neta" value={`$${(netProfit || 0).toLocaleString()}`} icon={TrendingUp} color={COLORS.secondary} />
                    <KPICard title="Facturas Pendientes" value={(pendingInvoices || 0).toString()} icon={Clock} color={COLORS.accent} />
                    <KPICard title="Facturas Pagadas" value={(paidInvoices || 0).toString()} icon={CheckCircle} color={COLORS.success} />
                </View>
                <View style={styles.chartGlassCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Ingresos vs Ganancias</Text>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendDotBox}>
                                <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                                <Text style={styles.dotLabel}>INGR.</Text>
                            </View>
                            <View style={styles.legendDotBox}>
                                <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
                                <Text style={styles.dotLabel}>GAN.</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.chartContainer}>
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <LineChart
                                data={chartData}
                                width={width - 84}
                                height={180}
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'rgba(15, 23, 42, 0)',
                                    backgroundGradientTo: 'rgba(15, 23, 42, 0)', // Totalmente traslúcido
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald primary color
                                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                                    style: { borderRadius: 16 },
                                    propsForDots: { 
                                        r: "5", 
                                        strokeWidth: "2", 
                                        stroke: COLORS.background 
                                    },
                                    propsForBackgroundLines: { 
                                        strokeDasharray: "5", 
                                        stroke: "rgba(255,255,255,0.03)" 
                                    }
                                }}
                                bezier
                                style={{ 
                                    marginVertical: 8, 
                                    borderRadius: 16, 
                                    marginLeft: -12,
                                }}
                                withInnerLines={true}
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines={true}
                                withShadow={true}
                                withDots={true}
                            />
                        )}
                    </View>
                </View>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.bigActionBtnPrimary} onPress={() => navigation.navigate('NewInvoice')}>
                        <PlusSquare color={COLORS.background} size={32} />
                        <Text style={styles.bigActionTextPrimary}>Nueva Factura</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bigActionBtnGlass} onPress={() => navigation.navigate('ClientEdit')}>
                        <UserPlus color={COLORS.secondary} size={32} />
                        <Text style={styles.bigActionTextGlass}>Nuevo Cliente</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.recentPanel}>
                    <View style={styles.panelHeader}>
                        <Text style={styles.panelTitle}>Actividad Reciente</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Facturas')}>
                            <Text style={styles.viewAllText}>VER TODO</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityList}>
                        {loadingInvoices && !recentInvoices.length ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : recentInvoices.length === 0 ? (
                            <Text style={styles.emptyActivity}>No hay actividad reciente</Text>
                        ) : (
                            recentInvoices.map((inv) => (
                                <RecentItem key={inv.id} item={inv} onPress={() => navigation.navigate('Facturas')} />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const RecentItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.recentItem} onPress={onPress}>
        <View style={styles.itemLeft}>
            <View style={[styles.itemIconBox, { backgroundColor: item.status === 'paid' ? COLORS.primary + '15' : COLORS.accent + '15' }]}>
                <FileText color={item.status === 'paid' ? COLORS.primary : COLORS.accent} size={20} />
            </View>
            <View>
                <Text style={styles.itemTitle}>{item.invoice_number}</Text>
                <Text style={styles.itemMeta}>HACE POCO</Text>
            </View>
        </View>
        <View style={styles.itemRight}>
            <Text style={styles.itemValue}>${(item.total || 0).toLocaleString()}</Text>
            <Text style={[styles.itemStatus, { color: item.status === 'paid' ? COLORS.primary : COLORS.accent }]}>
                {item.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
            </Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    stickyHeader: {
        backgroundColor: 'rgba(18, 18, 20, 0.85)',
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        zIndex: 100,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarBorder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        padding: 1,
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInner: {
        width: '94%',
        height: '94%',
        borderRadius: 24,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarIconPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    businessInfo: {
        gap: 1,
    },
    businessSub: {
        color: '#64748b', // slate-500
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    userNameText: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    actionIconBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 100,
    },
    rangeBar: {
        marginBottom: 28,
    },
    rangeInner: {
        paddingHorizontal: 20,
        gap: 8,
    },
    rangeItem: {
        paddingHorizontal: 26,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rangeItemActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    rangeText: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '700',
    },
    rangeTextActive: {
        color: COLORS.background,
    },
    errorCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    errorMsg: {
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: '600',
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    glassCardKPI: {
        width: '47.5%',
        height: 124,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    blurSpot: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.8,
    },
    cardHeaderKPI: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    growthBox: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
    },
    growthText: {
        fontSize: 10,
        fontWeight: '800',
    },
    cardBodyKPI: {
        gap: 2,
    },
    kpiLabel: {
        color: '#94a3b8', // slate-400
        fontSize: 11,
        fontWeight: '600',
    },
    kpiValueMainText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -1,
    },
    chartGlassCard: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 28,
        padding: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 28,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    chartTitle: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    chartLegend: {
        flexDirection: 'row',
        gap: 14,
    },
    legendDotBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    dotLabel: {
        color: '#64748b',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    chartContainer: {
        height: 180,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: -16,
    },
    xLabel: {
        color: '#475569', // slate-600
        fontSize: 10,
        fontWeight: '800',
    },
    quickActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 36,
    },
    bigActionBtnPrimary: {
        flex: 1,
        backgroundColor: COLORS.primary,
        height: 108,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    bigActionBtnGlass: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        height: 108,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    bigActionTextPrimary: {
        color: COLORS.background,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    bigActionTextGlass: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    recentPanel: {
        paddingHorizontal: 20,
        gap: 16,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    panelTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    linkText: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    activityList: {
        gap: 14,
    },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 18,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    itemIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    itemMeta: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: 2,
    },
    itemValue: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    itemStatus: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    emptyActivity: {
        color: '#94a3b8',
        textAlign: 'center',
        paddingVertical: 30,
        fontSize: 14,
    },
});
