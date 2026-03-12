import React, { createContext, useContext, useState, useEffect } from 'react';
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
        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
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
        path: 'auth',
    });

    const signInWithGoogle = async () => {
        console.log('--- SIGN IN WITH GOOGLE ---');
        console.log('Redirect URI:', redirectUrl);
        console.log('---------------------------');

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                },
            },
        });

        if (error) throw error;

        // Abrir el navegador para el flujo de OAuth
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (res.type === 'success' && res.url) {
            // Extraer hash fragment de la URL (Supabase devuelve tokens en el hash)
            const urlParts = res.url.split('#');
            const hash = urlParts.length > 1 ? urlParts[1] : '';

            // Parsear el hash manualmente o usando Linking
            const params = {};
            hash.split('&').forEach(part => {
                const [key, value] = part.split('=');
                if (key) params[key] = value;
            });

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


    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                // Redirigir al login para forzar una entrada limpia tras confirmación
                emailRedirectTo: Linking.createURL('login')
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
