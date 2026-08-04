import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { MessageSquare, ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const FounderSection: React.FC = () => {
    const { t } = useTranslation();
    const [imgError, setImgError] = useState<boolean>(false);

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const specialties = ['Sistemas premium', 'Sites institucionais', 'Automações', 'Design digital'];
    const indicators = [
        { value: 'Brasil', label: 'Atendimento nacional' },
        { value: '24h', label: 'Resposta inicial' },
        { value: 'Real', label: 'Projetos aplicados' },
    ];

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Left: plain photo, no glow frame or card chrome */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5"
                    >
                        <div className="relative mx-auto max-w-md">
                            {!imgError ? (
                                <div className="relative h-[28rem] w-full rounded-3xl overflow-hidden bg-black/50 border border-white/10">
                                    <img
                                        src="/images/founder/bruno.jpg"
                                        alt="Bruno Kay"
                                        onError={() => setImgError(true)}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                            ) : (
                                <div className="h-[28rem] w-full rounded-3xl bg-[#0a0a0f] border border-white/10 flex flex-col items-center justify-center space-y-4">
                                    <span className="font-extrabold text-6xl text-white font-mono tracking-widest">
                                        BK
                                    </span>
                                    <span className="text-xs text-purple-400 font-mono uppercase tracking-widest">
                                        Fundador & Lead Engineer
                                    </span>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>BRUNO KAY</span>
                                <span className="text-purple-400">FOUNDER</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Bio & Credentials */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                            {t('home.founder_eyebrow', 'QUEM SOU EU')}
                        </span>

                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                            {t('home.founder_title', 'Tecnologia com execução real.')}
                        </h2>

                        <div>
                            <h3 className="text-xl font-bold text-white">{t('home.founder_name', 'Bruno Kay')}</h3>
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block">
                                {t('home.founder_role', 'Fundador da KayTech Solutions')}
                            </span>
                        </div>

                        <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
                            {t('home.founder_text', 'Meu nome é Bruno Kay, fundador da KayTech Solutions. Atuo no desenvolvimento de soluções digitais modernas, unindo design estratégico, engenharia de software e visão de negócio. Desenvolvo sistemas completos, sites institucionais, CRMs personalizados, automações inteligentes, dashboards administrativos, identidades e materiais digitais para projetos que precisam resolver problemas reais.')}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2">
                            {specialties.map((s, i) => (
                                <span key={i} className="text-xs font-mono uppercase tracking-wider text-gray-500 flex items-center gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-purple-500" />
                                    {s}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 font-mono">
                            {indicators.map((ind, i) => (
                                <div key={i} className="border-l-2 border-purple-500/30 pl-4">
                                    <span className="text-lg font-bold text-white block">{ind.value}</span>
                                    <span className="text-[10px] text-gray-500 uppercase block mt-1">{ind.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-6">
                            <button
                                onClick={() => scrollToAnchor('projetos')}
                                className="bg-white text-black font-semibold text-sm px-6 py-3.5 rounded-full transition-transform duration-300 hover:scale-[1.03] flex items-center gap-2"
                            >
                                <span>Ver meu portfólio</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => scrollToAnchor('contato')}
                                className="text-gray-300 hover:text-white font-medium text-sm transition flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4 text-purple-400" />
                                <span>{t('home.btn_talk_to_me', 'Falar comigo')}</span>
                            </button>

                            <Link
                                href="/brunokay"
                                className="text-gray-500 hover:text-purple-400 font-medium text-sm transition flex items-center gap-2 group/profile"
                            >
                                <span className="border-b border-transparent group-hover/profile:border-purple-400 transition-colors">
                                    {t('home.btn_full_profile', 'Ver perfil completo')}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                    </motion.div>

                </div>
            </div>
        </section>
    );
};
