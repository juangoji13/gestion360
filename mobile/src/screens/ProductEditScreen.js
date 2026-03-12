import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, Text, View, ScrollView, TouchableOpacity, 
    TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, 
    Platform, Dimensions, Switch 
} from 'react-native';
import { 
    ChevronLeft, Save, Package, Tag, DollarSign, 
    Info, BarChart, Trash2, X, ChevronDown, List,
    FileText, ShoppingBag, Ruler, LayoutGrid
} from 'lucide-react-native';
// Re-using same icon set or equivalents from lucide
import { useProducts } from '../hooks/useProducts';
import { COLORS, SIZES } from '../constants/theme';

const { height } = Dimensions.get('window');

const round2 = (val) => Math.round((val + Number.EPSILON) * 100) / 100;

const GlassInput = ({ label, value, onChangeText, icon: Icon, keyboardType = 'default', multiline = false, placeholder, prefix, suffix, colSpan = 12 }) => (
    <View style={[styles.inputGroup, { width: `${(colSpan / 12) * 100}%` }]}>
        <Text style={styles.label}>{label} {label.includes('*') ? '' : ''}</Text>
        <View style={[styles.inputContainer, multiline && styles.inputMultiline]}>
            <View style={styles.iconBox}>
                <Icon size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            </View>
            {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
            <TextInput
                style={[styles.input, multiline && { height: 80, paddingTop: 12 }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary + '80'}
                keyboardType={keyboardType}
                multiline={multiline}
                selectionColor={COLORS.primary}
            />
        </View>
    </View>
);

export default function ProductEditScreen({ navigation, route }) {
    const { product } = route.params || {};
    const isEditing = !!product;
    const { createProduct, updateProduct, loading } = useProducts();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        base_price: '',
        sale_price: '',
        stock: '',
        unit: 'und',
        track_stock: true
    });

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                description: product.description || '',
                base_price: product.base_price?.toString() || '',
                sale_price: product.sale_price?.toString() || '',
                stock: product.stock?.toString() || '',
                unit: product.unit || 'und',
                track_stock: product.track_stock !== undefined ? product.track_stock : true
            });
        }
    }, [product]);

    const handleSave = async () => {
        if (!formData.name || !formData.sale_price) {
            return Alert.alert('Error', 'Nombre y Precio de Venta son obligatorios');
        }

        const payload = {
            ...formData,
            base_price: round2(parseFloat(formData.base_price) || 0),
            sale_price: round2(parseFloat(formData.sale_price) || 0),
            stock: round2(parseFloat(formData.stock) || 0)
        };

        try {
            let res;
            if (isEditing) {
                res = await updateProduct(product.id, payload);
            } else {
                res = await createProduct(payload);
            }

            if (res.error) throw res.error;
            
            Alert.alert('Éxito', `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Mirroring Mockup */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{isEditing ? 'Editar Producto' : 'Añadir al Catálogo'}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color={COLORS.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Row 1: Name & SKU Grid */}
                    <View style={styles.gridRow}>
                        <GlassInput 
                            label="Nombre *" 
                            placeholder="Ej. Cemento Gris"
                            colSpan={8}
                            value={formData.name}
                            onChangeText={(t) => setFormData({...formData, name: t})}
                            icon={Package}
                        />
                        <View style={{ width: 12 }} />
                        <GlassInput 
                            label="SKU" 
                            placeholder="CEM-001"
                            colSpan={4}
                            value={formData.sku}
                            onChangeText={(t) => setFormData({...formData, sku: t})}
                            icon={Tag}
                        />
                    </View>

                    {/* Row 2: Description */}
                    <GlassInput 
                        label="Descripción" 
                        placeholder="Añade detalles del producto..."
                        multiline
                        value={formData.description}
                        onChangeText={(t) => setFormData({...formData, description: t})}
                        icon={Info}
                    />

                    {/* Row 3: Prices Grid */}
                    <View style={styles.gridRow}>
                        <GlassInput 
                            label="Precio Compra *" 
                            placeholder="0.00"
                            prefix="$"
                            keyboardType="numeric"
                            colSpan={6}
                            value={formData.base_price}
                            onChangeText={(t) => setFormData({...formData, base_price: t})}
                            icon={DollarSign}
                        />
                        <View style={{ width: 12 }} />
                        <GlassInput 
                            label="Precio Venta *" 
                            placeholder="0.00"
                            prefix="$"
                            keyboardType="numeric"
                            colSpan={6}
                            value={formData.sale_price}
                            onChangeText={(t) => setFormData({...formData, sale_price: t})}
                            icon={DollarSign}
                        />
                    </View>

                    {/* Row 4: Stock Initial */}
                    <GlassInput 
                        label="Stock Inicial" 
                        placeholder="Ej. 50"
                        keyboardType="numeric"
                        value={formData.stock}
                        onChangeText={(t) => setFormData({...formData, stock: t})}
                        icon={Package}
                    />

                    {/* Row 5: Unit of Measure with Quick Selection Chips */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Unidad de Medida</Text>
                        <View style={styles.selectContainer}>
                            <View style={styles.iconBox}>
                                <BarChart size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
                            </View>
                            <TextInput
                                style={styles.input}
                                value={formData.unit}
                                onChangeText={(t) => setFormData({...formData, unit: t})}
                                placeholder="Ej. Kilogramos (kg)"
                                placeholderTextColor={COLORS.textSecondary + '80'}
                            />
                            <ChevronDown size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                        </View>
                        
                        {/* Quick Selection Chips */}
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            style={styles.chipsContainer}
                            contentContainerStyle={styles.chipsContent}
                        >
                            {['und', 'kg', 'lt', 'mt', 'par'].map((u) => (
                                <TouchableOpacity 
                                    key={u} 
                                    style={[
                                        styles.unitChip, 
                                        formData.unit === u && styles.activeChip
                                    ]}
                                    onPress={() => setFormData({...formData, unit: u})}
                                >
                                    <Text style={[
                                        styles.chipText, 
                                        formData.unit === u && styles.activeChipText
                                    ]}>{u.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Row 6: Stock Tracking Toggle */}
                    <View style={styles.stockTrackingCard}>
                        <View style={styles.stockTrackingInfo}>
                            <View style={[styles.iconBox, { backgroundColor: formData.track_stock ? COLORS.primary + '20' : 'rgba(255,255,255,0.05)' }]}>
                                <LayoutGrid size={18} color={formData.track_stock ? COLORS.primary : COLORS.textSecondary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.stockTrackingTitle}>Controlar Inventario</Text>
                                <Text style={[styles.stockTrackingDesc, !formData.track_stock && { color: COLORS.primary, fontWeight: 'bold' }]}>
                                    {formData.track_stock 
                                        ? 'Las ventas restarán stock automáticamente.' 
                                        : 'Estado: Flexible (Sin límite de venta)'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={formData.track_stock}
                            onValueChange={(v) => setFormData({...formData, track_stock: v})}
                            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary + '40' }}
                            thumbColor={formData.track_stock ? COLORS.primary : '#94a3b8'}
                            ios_backgroundColor="rgba(255,255,255,0.1)"
                        />
                    </View>

                    {!formData.track_stock && (
                        <View style={styles.noStockAlert}>
                            <Info size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.noStockAlertText}>Este producto nunca se irá a negativo aunque no tenga existencias.</Text>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky Actions Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.mainActionBtn, loading && { opacity: 0.7 }]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <Text style={styles.mainActionText}>
                            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                        </Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelText}>Descartar</Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        minHeight: 56,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16,
        minHeight: 56,
    },
    inputMultiline: {
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    iconBox: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    prefixText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        marginRight: 4,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        height: 56,
    },
    footer: {
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(18, 18, 20, 0.4)',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    mainActionBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    mainActionText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '900',
    },
    cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    chipsContainer: {
        marginTop: 12,
    },
    chipsContent: {
        paddingRight: 40,
        gap: 8,
    },
    unitChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    activeChip: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 0.3)',
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '800',
    },
    activeChipText: {
        color: COLORS.primary,
    },
    stockTrackingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 16,
        paddingRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginTop: 8,
    },
    stockTrackingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    stockTrackingTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    stockTrackingDesc: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    noStockAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    noStockAlertText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    }
});
