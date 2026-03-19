import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { User, Bell, Plus, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle, LogOut, FileText, LayoutGrid, Receipt, Users, Settings2, PlusSquare, UserPlus, ArrowRightLeft, Wallet } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useStats } from '../hooks/useStats';
import { useInvoices } from '../hooks/useInvoices';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MasterBalanceCard = ({ total, profit, pending, prevTotal, range, chartData }) => {
    const width = Dimensions.get('window').width - 40;
    const height = 110;
    const sparkData = (chartData?.datasets?.[0]?.data || [0, 0, 0, 0]).map(v => v || 0);
    const maxVal = Math.max(...sparkData, 1);
    
    // Smooth SVG Path logic (Bézier Approximation)
    const points = sparkData.map((val, i) => {
        const x = (i / Math.max(1, sparkData.length - 1)) * width;
        const y = height - ((val / maxVal) * (height * 0.7)) - 15;
        return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    if (points.length > 2) {
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
        }
        d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    } else {
        d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    }

    const growth = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
    const isPositive = growth >= 0;

    return (
        <View style={styles.masterCardWrapper}>
            <LinearGradient colors={COLORS.primaryGradient} style={styles.masterCard}>
                <View style={styles.masterHeader}>
                    <View>
                        <Text style={styles.masterLabel}>Balance Total Cobrado</Text>
                        <Text style={styles.masterValue}>${(total || 0).toLocaleString()}</Text>
                    </View>
                    <View style={[styles.masterBadge, { backgroundColor: isPositive ? COLORS.success + '15' : COLORS.danger + '15' }]}>
                        {isPositive ? <TrendingUp size={14} color={COLORS.success} /> : <TrendingDown size={14} color={COLORS.danger} />}
                        <Text style={[styles.masterBadgeText, { color: isPositive ? COLORS.success : COLORS.danger }]}>
                            {Math.abs(growth).toFixed(1)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.masterChartContainer}>
                    <Svg width={width} height={height}>
                        <Defs>
                            <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor={COLORS.secondary} stopOpacity="0.05" />
                                <Stop offset="0.5" stopColor={COLORS.secondary} stopOpacity="0.4" />
                                <Stop offset="1" stopColor={COLORS.secondary} stopOpacity="0.05" />
                            </SvgGradient>
                        </Defs>
                        <Path d={d} stroke="url(#lineGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    </Svg>
                </View>

                <View style={styles.masterFooter}>
                    <View style={styles.footerItem}>
                        <View style={[styles.footerIcon, { backgroundColor: COLORS.info + '20' }]}>
                            <TrendingUp size={12} color={COLORS.info} />
                        </View>
                        <Text style={styles.footerLabel}>Ganancia: </Text>
                        <Text style={styles.footerValue}>${(profit || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <View style={[styles.footerIcon, { backgroundColor: COLORS.warning + '20' }]}>
                            <Wallet size={12} color={COLORS.warning} />
                        </View>
                        <Text style={styles.footerLabel}>Por Cobrar:</Text>
                        <Text style={styles.footerValue}>${(pending || 0).toLocaleString()}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const QuickAction = ({ icon: Icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7} onPress={onPress}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
            <Icon color={color} size={22} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
);

export default function DashboardScreen() {
    const navigation = useNavigation();
    const { signOut, user, business } = useAuth();
    const [range, setRange] = React.useState('7d');
    const { totalIncome, totalPending, netProfit, prevTotalIncome, prevNetProfit, inventoryInvestment, pendingCount, paidCount, chartData, loading, error, refresh } = useStats();
    const { invoices, loading: loadingInvoices, refresh: refreshInvoices } = useInvoices();

    // Refrescar cuando el rango cambia
    React.useEffect(() => {
        refresh(range);
    }, [range]);

    // Refrescar cuando la pantalla gana foco (ej. vuelve de crear factura)
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

    // Only show a blocking loader on the very first mount if we have absolutely no totals yet.
    // For updates or when returning from other screens, we refresh "silently" to avoid flicker.
    const isInitialLoading = loading && totalIncome === undefined && !invoices.length;

    if (isInitialLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <LinearGradient colors={COLORS.darkGradient} style={styles.container}>

            <View style={styles.stickyHeader}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.profileRow} 
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Profile')}
                    >
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
                            <Text style={styles.businessSub}>{business?.name || 'MI NEGOCIO'}</Text>
                            <Text style={styles.userNameText}>Hola, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alejandro'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => console.log('Notificaciones')}>
                        <Bell color={COLORS.textSecondary} size={22} />
                    </TouchableOpacity>
                </View>
            </View>
            {loading && !isInitialLoading && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color={COLORS.success} />
                </View>
            )}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                <MasterBalanceCard 
                    total={totalIncome} 
                    profit={netProfit} 
                    pending={totalPending}
                    prevTotal={prevTotalIncome}
                    range={range}
                    chartData={chartData}
                />

                <View style={styles.quickActionsRow}>
                    <QuickAction 
                        icon={PlusSquare} 
                        label="Facturar" 
                        color={COLORS.success} 
                        onPress={() => navigation.navigate('NewInvoice')} 
                    />
                    <QuickAction 
                        icon={UserPlus} 
                        label="Cliente" 
                        color={COLORS.secondary} 
                        onPress={() => navigation.navigate('ClientEdit')} 
                    />
                    <QuickAction 
                        icon={ArrowRightLeft} 
                        label="Actividad" 
                        color={COLORS.primary} 
                        onPress={() => navigation.navigate('Facturas')} 
                    />
                    <QuickAction 
                        icon={Settings2} 
                        label="Ajustes" 
                        color="#64748b" 
                        onPress={() => navigation.navigate('Profile')} 
                    />
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
                            <ActivityIndicator size="small" color={COLORS.accent} />
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
        </LinearGradient>
    );
}

const RecentItem = ({ item, onPress }) => (
    <TouchableOpacity style={styles.recentItem} onPress={onPress}>
        <View style={styles.itemLeft}>
            <View style={[styles.itemIconBox, { backgroundColor: item.status === 'paid' ? COLORS.success + '15' : COLORS.warning + '15' }]}>
                <FileText color={item.status === 'paid' ? COLORS.success : COLORS.warning} size={20} />
            </View>
            <View>
                <Text style={styles.itemTitle}>{item.invoice_number}</Text>
                <Text style={styles.itemMeta}>HACE POCO</Text>
            </View>
        </View>
        <View style={styles.itemRight}>
            <View style={{ alignItems: 'flex-end'}}>
                <Text style={styles.itemValue}>${(item.total || 0).toLocaleString()}</Text>
                {item.amount_paid > 0 && item.status !== 'paid' && (
                    <Text style={{color: COLORS.warning, fontSize: 11, fontWeight: '700', marginTop: 2}}>
                        ${(item.total - item.amount_paid).toLocaleString()}
                    </Text>
                )}
            </View>
            <Text style={[styles.itemStatus, { color: item.status === 'paid' ? COLORS.success : COLORS.warning }]}>
                {item.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
            </Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickyHeader: {
        backgroundColor: 'transparent',
        paddingTop: 60,
        paddingBottom: 16,
        zIndex: 100,
    },
    topLoader: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999,
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
        color: '#94a3b8', // slate-400
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rangeItemActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    rangeText: {
        color: COLORS.textSecondary,
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
    masterCardWrapper: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    masterCard: {
        borderRadius: 32,
        padding: 24,
        overflow: 'hidden',
        minHeight: 240,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    masterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    masterLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    masterValue: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    masterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    masterBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    masterChartContainer: {
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        marginLeft: -10,
    },
    masterFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    footerValue: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '700',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 36,
        gap: 12,
    },
    quickActionItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    quickActionIcon: {
        width: 58,
        height: 58,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    quickActionLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
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
    viewAllText: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    activityList: {
        gap: 14,
    },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 18,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
