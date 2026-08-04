import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const IntroSection: React.FC = () => {
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
        <section id="inicio" className="relative bg-[#050505] text-white pt-24 pb-24 md:pt-40 md:pb-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Massive typographic statement — no card, no glow, no pill badge */}
                <motion.h1
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="text-[13vw] sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.95] text-white max-w-5xl"
                >
                    {t('home.hero_title', 'Tecnologia que gera resultado real.')}
                </motion.h1>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                        className="lg:col-span-7 text-lg sm:text-xl text-gray-400 font-normal leading-relaxed max-w-2xl"
                    >
                        {t('home.hero_description', 'Sistemas, sites premium e automações sob medida para organizar processos, dados e atendimento em um só lugar.')}
                    </motion.p>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        className="lg:col-span-5 flex flex-wrap items-center gap-4 lg:justify-end"
                    >
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
                    </motion.div>
                </div>

                {/* Specialties row — plain typographic list, single purple accent as separator only */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                    className="mt-20 pt-8 border-t border-white/10 flex flex-wrap gap-x-10 gap-y-3"
                >
                    {specialties.map((label, i) => (
                        <span key={i} className="text-xs font-mono uppercase tracking-widest text-gray-500 flex items-center gap-2.5">
                            <span className="w-1 h-1 rounded-full bg-purple-500" />
                            {label}
                        </span>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};
