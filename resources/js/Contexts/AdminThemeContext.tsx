import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeSkin = 'default' | 'bordered';
export type ContentWidth = 'compact' | 'wide';
export type Direction = 'ltr' | 'rtl';

export interface ThemeCustomizer {
    accentColor: string;
    mode: ThemeMode;
    skin: ThemeSkin;
    contentWidth: ContentWidth;
    direction: Direction;
    radius: string;
    fontScale: string;
    highContrast: boolean;
    reduceMotion: boolean;
}

const DEFAULT_CUSTOMIZER: ThemeCustomizer = {
    accentColor: '#8b5cf6',
    mode: 'system',
    skin: 'default',
    contentWidth: 'wide',
    direction: 'ltr',
    radius: '0.75rem',
    fontScale: '1',
    highContrast: false,
    reduceMotion: false,
};

const STORAGE_KEY_CUSTOMIZER = 'kaytech_admin_themeCustomizer';
const STORAGE_KEY_SIDEBAR = 'kaytech_admin_sidebarCollapsed';
const STORAGE_KEY_DARK = 'kaytech_admin_darkMode';

interface AdminThemeContextValue {
    customizer: ThemeCustomizer;
    darkMode: boolean;
    sidebarCollapsed: boolean;
    customizerOpen: boolean;
    setCustomizerOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: string) => void;
    setSkin: (skin: ThemeSkin) => void;
    setContentWidth: (width: ContentWidth) => void;
    setDirection: (direction: Direction) => void;
    setRadius: (radius: string) => void;
    setFontScale: (scale: string) => void;
    setHighContrast: (value: boolean) => void;
    setReduceMotion: (value: boolean) => void;
    resetCustomizer: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

/** Exact same special-case as the reference design: a near-black accent auto-swaps to
 * near-white in dark mode so it never becomes invisible against a near-black background. */
function effectiveAccentColor(accentColor: string, darkMode: boolean): string {
    return accentColor === '#111827' && darkMode ? '#f4f4f5' : accentColor;
}

function effectiveAccentContrast(accentColor: string, darkMode: boolean): string {
    return effectiveAccentColor(accentColor, darkMode) === '#f4f4f5' ? '#09090b' : '#ffffff';
}

function readJSON<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch {
        return fallback;
    }
}

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customizer, setCustomizer] = useState<ThemeCustomizer>(() => readJSON(STORAGE_KEY_CUSTOMIZER, DEFAULT_CUSTOMIZER));
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(STORAGE_KEY_DARK) === 'true';
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
    });
    const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);

    const apply = useCallback((c: ThemeCustomizer, dark: boolean) => {
        const root = document.documentElement;
        const accent = effectiveAccentColor(c.accentColor, dark);
        const contrast = effectiveAccentContrast(c.accentColor, dark);

        root.style.setProperty('--admin-accent-color', accent);
        root.style.setProperty('--admin-accent-contrast', contrast);
        root.style.setProperty('--admin-ui-radius', c.radius);
        root.style.setProperty('--admin-font-scale', c.fontScale);

        root.classList.toggle('admin-dark', dark);
        root.classList.toggle('admin-ui-layout-rtl', c.direction === 'rtl');
        root.classList.toggle('admin-ui-high-contrast', c.highContrast);
        root.classList.toggle('admin-ui-reduce-motion', c.reduceMotion);
        root.classList.toggle('admin-ui-skin-bordered', c.skin === 'bordered');
    }, []);

    // Apply on mount and whenever state changes — scoped to admin only via the `admin-*` class/var prefixes,
    // so nothing here touches the public site's fixed dark/purple styling.
    useEffect(() => {
        apply(customizer, darkMode);
    }, [customizer, darkMode, apply]);

    const persistCustomizer = (next: ThemeCustomizer) => {
        setCustomizer(next);
        localStorage.setItem(STORAGE_KEY_CUSTOMIZER, JSON.stringify(next));
    };

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY_SIDEBAR, String(next));
            return next;
        });
    };

    const toggleTheme = () => {
        setDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY_DARK, String(next));
            persistCustomizer({ ...customizer, mode: next ? 'dark' : 'light' });
            return next;
        });
    };

    const setThemeMode = (mode: ThemeMode) => {
        const nextDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(nextDark);
        localStorage.setItem(STORAGE_KEY_DARK, String(nextDark));
        persistCustomizer({ ...customizer, mode });
    };

    const setAccentColor = (color: string) => persistCustomizer({ ...customizer, accentColor: color });
    const setSkin = (skin: ThemeSkin) => persistCustomizer({ ...customizer, skin });
    const setContentWidth = (contentWidth: ContentWidth) => persistCustomizer({ ...customizer, contentWidth });
    const setDirection = (direction: Direction) => persistCustomizer({ ...customizer, direction });
    const setRadius = (radius: string) => persistCustomizer({ ...customizer, radius });
    const setFontScale = (fontScale: string) => persistCustomizer({ ...customizer, fontScale });
    const setHighContrast = (highContrast: boolean) => persistCustomizer({ ...customizer, highContrast });
    const setReduceMotion = (reduceMotion: boolean) => persistCustomizer({ ...customizer, reduceMotion });

    const resetCustomizer = () => {
        persistCustomizer(DEFAULT_CUSTOMIZER);
        setThemeMode('system');
    };

    return (
        <AdminThemeContext.Provider
            value={{
                customizer,
                darkMode,
                sidebarCollapsed,
                customizerOpen,
                setCustomizerOpen,
                toggleSidebar,
                toggleTheme,
                setThemeMode,
                setAccentColor,
                setSkin,
                setContentWidth,
                setDirection,
                setRadius,
                setFontScale,
                setHighContrast,
                setReduceMotion,
                resetCustomizer,
            }}
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
