import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, MapPin, Globe, Phone, Mail, ArrowLeft, Save, Camera } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusinessEditScreen() {
    const { business, updateBusiness, user } = useAuth();
    const navigation = useNavigation();

    const [name, setName] = useState(business?.name || '');
    const [nit, setNit] = useState(business?.tax_id || '');
    const [email, setEmail] = useState(business?.email || '');
    const [phone, setPhone] = useState(business?.phone || '');
    const [address, setAddress] = useState(business?.address || '');
    const [logoPreview, setLogoPreview] = useState(business?.logo_url || null);
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir el logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setLogoPreview(result.assets[0].uri);
            setLogoFile(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            return Alert.alert('Error', 'El nombre de la empresa es obligatorio');
        }

        try {
            setLoading(true);
            
            let logoUrl = business?.logo_url;

            // Subir logo si se seleccionó uno nuevo
            if (logoFile) {
                const uri = logoFile.uri;
                const fileExt = uri.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const filePath = fileName;

                const formData = new FormData();
                formData.append('file', {
                    uri,
                    name: fileName,
                    type: `image/${fileExt}`,
                });

                const { error: uploadError } = await supabase.storage
                    .from('logos')
                    .upload(filePath, formData, {
                        contentType: `image/${fileExt}`,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('logos')
                    .getPublicUrl(filePath);
                
                logoUrl = publicUrlData.publicUrl;
            }

            const { error } = await updateBusiness({
                name: name.trim(),
                tax_id: nit.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                logo_url: logoUrl
            });

            if (error) throw error;
            
            Alert.alert('Éxito', 'Los datos del negocio han sido actualizados');
            navigation.goBack();
            
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudieron guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Negocio</Text>
                <TouchableOpacity 
                    onPress={() => setIsEditing(!isEditing)}
                    style={styles.editHeaderBtn}
                >
                    <Text style={[styles.editText, isEditing && styles.cancelTextRed]}>
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Selector de Logo */}
                    <View style={styles.logoSection}>
                        <TouchableOpacity 
                            style={[styles.logoPicker, !isEditing && { borderColor: 'rgba(255,255,255,0.1)' }]} 
                            onPress={pickImage} 
                            activeOpacity={0.8}
                            disabled={!isEditing}
                        >
                            {logoPreview ? (
                                <Image source={{ uri: logoPreview }} style={styles.logoPreviewImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Globe color={COLORS.textSecondary} size={30} />
                                </View>
                            )}
                            {isEditing && (
                                <View style={styles.cameraBadge}>
                                    <Camera color="white" size={16} />
                                </View>
                            )}
                        </TouchableOpacity>
                        {isEditing && <Text style={styles.logoHint}>Toca para cambiar el logo</Text>}
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de la Empresa</Text>
                            <View style={styles.inputContainer}>
                                <Briefcase color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    placeholder="Ej: Tech Solutions S.A.S"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                    editable={isEditing}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NIT / Identificación Fiscal</Text>
                            <View style={styles.inputContainer}>
                                <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    placeholder="Ej: 900.123.456-1"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={nit}
                                    onChangeText={setNit}
                                    editable={isEditing}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <View style={styles.inputContainer}>
                                <Phone color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    placeholder="Ej: +57 300 123 4567"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    editable={isEditing}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo del Negocio</Text>
                            <View style={styles.inputContainer}>
                                <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    placeholder="Ej: contacto@empresa.com"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={isEditing}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dirección</Text>
                            <View style={styles.inputContainer}>
                                <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    placeholder="Ej: Calle 123 # 45-67"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={address}
                                    onChangeText={setAddress}
                                    editable={isEditing}
                                />
                            </View>
                        </View>

                        {isEditing && (
                            <TouchableOpacity
                                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save color="white" size={22} />
                                        <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '800',
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logoPicker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logoPreviewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    logoHint: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 10,
        fontWeight: '600',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 55,
        color: COLORS.text,
        fontSize: 16,
    },
    saveBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    editHeaderBtn: {
        width: 80,
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
