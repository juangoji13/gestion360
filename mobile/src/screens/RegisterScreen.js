import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();

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
            await signUp(email, password);
            // La redirección ocurrirá automáticamente por AuthContext si el registro loguea al usuario
            // En Supabase suele requerir confirmación de email, pero el cliente móvil a veces loguea directamente
            Alert.alert(
                '¡Casi listo!', 
                'Te hemos enviado un correo de confirmación. Al hacer clic en el enlace, serás redirigido automáticamente a la App para configurar tu empresa.',
                [{ text: 'Entendido', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (error) {
            Alert.alert('Error con Google', error.message);
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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
                        <Text style={styles.subtitle}>Crea tu cuenta profesional hoy</Text>
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
                                <ActivityIndicator color={COLORS.text} />
                            ) : (
                                <Text style={styles.buttonText}>Crear Cuenta</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>O</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleRegister}
                            disabled={loading}
                        >
                            <FontAwesome name="google" size={20} color={COLORS.text} />
                            <Text style={styles.googleButtonText}>Registrarse con Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
                                <Text style={styles.linkTextBold}>Ingresa aquí</Text>
                            </View>
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
    form: {
        gap: 20,
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
