import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Auth Context Provider
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

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
                
                // Verificar si hay datos de empresa pendientes (para Google Auth)
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    // Primero intentamos cargar la empresa existente
                    const { data: existingBusiness } = await supabase
                        .from('businesses')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .maybeSingle();

                    if (!existingBusiness) {
                        try {
                            const pendingData = await AsyncStorage.getItem('pending_business_data');
                            if (pendingData) {
                                const businessData = JSON.parse(pendingData);
                                console.log('Creating pending business for Google user:', session.user.id);
                                
                                const { data: newBusiness, error: createError } = await supabase
                                    .from('businesses')
                                    .insert([{ 
                                        ...businessData, 
                                        user_id: session.user.id,
                                        settings: { theme: 'dark', tax_rate: 0.19 }
                                    }])
                                    .select()
                                    .single();

                                if (!createError && newBusiness) {
                                    setBusiness(newBusiness);
                                    await AsyncStorage.removeItem('pending_business_data');
                                    console.log('Business successfully created and storage cleared');
                                    return; // Ya tenemos la empresa, no hace falta fetchBusiness
                                } else {
                                    console.error('Error creating business in onAuthStateChange:', createError);
                                }
                            }
                        } catch (e) {
                            console.error('Error processing pending business data:', e);
                        }
                    } else {
                        setBusiness(existingBusiness);
                        return; // Ya tenemos la empresa
                    }
                }

                fetchBusiness(session.user.id);
            } else {
                setUser(null);
                setBusiness(null);
                setLoading(false);
            }
        });

        return () => {
            subscriptionLinking.remove();
            authSub.unsubscribe();
        };
    }, []);

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
        return data;
    };

    const redirectUrl = makeRedirectUri({
        scheme: 'gestion360',
        path: 'auth'
    });

    const signInWithGoogle = async () => {
        const dynamicRedirectUrl = Linking.createURL('auth');
        
        console.log('--- SIGN IN WITH GOOGLE ---');
        console.log('Generated Redirect URI:', dynamicRedirectUrl);
        console.log('---------------------------');

        // Mostrar al usuario para depuración (CRÍTICO para configurar Supabase)
        Alert.alert(
            'Configuración de Supabase',
            `Copia este link y añádelo a "Redirect URLs" en tu panel de Supabase:\n\n${dynamicRedirectUrl}`,
            [{ text: 'COPIADO / ENTENDIDO', style: 'default' }]
        );

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: dynamicRedirectUrl,
                skipBrowserRedirect: true,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                },
            },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No se pudo generar la URL de autenticación de Google');

        // Abrir el navegador para el flujo de OAuth
        console.log('Opening Auth Session with:', data.url);
        const res = await WebBrowser.openAuthSessionAsync(data.url, dynamicRedirectUrl);

        if (res.type === 'success' && res.url) {
            // Supabase puede devolver tokens en el hash (#) o en query params (?)
            const parsed = Linking.parse(res.url);
            const params = { ...parsed.queryParams };

            // Extraer del fragmento hash si es necesario
            if (res.url.includes('#')) {
                const hash = res.url.split('#')[1];
                hash.split('&').forEach(part => {
                    const [key, value] = part.split('=');
                    if (key) params[key] = value;
                });
            }

            if (params.access_token) {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                });
                if (sessionError) throw sessionError;
                return sessionData;
            }
        }
    };


    const signUp = async (email, password, businessData = null) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                // Pasamos los datos de la empresa como metadatos para el trigger de la DB
                data: businessData ? {
                    business_name: businessData.name,
                    business_nit: businessData.nit,
                    business_phone: businessData.phone,
                    business_email: businessData.email,
                    business_website: businessData.website,
                    business_currency: businessData.currency,
                    business_address: businessData.address,
                } : {},
                // Redirigir a una pantalla de éxito neutral o login
                emailRedirectTo: makeRedirectUri({
                    scheme: 'gestion360',
                    path: 'login'
                })
            }
        });
        if (error) throw error;
        return data;
    };

    const createBusiness = async (businessData) => {
        if (!user) throw new Error('Usuario no autenticado');

        const { data, error } = await supabase
            .from('businesses')
            .insert([{ 
                ...businessData, 
                user_id: user.id,
                // Asegurar que settings tenga valores por defecto si no vienen
                settings: businessData.settings || { theme: 'dark', tax_rate: 0.19 }
            }])
            .select()
            .single();

        if (error) throw error;
        setBusiness(data);
        return data;
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
        signInWithGoogle,
        signOut,
        createBusiness,
        refreshBusiness: () => fetchBusiness(user?.id),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
