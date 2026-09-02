import React, { createContext, useContext, useEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

interface AdminThemeContextValue {
    theme: AdminTheme;
    toggleTheme: () => void;
    darkMode: boolean; // compat
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

const KEY_THEME = 'kaytech_admin_theme';
const KEY_SIDEBAR = 'kaytech_admin_sidebarCollapsed';

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<AdminTheme>(() => {
        if (typeof window === 'undefined') return 'light';
        return (localStorage.getItem(KEY_THEME) as AdminTheme) || 'light';
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(KEY_SIDEBAR) === 'true';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-admin-theme', theme);
        return () => document.documentElement.removeAttribute('data-admin-theme');
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem(KEY_THEME, next);
            return next;
        });
    };

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(KEY_SIDEBAR, String(next));
            return next;
        });
    };

    return (
        <AdminThemeContext.Provider
            value={{ theme, toggleTheme, darkMode: theme === 'dark', sidebarCollapsed, toggleSidebar }}
        >
            {children}
        </AdminThemeContext.Provider>
    );
};

export function useAdminTheme(): AdminThemeContextValue {
    const ctx = useContext(AdminThemeContext);
    if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
    return ctx;
}
