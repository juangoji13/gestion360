import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

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
                
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    // Solo cargamos la empresa existente. 
                    // La creación atómica ahora ocurre en el método signUp.
                    fetchBusiness(session.user.id);
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

    const signUp = async (email, password, businessData) => {
        // 1. Crear el usuario
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: Linking.createURL('login')
            }
        });
        
        if (error) throw error;

        // 2. Crear la empresa inmediatamente si tenemos los datos (Sincronización Atómica)
        if (data?.user && businessData) {
            console.log('Atomic Business Creation for:', data.user.id);
            const { error: businessError } = await supabase
                .from('businesses')
                .insert([{ 
                    name: businessData.name,
                    tax_id: businessData.nit,
                    phone: businessData.phone,
                    address: businessData.address,
                    user_id: data.user.id,
                    default_tax_rate: 19 // Valor por defecto según esquema
                }]);
            
            if (businessError) {
                console.error('Error in atomic business creation:', businessError);
            }
        }

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
        refreshBusiness: () => fetchBusiness(user?.id),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
