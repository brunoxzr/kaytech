import { useCallback, useEffect, useState } from 'react';

export type SiteTheme = 'dark' | 'light';
const KEY = 'kaytech_site_theme';

/** Tema do site público. Padrão: escuro. Persiste no navegador. */
export function useSiteTheme() {
    const [theme, setTheme] = useState<SiteTheme>(() => {
        if (typeof window === 'undefined') return 'dark';
        return (localStorage.getItem(KEY) as SiteTheme) || 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') root.setAttribute('data-site-theme', 'light');
        else root.removeAttribute('data-site-theme');
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
            return next;
        });
    }, []);

    return { theme, toggle };
}
