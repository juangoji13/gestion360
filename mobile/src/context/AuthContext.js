import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';

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

    // Configuración de Google Auth optimizada para Expo Go
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: '755009452836-2no96gvj5okvctp2htkloto466ti8bmf.apps.googleusercontent.com',
        // Forzamos Web Client ID en todas las plataformas para Expo Go
        iosClientId: '755009452836-2no96gvj5okvctp2htkloto466ti8bmf.apps.googleusercontent.com',
        androidClientId: '755009452836-2no96gvj5okvctp2htkloto466ti8bmf.apps.googleusercontent.com',
    }, {
        projectNameForProxy: 'Gestion360',
        useProxy: true,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token, params } = response;
            const token = id_token || params?.id_token;
            console.log('--- GOOGLE AUTH SUCCESS ---');
            console.log('Final Token Found:', token ? 'YES' : 'NO');
            if (token) {
                handleGoogleSignInWithIdToken(token);
            }
        } else if (response?.type === 'error') {
            console.error('--- GOOGLE AUTH ERROR ---');
            console.error('Error:', response.error);
            console.error('Description:', response.params?.error_description);
            console.log('-------------------------');
        }
    }, [response]);

    const handleGoogleSignInWithIdToken = async (idToken) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            if (error) throw error;
            if (data.user) {
                setUser(data.user);
                fetchBusiness(data.user.id);
            }
        } catch (error) {
            console.error('Error signing in with Google ID Token:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            // URI de redirección autorizada en Google Cloud
            const authProxyUri = 'https://auth.expo.io/@juangoji13/Gestion360';
            
            console.log('--- AUDITORÍA DE SOLICITUD ---');
            console.log('Redirigiendo a:', authProxyUri);
            console.log('Client ID:', '755009452836-2no96gvj5okvctp2htkloto466ti8bmf.apps.googleusercontent.com');
            console.log('------------------------------');
            
            await promptAsync({
                useProxy: true,
                redirectUri: authProxyUri,
            });
        } catch (error) {
            console.error('Error in Google Auth Prompt:', error);
            throw error;
        }
    };

    const signInWithOtp = async (email) => {
        const dynamicRedirectUrl = Linking.createURL('auth');
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: dynamicRedirectUrl,
            },
        });
        if (error) throw error;
        return data;
    };

    const signUp = async (email, password, businessData = null) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: businessData ? {
                    business_name: businessData.name,
                    business_nit: businessData.nit,
                    business_phone: businessData.phone,
                    business_email: businessData.email,
                    business_website: businessData.website,
                    business_currency: businessData.currency,
                    business_address: businessData.address,
                } : {},
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
        signInWithOtp,
        signOut,
        createBusiness,
        refreshBusiness: () => fetchBusiness(user?.id),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
