import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Locale, SUPPORTED_LOCALES } from '../../i18n/types';
import { Globe, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
    visible?: boolean;
}

const NAV_ITEMS: { id: string; key: string; fallback: string }[] = [
    { id: 'inicio', key: 'navigation.home', fallback: 'Início' },
    { id: 'projetos', key: 'navigation.projects', fallback: 'Projetos' },
    { id: 'servicos', key: 'navigation.services', fallback: 'Serviços' },
    { id: 'sobre', key: 'navigation.about', fallback: 'Sobre' },
    { id: 'contato', key: 'navigation.contact', fallback: 'Contato' },
];

export const Navbar: React.FC<NavbarProps> = ({ visible = true }) => {
    const { t, locale } = useTranslation();
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/10 py-4' : 'py-6'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo — plain wordmark, no card */}
                <a href={`/${locale}`} className="flex items-center gap-3 group">
                    <img
                        src="/images/logo-kaytech.png"
                        alt="KayTech Solutions"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-bold text-lg text-white tracking-tight">
                        KayTech<span className="text-purple-500">.</span>
                    </span>
                </a>

                {/* Desktop Navigation — plain text links, single underline for active state */}
                <div className="hidden md:flex items-center gap-9">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToAnchor(item.id)}
                            className={`relative text-sm font-medium transition py-1 ${
                                activeSection === item.id ? 'text-white' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {t(item.key, item.fallback)}
                            {activeSection === item.id && (
                                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-purple-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Right Actions: Language Switcher & CTA */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="relative">
                        <button
                            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{locale}</span>
                        </button>

                        {langDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-40 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                                {SUPPORTED_LOCALES.map((loc) => (
                                    <button
                                        key={loc.code}
                                        onClick={() => changeLanguage(loc.code)}
                                        className={`w-full text-left px-4 py-2 text-xs transition flex items-center justify-between ${
                                            locale === loc.code ? 'text-purple-400 font-bold' : 'text-gray-300 hover:text-white'
                                        }`}
                                    >
                                        <span>{loc.label}</span>
                                        <span className="text-[10px] text-gray-500 font-mono">{loc.shortLabel}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => scrollToAnchor('contato')}
                        className="group bg-white text-black font-semibold text-xs px-5 py-2.5 rounded-full transition-transform duration-300 hover:scale-[1.04] flex items-center gap-2"
                    >
                        <span>{t('navigation.request_project', 'Solicitar Projeto')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        className="flex items-center gap-1 text-xs font-mono text-gray-400"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{locale}</span>
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
                <div className="md:hidden bg-[#050505] border-t border-white/10 px-6 py-8 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToAnchor(item.id)}
                            className="block w-full text-left py-3.5 text-2xl font-bold text-white/90 hover:text-purple-400 transition-colors border-b border-white/5"
                        >
                            {t(item.key, item.fallback)}
                        </button>
                    ))}

                    <div className="pt-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-mono uppercase tracking-wider">
                            <span>Idioma</span>
                            <div className="flex gap-3">
                                {SUPPORTED_LOCALES.map((loc) => (
                                    <button
                                        key={loc.code}
                                        onClick={() => changeLanguage(loc.code)}
                                        className={locale === loc.code ? 'text-purple-400 font-bold' : 'text-gray-500'}
                                    >
                                        {loc.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="w-full bg-white text-black font-semibold text-sm py-3.5 rounded-full text-center"
                        >
                            {t('navigation.request_project', 'Solicitar Projeto')}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};
