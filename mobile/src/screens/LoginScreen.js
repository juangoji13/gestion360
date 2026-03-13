import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[COLORS.background, '#0f172a']} // Deep navy to background
                style={styles.gradient}
            >
                <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.subtitle}>Tu negocio en la palma de tu mano</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.form}>
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
                            <ActivityIndicator color={COLORS.background} />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Ingresar</Text>
                                <ChevronRight color={COLORS.background} size={20} />
                            </>
                        )}
                    </TouchableOpacity>

                    <Animated.View entering={FadeIn.delay(400)} style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Acceso</Text>
                        <View style={styles.dividerLine} />
                    </Animated.View>

                    <TouchableOpacity 
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
                    <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.signUpText}>Regístrate aquí</Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradient: {
        flex: 1,
        padding: SIZES.padding * 1.5,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoContainer: {
        width: 220,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 65,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    inputIcon: {
        marginRight: 15,
        opacity: 0.7,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    loginButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 65,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    loginButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '900',
        marginRight: 10,
        letterSpacing: -0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    dividerText: {
        color: '#64748b',
        paddingHorizontal: 20,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 5,
    },
    forgotPasswordText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 50,
        alignItems: 'center',
    },
    footerText: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
    },
    signUpText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '800',
    },
});
