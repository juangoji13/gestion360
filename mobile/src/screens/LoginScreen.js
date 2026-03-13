import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { Mail, Lock, LogIn, ChevronRight, LayoutDashboard } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signInWithOtp } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa todos los campos');
            return;
        }

        try {
            setLoading(true);
            await signIn(email, password);
        } catch (error) {
            Alert.alert('Error de acceso', error.message || 'Verifica tus credenciales');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPLogin = async () => {
        if (!email) {
            Alert.alert('Email Requerido', 'Por favor ingresa tu correo electrónico para enviarte el enlace de acceso.');
            return;
        }

        try {
            setLoading(true);
            await signInWithOtp(email);
            Alert.alert(
                '¡Revisa tu bandeja! 🚀',
                'Te hemos enviado un "Enlace Mágico" a tu correo. Púlsalo para entrar a Gestión360 sin usar contraseña.',
                [{ text: 'ENTENDIDO' }]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.background, '#1a1a1a']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.subtitle}>Tu negocio en la palma de tu mano</Text>
                </View>

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

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.text} />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Ingresar</Text>
                                <ChevronRight color={COLORS.text} size={20} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>O</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                        style={[styles.otpButton, { marginTop: 12 }]}
                        onPress={handleOTPLogin}
                        disabled={loading}
                    >
                        <Mail color={COLORS.textSecondary} size={20} />
                        <Text style={styles.otpButtonText}>Entrar con Enlace (Email)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginLeft: 5 }}>
                        <Text style={styles.signUpText}>Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>
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
        padding: SIZES.padding,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
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
        color: COLORS.text,
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginTop: 0,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    loginButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        ...SHADOWS.medium,
    },
    loginButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
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
    otpButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        height: 60,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    otpButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    signUpText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
