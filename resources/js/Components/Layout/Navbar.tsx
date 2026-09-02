import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Locale, SUPPORTED_LOCALES } from '../../i18n/types';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useSiteTheme } from '../../Hooks/useSiteTheme';

interface NavbarProps {
    visible?: boolean;
}

const NAV_ITEMS: { id: string; key: string; fallback: string }[] = [
    { id: 'projetos', key: 'navigation.projects', fallback: 'Projetos' },
    { id: 'servicos', key: 'navigation.services', fallback: 'Serviços' },
    { id: 'sobre', key: 'navigation.about', fallback: 'Sobre' },
];

export const Navbar: React.FC<NavbarProps> = ({ visible = true }) => {
    const { t, locale } = useTranslation();
    const { theme, toggle: toggleTheme } = useSiteTheme();
    const [scrolled, setScrolled] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
    const [activeSection, setActiveSection] = useState<string>('inicio');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);

            for (const { id } of NAV_ITEMS) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 200 && rect.bottom >= 200) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (newLocale: Locale) => {
        setLangDropdownOpen(false);
        setMobileMenuOpen(false);
        document.cookie = `kaytech_locale=${newLocale}; path=/; max-age=31536000`;
        const currentPath = window.location.pathname.replace(/^\/(pt-BR|en|es)/, '');
        window.location.href = `/${newLocale}${currentPath || ''}`;
    };

    const scrollToAnchor = (id: string) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = `/${locale}#${id}`;
        }
    };

    if (!visible) return null;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 font-mono transition-all duration-300 ${
                scrolled ? 'bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/10 py-4' : 'py-5'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-8">
                {/* Logo */}
                <a href={`/${locale}`} className="flex shrink-0 items-center gap-2.5">
                    <img src="/images/logo-kaytech.png" alt="KayTech" className="h-10 w-auto object-contain" />
                    <span className="text-sm font-semibold tracking-tight text-white">KayTech</span>
                </a>

                {/* Direita — links + tema + CTA */}
                <div className="hidden md:flex items-center gap-7">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToAnchor(item.id)}
                            className={`text-[13px] transition ${
                                activeSection === item.id ? 'text-white' : 'text-white/45 hover:text-white'
                            }`}
                        >
                            {t(item.key, item.fallback)}
                        </button>
                    ))}
                    <button
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
                        className="text-white/45 transition hover:text-white"
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => scrollToAnchor('contato')}
                        className="border border-white/25 px-4 py-1.5 text-[13px] font-medium text-white transition hover:border-white"
                    >
                        {t('navigation.request_project', 'Solicitar projeto')}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-1 md:hidden">
                    <button onClick={toggleTheme} className="p-2 text-white" aria-label="Alternar tema">
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-white"
                        aria-expanded={mobileMenuOpen}
                        aria-label="Alternar menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#0d0d0d] px-6 py-8">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToAnchor(item.id)}
                            className="block w-full border-b border-white/5 py-4 text-left font-mono text-xl font-medium text-white/85 transition hover:text-white"
                        >
                            {t(item.key, item.fallback)}
                        </button>
                    ))}

                    <div className="mt-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/35">
                            <span>Idioma</span>
                            <div className="flex gap-3">
                                {SUPPORTED_LOCALES.map((loc) => (
                                    <button
                                        key={loc.code}
                                        onClick={() => changeLanguage(loc.code)}
                                        className={locale === loc.code ? 'text-white' : 'text-white/40'}
                                    >
                                        {loc.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="w-full border border-white py-3 text-center text-[13px] font-medium text-white"
                        >
                            {t('navigation.request_project', 'Solicitar projeto')}
                        </button>
                        <a href="/admin/login" className="text-center text-[11px] uppercase tracking-wider text-white/30">
                            Acesso administrativo
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
};
