import React from 'react';
import { useTranslation } from '../../i18n';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface HeroRevealProps {
    /** 0 to 1 — how visible the text overlay should be, driven by scroll progress */
    opacity: number;
}

export const HeroReveal: React.FC<HeroRevealProps> = ({ opacity }) => {
    const { t } = useTranslation();

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const specialties = [
        t('home.specialty_laravel', 'Laravel & PostgreSQL'),
        t('home.specialty_ai', 'Python & IA'),
        t('home.specialty_web', 'Sites responsivos'),
    ];

    return (
        <div
            className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8"
            style={{
                opacity,
                pointerEvents: opacity > 0.5 ? 'auto' : 'none',
                transition: 'opacity 0.15s linear',
            }}
        >
            <div className="max-w-4xl w-full text-center space-y-8">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[0.95] text-white">
                    {t('home.hero_title', 'Tecnologia que gera resultado real.')}
                </h1>

                <p className="text-base sm:text-xl text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
                    {t('home.hero_description', 'Sistemas, sites premium e automações sob medida para organizar processos, dados e atendimento em um só lugar.')}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <button
                        onClick={() => scrollToAnchor('contato')}
                        className="bg-white text-black font-semibold text-sm px-7 py-4 rounded-full transition-transform duration-300 hover:scale-[1.03] flex items-center gap-2.5 group"
                    >
                        <span>{t('home.btn_request_project', 'Solicitar projeto')}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                        onClick={() => scrollToAnchor('projetos')}
                        className="group text-gray-300 hover:text-white font-medium text-sm px-2 py-4 transition flex items-center gap-2"
                    >
                        <span className="border-b border-transparent group-hover:border-white/50 transition-colors">
                            {t('home.btn_view_portfolio', 'Ver portfólio')}
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                    {specialties.map((label, i) => (
                        <span key={i} className="text-xs font-mono uppercase tracking-widest text-gray-500 flex items-center gap-2.5">
                            <span className="w-1 h-1 rounded-full bg-purple-500" />
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
