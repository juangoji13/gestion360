import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MailCheck, ArrowLeft, LogIn } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ConfirmationSuccessScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params || { email: 'tu correo electrónico' };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={[COLORS.background, '#0A2E28']} style={styles.gradient}>
                <View style={styles.content}>
                    {/* Icono Principal */}
                    <View style={styles.iconContainer}>
                        <LinearGradient 
                            colors={[COLORS.primary, '#15A362']} 
                            style={styles.iconBackground}
                        >
                            <MailCheck color={COLORS.text} size={60} strokeWidth={1.5} />
                        </LinearGradient>
                        <View style={styles.pulseContainer}>
                            <View style={styles.pulse} />
                        </View>
                    </View>

                    {/* Mensaje de Confirmación */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>¡Revisa tu correo! 📥</Text>
                        <Text style={styles.description}>
                            Hemos enviado un enlace de activación a:{"\n"}
                            <Text style={styles.emailHighlight}>{email}</Text>
                        </Text>
                        <Text style={styles.instructions}>
                            Haz clic en el enlace del mensaje para verificar tu cuenta y activar tu empresa automáticamente.
                        </Text>
                    </View>

                    {/* Botones de Acción */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <LogIn color={COLORS.text} size={20} style={styles.buttonIcon} />
                            <Text style={styles.primaryButtonText}>Ir al Inicio de Sesión</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft color={COLORS.textSecondary} size={20} style={styles.buttonIcon} />
                            <Text style={styles.secondaryButtonText}>Editar correo o datos</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            ¿No recibiste nada? Revisa tu carpeta de Spam.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    iconBackground: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        zIndex: 2,
    },
    pulseContainer: {
        position: 'absolute',
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulse: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        opacity: 0.2,
        transform: [{ scale: 1.2 }],
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 10,
    },
    emailHighlight: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    instructions: {
        fontSize: 14,
        color: COLORS.textSecondary,
        opacity: 0.7,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 55,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    primaryButtonText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        height: 55,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    secondaryButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        opacity: 0.5,
    },
});
