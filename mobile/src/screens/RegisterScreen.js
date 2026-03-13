import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, UserPlus, ArrowLeft, Briefcase, MapPin, Phone, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';

export default function RegisterScreen() {
    const navigation = useNavigation();
    
    // Credenciales
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            return Alert.alert('Error', 'Por favor completa todos los campos');
        }
        if (password !== confirmPassword) {
            return Alert.alert('Error', 'Las contraseñas no coinciden');
        }
        if (password.length < 6) {
            return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        }

        try {
            setLoading(true);
            const { data, error } = await signUp(email, password);
            if (error) throw error;
            
            // Si no hay sesión inmediata, significa que la confirmación sigue activa en Supabase
            if (!data.session) {
                navigation.navigate('ConfirmationSuccess', { email });
            }
            // Si hay sesión, el AuthContext actualizará el estado y AppNavigator nos moverá solo
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

    const renderForm = () => (
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
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.background} />
                ) : (
                    <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>Crear Mi Cuenta</Text>
                        <ArrowRight color={COLORS.background} size={20} />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeIn.delay(800)}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <ArrowLeft color={COLORS.text} size={24} />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.subtitle}>Crea tu cuenta profesional hoy</Text>
                    </Animated.View>

                    {renderForm()}

                    <Animated.View entering={FadeIn.delay(600)}>
                        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
                                <Text style={styles.linkTextBold}>Ingresa aquí</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
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
    },
    scrollContent: {
        flexGrow: 1,
        padding: 30,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40,
    },
    logoContainer: {
        width: 200,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    form: {
        gap: 16,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    button: {
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
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 30,
    },
    linkText: {
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
    },
    linkTextBold: {
        color: COLORS.primary,
        fontWeight: '800',
    },
});
