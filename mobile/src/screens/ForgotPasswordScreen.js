import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { Mail, ChevronLeft, Send } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Email Requerido', 'Por favor ingresa tu correo electrónico.');
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            Alert.alert(
                '¡Correo Enviado! 📧',
                'Si el correo está registrado, recibirás un enlace para crear una nueva contraseña en unos momentos.',
                [{ text: 'ENTENDIDO', onPress: () => navigation.goBack() }]
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
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft color={COLORS.text} size={28} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Mail color={COLORS.primary} size={40} />
                    </View>
                    <Text style={styles.title}>Recuperar Acceso</Text>
                    <Text style={styles.subtitle}>
                        Te enviaremos un correo con las instrucciones para restablecer tu contraseña.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Tu correo electrónico"
                            placeholderTextColor={COLORS.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoFocus
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.resetButton, loading && { opacity: 0.7 }]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.text} />
                        ) : (
                            <>
                                <Text style={styles.resetButtonText}>Enviar Instrucciones</Text>
                                <Send color={COLORS.text} size={20} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.tipContainer}>
                    <Text style={styles.tipText}>
                        <Text style={{fontWeight: 'bold', color: COLORS.primary}}>Tip: </Text>
                        Si usas Google en la web, al restablecer tu contraseña podrás entrar aquí con tu correo.
                    </Text>
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
    backButton: {
        position: 'absolute',
        top: 60,
        left: SIZES.padding,
        zIndex: 10,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
        paddingHorizontal: 20,
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
        height: 65,
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
    resetButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 65,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 12,
        ...SHADOWS.medium,
    },
    resetButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    tipContainer: {
        marginTop: 40,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    tipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
