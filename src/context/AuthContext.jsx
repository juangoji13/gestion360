import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { adminService } from '../services/adminService'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [business, setBusiness] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchBusiness(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchBusiness(session.user.id)
            } else {
                setBusiness(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchBusiness = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle()

            if (error && error.code === 'PGRST116') {
                // No business found — user needs to complete setup form
                setBusiness(null)
            } else if (error) {
                if (import.meta.env.DEV) {
                    console.error('Error fetching business:', error)
                }
            } else {
                setBusiness(data)
            }

            // Check admin status
            try {
                const admin = await adminService.isAdmin()
                setIsAdmin(admin)
            } catch {
                setIsAdmin(false)
            }
        } catch (err) {
            // Error handling already managed by service or caller
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, businessData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    business_name: businessData?.name || ''
                }
            }
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password, rememberMe = true) => {
        // Supabase uses local storage by default (persistent). For session-only, we store a flag.
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // If user chose NOT to persist session, mark it in sessionStorage so we can sign out on tab close
        if (!rememberMe) {
            sessionStorage.setItem('session_only', '1')
        } else {
            sessionStorage.removeItem('session_only')
        }
        return data
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        })
        if (error) throw error
    }

    const signInWithOtp = async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })
        if (error) throw error
    }

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setBusiness(null)
        setIsAdmin(false)
    }

    const updateBusiness = async (updates) => {
        if (!business) return
        const { data, error } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', business.id)
            .select()
            .single()
        if (error) throw error
        setBusiness(data)
        return data
    }

    const value = {
        user,
        business,
        isAdmin,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithOtp,
        resetPassword,
        signOut,
        updateBusiness,
        fetchBusiness,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
