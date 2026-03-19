import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, Text, View, ScrollView, TouchableOpacity, 
    TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, 
    Platform, Dimensions 
} from 'react-native';
import { 
    ChevronLeft, Save, User, FileText, Phone, 
    MapPin, X, Mail
} from 'lucide-react-native';
import { useClients } from '../hooks/useClients';
import { COLORS, SIZES } from '../constants/theme';

const { height } = Dimensions.get('window');

const GlassInput = ({ label, value, onChangeText, icon: Icon, keyboardType = 'default', multiline = false, placeholder, prefix, colSpan = 12, editable = true }) => (
    <View style={[styles.inputGroup, { width: `${(colSpan / 12) * 100}%` }]}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputContainer, multiline && styles.inputMultiline]}>
            <View style={styles.iconBox}>
                <Icon size={18} color={COLORS.textSecondary} strokeWidth={1.5} />
            </View>
            <TextInput
                style={[styles.input, multiline && { height: 80, paddingTop: 12 }, !editable && styles.inputDisabled]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary + '80'}
                keyboardType={keyboardType}
                multiline={multiline}
                selectionColor={COLORS.primary}
                editable={editable}
            />
        </View>
    </View>
);

export default function ClientEditScreen({ navigation, route }) {
    const { client } = route.params || {};
    const isEditing = !!client;
    const { updateClient, createClient } = useClients();
    const [loading, setLoading] = useState(false);
    const [allowEditing, setAllowEditing] = useState(!isEditing); // Si es nuevo, permitir editar

    const [formData, setFormData] = useState({
        name: '',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (isEditing && client) {
            setFormData({
                name: client.name || '',
                tax_id: client.tax_id || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
            });
        }
    }, [client, isEditing]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            return Alert.alert('Error', 'El nombre es obligatorio');
        }

        const email = formData.email.trim();
        const phone = formData.phone.trim();

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Alert.alert('Error', 'El formato del correo electrónico es inválido');
        }

        if (phone && phone.replace(/[^0-9]/g, '').length < 7) {
            return Alert.alert('Error', 'El número de teléfono debe tener al menos 7 dígitos');
        }

        const cleanData = {
            ...formData,
            name: formData.name.trim(),
            email: email || null,
            phone: phone || null,
            tax_id: formData.tax_id.trim() || null,
            address: formData.address.trim() || null,
        };

        setLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await updateClient(client.id, cleanData);
            } else {
                res = await createClient(cleanData);
            }

            if (res.error) throw new Error(res.error);

            Alert.alert('Éxito', `Cliente ${isEditing ? 'actualizado' : 'creado'} correctamente`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</Text>
                </View>
                {isEditing && (
                    <TouchableOpacity 
                        onPress={() => setAllowEditing(!allowEditing)}
                        style={styles.editHeaderBtn}
                    >
                        <Text style={[styles.editText, allowEditing && styles.cancelTextRed]}>
                            {allowEditing ? 'Cancelar' : 'Editar'}
                        </Text>
                    </TouchableOpacity>
                )}
                {!isEditing && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <GlassInput 
                        label="Nombre Completo *" 
                        placeholder="Nombre del cliente"
                        value={formData.name}
                        onChangeText={(t) => setFormData({...formData, name: t})}
                        icon={User}
                        editable={allowEditing}
                    />

                    <GlassInput 
                        label="IDENTIFICACION" 
                        placeholder="N. Documento"
                        value={formData.tax_id}
                        onChangeText={(t) => setFormData({...formData, tax_id: t})}
                        icon={FileText}
                        editable={allowEditing}
                    />

                    <GlassInput 
                        label="Correo Electrónico" 
                        placeholder="ejemplo@correo.com"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(t) => setFormData({...formData, email: t})}
                        icon={Mail}
                        editable={allowEditing}
                    />

                    <GlassInput 
                        label="Teléfono" 
                        placeholder="+57 300 000 0000"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({...formData, phone: t})}
                        icon={Phone}
                        editable={allowEditing}
                    />

                    <GlassInput 
                        label="Dirección" 
                        placeholder="Ej. Calle 123 # 45-67"
                        value={formData.address}
                        onChangeText={(t) => setFormData({...formData, address: t})}
                        icon={MapPin}
                        editable={allowEditing}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                {allowEditing && (
                    <TouchableOpacity 
                        style={[styles.mainActionBtn, loading && { opacity: 0.7 }]} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <Text style={styles.mainActionText}>
                                {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
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
    editHeaderBtn: {
        minWidth: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    editText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
    },
    cancelTextRed: {
        color: '#ef4444',
    },
    inputDisabled: {
        opacity: 0.6,
        color: COLORS.textSecondary,
    }
});
