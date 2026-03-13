import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, MapPin, DollarSign, ArrowRight, ArrowLeft, LogOut, Mail, Globe, Phone } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';

export default function CreateBusinessScreen() {
    const [name, setName] = useState('');
    const [nit, setNit] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const { createBusiness, business, signOut, user } = useAuth();
    const navigation = useNavigation();

    // Redirigir si ya tiene negocio (doble check)
    useEffect(() => {
        if (business) {
            navigation.replace('MainTabs');
        }
    }, [business]);

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

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar la sesión');
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            return Alert.alert('Error', 'El nombre de la empresa es obligatorio');
        }

        try {
            setLoading(true);
            
            let logoUrl = null;

            // Subir logo si se seleccionó uno
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

            const { error } = await createBusiness({
                name: name.trim(),
                tax_id: nit.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                logo_url: logoUrl
            });

            if (error) throw error;
            
        } catch (error) {
            Alert.alert('Error', error.message || 'No se pudo crear la empresa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={[COLORS.background, '#0A2E28']} style={styles.gradient}>
                <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
                    <LogOut color={COLORS.text} size={24} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Briefcase color={COLORS.primary} size={60} strokeWidth={1.5} style={{ marginBottom: 15 }} />
                        <Text style={styles.title}>Crea tu Empresa</Text>
                        <Text style={styles.subtitle}>Configura los datos básicos de tu negocio para comenzar a facturar profesionalmente.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Briefcase color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de tu empresa"
                                placeholderTextColor={COLORS.textSecondary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="NIT / RUT (Identificación fiscal)"
                                placeholderTextColor={COLORS.textSecondary}
                                value={nit}
                                onChangeText={setNit}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Phone color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono de contacto"
                                placeholderTextColor={COLORS.textSecondary}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Correo electrónico de la empresa"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {/* Selector de Logo */}
                        <View style={styles.logoUploadContainer}>
                            <TouchableOpacity style={styles.logoPicker} onPress={pickImage}>
                                {logoPreview ? (
                                    <Image source={{ uri: logoPreview }} style={styles.logoPreviewImage} />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Globe color={COLORS.textSecondary} size={30} />
                                        <Text style={styles.logoPlaceholderText}>Subir Logo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>


                        <View style={styles.inputContainer}>
                            <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección física"
                                placeholderTextColor={COLORS.textSecondary}
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.text} />
                            ) : (
                                <View style={styles.buttonInner}>
                                    <Text style={styles.buttonText}>Finalizar Configuración</Text>
                                    <ArrowRight color={COLORS.text} size={20} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 30,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.glass,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 250,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop: 0,
    },
    form: {
        gap: 20,
    },
    logoUploadContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logoPicker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.glass,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
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
        gap: 5,
    },
    logoPlaceholderText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 55,
        color: COLORS.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
