import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Building2, Shield, Bell, HelpCircle, LogOut, ChevronRight, Mail, Phone, MapPin, CreditCard, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { user, business, signOut, isBiometricEnabled, toggleBiometrics } = useAuth();
    const navigation = useNavigation();
    const [biometricLoading, setBiometricLoading] = React.useState(false);

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, salir", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            Alert.alert("Error", "No se pudo cerrar la sesión");
                        }
                    } 
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, title, subtitle, onPress, color = COLORS.primary, rightElement }) => {
        const Wrapper = rightElement ? View : TouchableOpacity;
        const wrapperProps = rightElement ? { style: styles.settingItem } : { style: styles.settingItem, onPress, activeOpacity: 0.7 };
        return (
            <Wrapper {...wrapperProps}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Icon color={color} size={22} />
                </View>
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
                {rightElement ? rightElement : <ChevronRight color="rgba(255,255,255,0.2)" size={20} />}
            </Wrapper>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronRight color={COLORS.text} size={24} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Perfil Card */}
                <View style={styles.profileCard}>
                    <LinearGradient colors={[COLORS.primary + '20', 'transparent']} style={styles.profileGradient} />
                    <View style={styles.avatarLarge}>
                        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.avatarGradient}>
                            <User color="white" size={40} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.userName}>{business?.name || 'Mi Negocio'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    
                    <View style={styles.badgeRow}>
                        <View style={styles.planBadge}>
                            <CreditCard color={COLORS.primary} size={12} />
                            <Text style={styles.planText}>PLAN PREMIUM</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONFIGURACIÓN DE CUENTA</Text>
                    <View style={styles.card}>
                        <SettingItem 
                            icon={User} 
                            title="Datos Personales" 
                            subtitle="Nombre, Correo de acceso"
                            onPress={() => navigation.navigate('UserEdit')}
                        />
                        <View style={styles.divider} />
                        <SettingItem 
                            icon={Building2} 
                            title="Datos del Negocio" 
                            subtitle="NIT, Dirección, Teléfono, Logo"
                            onPress={() => navigation.navigate('BusinessEdit')}
                        />
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SEGURIDAD Y ACCESO</Text>
                    <View style={styles.card}>
                        <SettingItem 
                            icon={Shield} 
                            title="Biometría (FaceID/Huella)" 
                            subtitle="Acceso rápido con identidad"
                            color={COLORS.primary}
                            rightElement={
                                <Switch 
                                    value={isBiometricEnabled} 
                                    onValueChange={async (val) => {
                                        try {
                                            setBiometricLoading(true);
                                            await toggleBiometrics(val);
                                        } catch (err) {
                                            Alert.alert("Error", err.message);
                                        } finally {
                                            setBiometricLoading(false);
                                        }
                                    }} 
                                    disabled={biometricLoading}
                                    trackColor={{ false: '#334155', true: COLORS.primary }} 
                                />
                            }
                        />
                        <View style={styles.divider} />
                        <SettingItem 
                            icon={Shield} 
                            title="Cambiar Contraseña" 
                            subtitle="Seguridad de la cuenta"
                            onPress={() => navigation.navigate('ForgotPassword')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SOPORTE</Text>
                    <View style={styles.card}>
                        <SettingItem 
                            icon={HelpCircle} 
                            title="Centro de Ayuda" 
                            subtitle="Preguntas frecuentes, Guías de uso"
                            onPress={() => console.log('Help')}
                            color={COLORS.secondary}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut color={COLORS.danger} size={22} />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Gestión360 v1.2.0 • Hecho con Amor</Text>
            </ScrollView>
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
        paddingBottom: 40,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 30,
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        marginBottom: 30,
    },
    profileGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 15,
    },
    avatarGradient: {
        flex: 1,
        borderRadius: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 22,
        color: COLORS.text,
        fontWeight: '800',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 15,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.primary + '15',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    planText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 10,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },
    settingSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 75,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        padding: 18,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        gap: 12,
        marginTop: 10,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 16,
        fontWeight: '800',
    },
    versionText: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 40,
    }
});
