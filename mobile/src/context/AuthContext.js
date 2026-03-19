import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

// Auth Context Provider
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

    useEffect(() => {
        // Cargar sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchBusiness(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 1. Escuchar URLs entrantes (Deep Linking) para capturar tokens de auth
        const handleDeepLink = async (url) => {
            if (!url) return;
            console.log('Incoming Deep Link:', url);
            
            const parsed = Linking.parse(url);
            const params = { ...parsed.queryParams };

            // Supabase puede enviar tokens en el hash (#) o en query params (?)
            if (url.includes('#')) {
                const hash = url.split('#')[1];
                hash.split('&').forEach(part => {
                    const [key, value] = part.split('=');
                    if (key) params[key] = value;
                });
            }

            if (params.access_token || params.refresh_token) {
                setLoading(true);
                const { data, error } = await supabase.auth.setSession({
                    access_token: params.access_token || params.token, // Admitir 'token' si viene así
                    refresh_token: params.refresh_token,
                });
                
                if (!error && data.user) {
                    setUser(data.user);
                    fetchBusiness(data.user.id);
                } else {
                    setLoading(false);
                }
            }
        };

        // Escuchar cuando la app ya está abierta
        const subscriptionLinking = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        // Verificar si se abrió la app mediante un link inicial (cuando estaba cerrada)
        Linking.getInitialURL().then(url => {
            if (url) handleDeepLink(url);
        });

        // 2. Escuchar cambios de estado (Login manual / Sign Out)
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    setLoading(true);
                    fetchBusiness(session.user.id);
                }
            } else {
                setUser(null);
                setBusiness(null);
                setLoading(false);
            }
        });

        loadBiometricPreference();

        return () => {
            subscriptionLinking.remove();
            authSub.unsubscribe();
        };
    }, []);

    const loadBiometricPreference = async () => {
        try {
            const value = await AsyncStorage.getItem('biometric_enabled');
            if (value !== null) {
                setIsBiometricEnabled(value === 'true');
            }
        } catch (error) {
            console.error("Error loading biometric preference", error);
        }
    };

    const toggleBiometrics = async (enabled) => {
        try {
            if (enabled) {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                
                if (!hasHardware) {
                    throw new Error("Tu dispositivo no tiene sensor biométrico.");
                }
                if (!isEnrolled) {
                    throw new Error("No tienes huella o Face ID configurado. Configúralo en los ajustes del sistema.");
                }

                // Intentar autenticación biométrica pura (sin PIN)
                let result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Confirma tu identidad para activar biometría',
                    disableDeviceFallback: true,
                    cancelLabel: 'Cancelar'
                });

                // Si falla por permiso nativo (Expo Go), permitir fallback
                if (!result.success && result.error === 'missing_usage_description') {
                    result = await LocalAuthentication.authenticateAsync({
                        promptMessage: 'Confirma tu identidad para activar biometría',
                        disableDeviceFallback: false,
                    });
                }

                if (!result.success) {
                    throw new Error("No se pudo verificar tu identidad.");
                }
            }

            await AsyncStorage.setItem('biometric_enabled', String(enabled));
            setIsBiometricEnabled(enabled);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const fetchBusiness = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (data) setBusiness(data);
        } catch (err) {
            console.error('Error fetching business:', err);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Siempre guardar credenciales para que estén disponibles si se activa biometría
        await SecureStore.setItemAsync('user_email', email);
        await SecureStore.setItemAsync('user_password', password);

        return data;
    };

    const signInWithBiometrics = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            if (!hasHardware || !isEnrolled) {
                throw new Error("Biometría no disponible");
            }

            // Intentar autenticación biométrica pura  
            let result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Inicia sesión con tu biometría',
                disableDeviceFallback: true,
                cancelLabel: 'Cancelar'
            });

            // Fallback para Expo Go (sin permiso nativo de FaceID)
            if (!result.success && result.error === 'missing_usage_description') {
                result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Inicia sesión con tu biometría',
                    disableDeviceFallback: false,
                });
            }

            if (result.success) {
                const email = await SecureStore.getItemAsync('user_email');
                const password = await SecureStore.getItemAsync('user_password');
                
                if (email && password) {
                    return await signIn(email, password);
                } else {
                    throw new Error("No hay credenciales guardadas. Ingresa una vez con tu contraseña.");
                }
            } else {
                throw new Error("Autenticación cancelada");
            }
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) return { error };
            
            // Si la confirmación de email está desactivada, data.session tendrá la sesión
            if (data?.session?.user) {
                setUser(data.session.user);
            }
            
            return { data };
        } catch (error) {
            console.error('Error in signUp:', error);
            return { error };
        }
    };

    const createBusiness = async (businessData) => {
        if (!user) throw new Error('Usuario no autenticado');

        const { data, error } = await supabase
            .from('businesses')
            .insert([{ 
                ...businessData, 
                user_id: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        setBusiness(data);
        return data;
    };

    const updateBusiness = async (businessData) => {
        if (!business?.id) throw new Error('No hay negocio cargado');

        const { data, error } = await supabase
            .from('businesses')
            .update(businessData)
            .eq('id', business.id)
            .select()
            .single();

        if (error) throw error;
        setBusiness(data);
        return data;
    };

    const updateUser = async (attributes) => {
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;
        setUser(data.user);
        return data.user;
    };

    const resetPassword = async (email) => {
        const redirectUrl = Linking.createURL('login');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        user,
        business,
        loading,
        signIn,
        signUp,
        resetPassword,
        signOut,
        createBusiness,
        updateBusiness,
        updateUser,
        isBiometricEnabled,
        toggleBiometrics,
        signInWithBiometrics,
        refreshBusiness: () => fetchBusiness(user?.id),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
