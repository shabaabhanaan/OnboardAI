"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: any | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshUser: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const data = await auth.getUser();
            setUser(data);
        } catch (error) {
            console.error("Error fetching user in AuthProvider:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await auth.logout();
        setUser(null);
    };

    useEffect(() => {
        // Initial load
        refreshUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                refreshUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
