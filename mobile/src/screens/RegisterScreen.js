import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, UserPlus, ArrowLeft, Briefcase, MapPin, DollarSign, Globe, Phone, ArrowRight } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
    const navigation = useNavigation();
    
    // Credenciales
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Empresa
    const [businessName, setBusinessName] = useState('');
    const [businessNit, setBusinessNit] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');
    const [businessCurrency, setBusinessCurrency] = useState('COP');
    const [businessAddress, setBusinessAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleNextStep = () => {
        if (!email || !password || !confirmPassword) {
            return Alert.alert('Error', 'Por favor completa todos los campos de acceso');
        }
        if (password !== confirmPassword) {
            return Alert.alert('Error', 'Las contraseñas no coinciden');
        }
        if (password.length < 6) {
            return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        }
        setStep(2);
    };

    const handleRegister = async () => {
        if (!businessName || !businessNit) {
            return Alert.alert('Error', 'El nombre y el NIT de la empresa son obligatorios');
        }

        try {
            setLoading(true);
            const businessData = {
                name: businessName,
                nit: businessNit,
                phone: businessPhone,
                currency: businessCurrency,
                address: businessAddress,
            };

            // Guardamos los datos temporalmente en el celular
            // Así, al confirmar el email y volver, la app los detectará automáticamente
            await AsyncStorage.setItem('pending_business_data', JSON.stringify(businessData));
            
            const { error } = await signUp(email, password);
            if (error) throw error;
            
            navigation.navigate('ConfirmationSuccess', { email });
        } catch (error) {
            let message = error.message;
            if (message.includes('already registered')) {
                message = 'Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.';
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.form}>
            <View style={styles.inputContainer}>
                <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    placeholderTextColor={COLORS.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputContainer}>
                <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={COLORS.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputContainer}>
                <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={COLORS.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleNextStep}
            >
                <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Siguiente Paso</Text>
                    <ArrowRight color={COLORS.text} size={20} />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.form}>
            <Text style={styles.stepTitle}>Datos de tu Empresa 🏢</Text>
            
            <View style={styles.inputContainer}>
                <Briefcase color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Nombre del Negocio"
                    placeholderTextColor={COLORS.textSecondary}
                    value={businessName}
                    onChangeText={setBusinessName}
                />
            </View>

            <View style={styles.inputContainer}>
                <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="NIT / RUT"
                    placeholderTextColor={COLORS.textSecondary}
                    value={businessNit}
                    onChangeText={setBusinessNit}
                />
            </View>

            <View style={styles.inputContainer}>
                <Phone color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Teléfono (Opcional)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={businessPhone}
                    onChangeText={setBusinessPhone}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <DollarSign color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Moneda (ej: COP, USD)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={businessCurrency}
                    onChangeText={setBusinessCurrency}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.text} />
                ) : (
                    <Text style={styles.buttonText}>Finalizar y Crear Cuenta</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => setStep(1)}>
                <Text style={styles.linkText}>Volver al paso anterior</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={[COLORS.background, '#0A2E28']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
                        <ArrowLeft color={COLORS.text} size={24} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.subtitle}>{step === 1 ? 'Crea tu cuenta profesional hoy' : 'Configura tu espacio de trabajo'}</Text>
                    </View>

                    {step === 1 ? renderStep1() : renderStep2()}

                    {step === 1 && (
                        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
                                <Text style={styles.linkTextBold}>Ingresa aquí</Text>
                            </View>
                        </TouchableOpacity>
                    )}
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
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.glass,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
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
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 0,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    form: {
        gap: 15,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
        height: 55,
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
    buttonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textSecondary,
        paddingHorizontal: 15,
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        height: 55,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    googleButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    linkTextBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
