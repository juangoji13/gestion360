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
                style={styles.buttonContainer}
                onPress={handleRegister}
                disabled={loading}
            >
                <LinearGradient
                    colors={[COLORS.success, '#059669']}
                    style={[styles.button, loading && { opacity: 0.7 }]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.buttonInner}>
                            <Text style={styles.buttonText}>Crear Mi Cuenta</Text>
                            <ArrowRight color="#fff" size={20} />
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={COLORS.darkGradient} style={styles.gradient}>
                <View style={styles.topBlur} />
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                            <View style={{ flexDirection: 'row', marginTop: 15 }}>
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
        backgroundColor: '#0a0a0c',
    },
    gradient: {
        flex: 1,
    },
    topBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: COLORS.success + '08',
        opacity: 0.5,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
        marginTop: 20,
    },
    logoContainer: {
        width: 220,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    subtitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 18,
        paddingHorizontal: 20,
        height: 60,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    inputIcon: {
        marginRight: 15,
        opacity: 0.5,
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonContainer: {
        height: 60,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    linkTextBold: {
        color: COLORS.success,
        fontWeight: '800',
    },
});
