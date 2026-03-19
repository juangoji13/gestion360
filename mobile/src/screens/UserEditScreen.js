import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, ChevronLeft, Save } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserEditScreen() {
    const { user, updateUser } = useAuth();
    const navigation = useNavigation();

    const [name, setName] = useState(user?.user_metadata?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            return Alert.alert("Error", "El nombre es obligatorio");
        }
        if (!email.trim()) {
            return Alert.alert("Error", "El correo es obligatorio");
        }

        try {
            setLoading(true);
            const updates = {
                data: { full_name: name.trim() }
            };

            // Si el email cambió, agregarlo a las updates
            if (email.trim().toLowerCase() !== user?.email?.toLowerCase()) {
                updates.email = email.trim().toLowerCase();
            }

            await updateUser(updates);

            if (updates.email) {
                Alert.alert(
                    "Perfil Actualizado",
                    "Se ha enviado un correo de confirmación a tu nueva dirección. Por favor verifícalo para completar el cambio de email.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert("Éxito", "Tus datos han sido actualizados correctamente");
                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron actualizar los datos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <ChevronLeft color={COLORS.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Datos Personales</Text>
                    <TouchableOpacity 
                        onPress={() => setIsEditing(!isEditing)}
                        style={styles.editHeaderBtn}
                    >
                        <Text style={[styles.editText, isEditing && styles.cancelTextBlue]}>
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Aquí puedes actualizar tu nombre de perfil y tu correo electrónico de acceso.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        {/* Campo Nombre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre Completo</Text>
                            <View style={styles.inputWrapper}>
                                <User color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Tu nombre"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    editable={isEditing}
                                />
                            </View>
                            <Text style={styles.helperText}>Este nombre aparecerá en los saludos del Dashboard.</Text>
                        </View>

                        {/* Campo Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <View style={styles.inputWrapper}>
                                <Mail color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, !isEditing && styles.inputDisabled]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="correo@ejemplo.com"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={isEditing}
                                />
                            </View>
                            <Text style={styles.helperText}>Si cambias el correo, deberás confirmarlo en la nueva dirección.</Text>
                        </View>
                    </View>

                    {isEditing && (
                        <TouchableOpacity 
                            style={[styles.saveBtn, loading && styles.disabledBtn]} 
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Save color="white" size={20} />
                                    <Text style={styles.saveText}>Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 20,
    },
    infoBox: {
        backgroundColor: COLORS.primary + '10',
        padding: 15,
        borderRadius: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.6,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 6,
        marginLeft: 4,
        opacity: 0.7,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...SHADOWS.medium,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    editHeaderBtn: {
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    editText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
    },
    cancelTextBlue: {
        color: '#ef4444', // Red for cancel
    },
    inputDisabled: {
        opacity: 0.6,
        color: COLORS.textSecondary,
    }
});
