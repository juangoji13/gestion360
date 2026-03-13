import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Dimensions, Alert, Animated } from 'react-native';
import { 
    Search, Plus, Bell, TrendingUp, BarChart3, 
    Edit2, Trash2, FileText, Package, ChevronRight,
    ArrowUpRight, Info, DollarSign, Clock, CheckCircle
} from 'lucide-react-native';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { useAuth } from '../context/AuthContext';
import { ReportService } from '../services/ReportService';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Dashboard-style KPI Card Widget
const KPICard = ({ title, value, icon: Icon, color, growth, subtitle, style }) => (
    <View style={[styles.glassCardKPI, style]}>
        <View style={[styles.blurSpot, { backgroundColor: color + '15' }]} />
        <View style={styles.cardHeaderKPI}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon color={color} size={20} />
            </View>
            {growth && (
                <View style={[styles.growthBox, { backgroundColor: color + '25', borderColor: color + '33' }]}>
                    <Text style={[styles.growthText, { color: color }]}>{growth}</Text>
                </View>
            )}
        </View>
        <View style={styles.cardBodyKPI}>
            <Text style={styles.kpiLabel}>{title}</Text>
            <Text style={styles.kpiValueMainText}>{value}</Text>
            {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
        </View>
    </View>
);

const ProductCard = ({ product, onEdit, onDelete }) => {
    const stockVal = parseFloat(product.stock) || 0;
    const isAvailable = stockVal > 0 || product.track_stock === false;
    const isFlexible = product.track_stock === false;
    const basePrice = parseFloat(product.base_price) || 0;
    const salePrice = parseFloat(product.sale_price) || 0;

    return (
        <TouchableOpacity onPress={() => onEdit(product)} activeOpacity={0.7} style={styles.productGlassCard}>
            <View style={styles.productHeader}>
                <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <View style={styles.skuBadge}>
                            <Text style={styles.skuText}>SKU: {product.sku || 'S/N'}</Text>
                        </View>
                        {isFlexible && (
                            <View style={[styles.skuBadge, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '40' }]}>
                                <Text style={[styles.skuText, { color: COLORS.primary, fontWeight: '900' }]}>FLEXIBLE</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.descriptionText} numberOfLines={1}>
                        {product.description || 'Sin descripción del producto'}
                    </Text>
                </View>
                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => onEdit(product)} style={styles.actionIconButton}>
                        <Edit2 color={COLORS.textSecondary} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(product)} style={styles.actionIconButton}>
                        <Trash2 color={COLORS.danger + 'CC'} size={18} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.stockSection}>
                <View>
                    <Text style={styles.miniLabel}>Estado Stock</Text>
                    <View style={styles.stockStatusContainer}>
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: isFlexible ? COLORS.primary + '15' : (isAvailable ? COLORS.primary + '15' : COLORS.danger + '15'),
                              borderColor: isFlexible ? COLORS.primary + '33' : (isAvailable ? COLORS.primary + '33' : COLORS.danger + '33') }
                        ]}>
                            <Text style={[styles.statusText, { color: isFlexible ? COLORS.primary : (isAvailable ? COLORS.primary : COLORS.danger) }]}>
                                {isFlexible ? 'FLEXIBLE' : (isAvailable ? 'DISPONIBLE' : 'AGOTADO')}
                            </Text>
                        </View>
                        {!isFlexible && (
                            <View style={styles.stockQtyRow}>
                                <Text style={styles.stockQty}>{stockVal} {product.unit || 'und'}</Text>
                                {product.reservedQty > 0 && (
                                    <View style={styles.reservedBadge}>
                                        <Clock color={COLORS.secondary} size={10} />
                                        <Text style={styles.reservedText}>{product.reservedQty} reser.</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        {isFlexible && (
                            <Text style={[styles.stockQty, { color: COLORS.primary + 'BB', fontSize: 12 }]}>Sin límite</Text>
                        )}
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.miniLabel}>Presentación</Text>
                    <View style={styles.unitBox}>
                        <Text style={styles.unitText}>{(product.unit || 'UNIDAD').toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.priceGrid}>
                <View style={styles.priceItem}>
                    <Text style={styles.miniLabel}>Costo Base</Text>
                    <Text style={styles.basePriceText}>${(basePrice || 0).toLocaleString()}</Text>
                </View>
                <View style={[styles.priceItem, styles.salePriceItem]}>
                    <Text style={[styles.miniLabel, { color: COLORS.primary + 'CC' }]}>Precio Venta</Text>
                    <Text style={styles.salePriceText}>${(salePrice || 0).toLocaleString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function InventoryScreen({ navigation }) {
    const { 
        products, loading, error, refresh, deleteProduct, topProducts,
        totalInvestment, totalSalesValue, marginPercent, totalProfit, lowStockCount
    } = useProducts();
    const { invoices, refresh: refreshInvoices } = useInvoices();
    const { business } = useAuth();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [search, setSearch] = useState('');
    
    // FAB Animation logic
    const scrollY = useRef(new Animated.Value(0)).current;
    const fabOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    const fabScale = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0.5, 1],
        extrapolate: 'clamp',
    });

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (product) => {
        navigation.navigate('ProductEdit', { product });
    };

    const handleGenerateReport = async () => {
        try {
            setIsGeneratingPDF(true);
            // Si el refresco de facturas no ha traído los ítems (por caché), forzamos actualización
            await refreshInvoices();
            
            // Definimos un periodo por defecto (ej. últimos 30 días) ya que el usuario no tiene selector aún
            const now = new Date();
            const lastMonth = new Date();
            lastMonth.setDate(now.getDate() - 30);
            
            const period = {
                from: lastMonth.toISOString().split('T')[0],
                to: now.toISOString().split('T')[0]
            };

            const success = await ReportService.generateProductReport(business, products, invoices, period);
            if (!success) Alert.alert('Error', 'No se pudo generar el reporte PDF');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Ocurrió un error al procesar el reporte');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDelete = (product) => {
        Alert.alert('Eliminar', `¿Desea eliminar ${product.name}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: async () => {
                const res = await deleteProduct(product.id);
                if (res.error) Alert.alert('Error', res.error.message);
            } }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* stickyHeader like Dashboard */}
            <View style={styles.stickyHeader}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerSub}>Catálogo & Inventario</Text>
                        <Text style={styles.headerTitle}>Productos</Text>
                    </View>
                    <TouchableOpacity style={styles.actionIconBtn} onPress={() => console.log('Notificaciones')}>
                        <Bell color={COLORS.textSecondary} size={22} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBarContainer}>
                    <Search color={COLORS.textSecondary} size={18} style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Buscar por SKU o Nombre"
                        placeholderTextColor={COLORS.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <Animated.ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Stats Section with Dashboard Widgets (KPICards) */}
                <View style={styles.kpiGrid}>
                    <View style={styles.fullWidthKPI}>
                        <KPICard 
                            title="Inversión en Inventario" 
                            value={`$${(totalInvestment || 0).toLocaleString()}`} 
                            icon={Package} 
                            color={COLORS.primary} 
                            style={{ width: '100%' }}
                        />
                    </View>
                    <KPICard 
                        title="Venta Estimada" 
                        value={`$${(totalSalesValue || 0).toLocaleString()}`} 
                        icon={TrendingUp} 
                        color={COLORS.secondary} 
                    />
                    <KPICard 
                        title="Margen Promedio" 
                        value={`${(marginPercent || 0).toFixed(1)}%`} 
                        icon={BarChart3} 
                        color={COLORS.success}
                        subtitle={`$${(totalProfit || 0).toLocaleString()} utilidad`}
                    />
                </View>

                {/* Quick Actions Row - Smaller buttons & no redundant Add Product */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionBtnSmall} onPress={() => navigation.navigate('ProductEdit')}>
                        <Plus color={COLORS.background} size={22} />
                        <Text style={styles.actionBtnTextSmall}>Añadir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionBtnSmall, styles.actionBtnGlassSmall]}
                        onPress={handleGenerateReport}
                        disabled={isGeneratingPDF}
                    >
                        {isGeneratingPDF ? (
                            <ActivityIndicator color={COLORS.primary} size="small" />
                        ) : (
                            <>
                                <FileText color={COLORS.textSecondary} size={20} />
                                <Text style={styles.actionBtnTextGlassSmall}>PDF</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtnSmall, styles.actionBtnGlassSmall]}>
                        <TrendingUp color={COLORS.textSecondary} size={20} />
                        <Text style={styles.actionBtnTextGlassSmall}>Top</Text>
                    </TouchableOpacity>
                </View>

                {/* List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Listado de Productos</Text>
                    <View style={styles.badgeCount}>
                        <Text style={styles.badgeText}>{filteredProducts.length} REGISTROS</Text>
                    </View>
                </View>

                {/* Product List */}
                <View style={styles.productList}>
                    {loading && !products.length ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : filteredProducts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No se encontraron productos</Text>
                        </View>
                    ) : (
                        filteredProducts.map(p => (
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </View>

                {/* Performance Section - Now with real Top Selling Products */}
                <View style={styles.performanceSection}>
                    <View style={styles.perfHeader}>
                        <Text style={styles.listTitle}>Desempeño</Text>
                        <Text style={styles.perfMeta}>TOP VENTAS</Text>
                    </View>
                    
                    {topProducts.length > 0 ? (
                        <View style={styles.topProductsList}>
                            {topProducts.map((item, index) => (
                                <View key={index} style={styles.topProductItem}>
                                    <View style={styles.topRankBox}>
                                        <Text style={styles.topRankText}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.topProductName}>{item.name}</Text>
                                        <Text style={styles.topProductStats}>{item.quantity || 0} unidades vendidas</Text>
                                    </View>
                                    <Text style={styles.topProductValue}>${(item.total || 0).toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyChartCard}>
                            <View style={styles.chartIconBox}>
                                <BarChart3 color={COLORS.textSecondary} size={30} />
                            </View>
                            <Text style={styles.emptyChartText}>Sin historial de ventas registradas</Text>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Dynamic FAB - Only visible on scroll */}
            <Animated.View style={[styles.fabContainer, { opacity: fabOpacity, transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity 
                    style={styles.floatFab}
                    onPress={() => navigation.navigate('ProductEdit')}
                >
                    <Plus color={COLORS.background} size={28} strokeWidth={3} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    stickyHeader: {
        backgroundColor: 'rgba(18, 18, 20, 0.9)',
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        zIndex: 100,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    headerSub: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
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
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 48,
        color: '#fff',
        fontSize: 14,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 120,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    fullWidthKPI: {
        width: '100%',
    },
    glassCardKPI: {
        width: '47.5%',
        minHeight: 130,
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
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
    },
    growthText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBodyKPI: {
        gap: 2,
    },
    kpiLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    kpiValueMainText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -1,
    },
    kpiSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    // Smaller Quick Action Buttons
    quickActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 36,
        marginTop: 8,
    },
    actionBtnSmall: {
        flex: 1,
        backgroundColor: COLORS.primary,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    actionBtnGlassSmall: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    actionBtnTextSmall: {
        color: COLORS.background,
        fontSize: 13,
        fontWeight: '800',
    },
    actionBtnTextGlassSmall: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    listTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
    },
    badgeCount: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    badgeText: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: '800',
    },
    productList: {
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 32,
    },
    productGlassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    productName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skuBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    skuText: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: '900',
    },
    descriptionText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        opacity: 0.8,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    actionIconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stockSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    miniLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    stockStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    stockQtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    stockQty: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reservedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.secondary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary + '33',
    },
    reservedText: {
        color: COLORS.secondary,
        fontSize: 9,
        fontWeight: 'bold',
    },
    unitBox: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
    },
    unitText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    priceGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    priceItem: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    salePriceItem: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.1)',
    },
    basePriceText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '800',
    },
    salePriceText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '900',
    },
    performanceSection: {
        marginTop: 12,
        paddingHorizontal: 20,
    },
    perfHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    perfMeta: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    emptyChartCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderStyle: 'dashed',
    },
    chartIconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyChartText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    topProductsList: {
        gap: 12,
    },
    topProductItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    topRankBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    topRankText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    topProductName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    topProductStats: {
        color: COLORS.textSecondary,
        fontSize: 11,
    },
    topProductValue: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        zIndex: 1000,
    },
    floatFab: {
        width: 64,
        height: 64,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    }
});
