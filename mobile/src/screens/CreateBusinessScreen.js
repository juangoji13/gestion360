import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, MapPin, DollarSign, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function CreateBusinessScreen() {
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('COP');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const { createBusiness } = useAuth();

    const handleCreate = async () => {
        if (!name) {
            return Alert.alert('Error', 'El nombre del negocio es obligatorio');
        }

        try {
            setLoading(true);
            await createBusiness({
                name,
                currency,
                address,
                settings: {
                    theme: 'dark',
                    tax_rate: 0.19
                }
            });
            Alert.alert('¡Excelente!', 'Tu negocio ha sido creado con éxito.');
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
            <LinearGradient colors={[COLORS.background, '#0A2E28']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.subtitle}>Casi terminamos. Cuéntanos sobre tu empresa.</Text>
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
                            <DollarSign color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Moneda (ej: COP, USD, MXN)"
                                placeholderTextColor={COLORS.textSecondary}
                                value={currency}
                                onChangeText={setCurrency}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <MapPin color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección (opcional)"
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
                                    <Text style={styles.buttonText}>Comenzar a Facturar</Text>
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
