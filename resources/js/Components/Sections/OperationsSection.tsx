import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export const OperationsSection: React.FC = () => {
    const { t } = useTranslation();

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            {/* Ambient background line, editorial rather than boxed banner */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Text column */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                            {t('home.ops_eyebrow', 'OPERAÇÃO INTELIGENTE')}
                        </span>

                        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
                            {t('home.ops_title', 'Menos desorganização, mais fluxo.')}
                        </h2>

                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl">
                            {t('home.ops_desc', 'A entrega não termina no layout: o objetivo é criar uma ferramenta que sustenta a rotina da empresa.')}
                        </p>

                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="group inline-flex items-center gap-3 text-white font-semibold text-sm pt-4"
                        >
                            <span className="border-b border-purple-500/40 group-hover:border-purple-400 pb-1 transition-colors">
                                {t('home.btn_ask_diagnosis', 'Pedir diagnóstico')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-purple-400 transition-transform group-hover:translate-x-1" />
                        </button>
                    </motion.div>

                    {/* Numbers column — huge editorial numerals, no card banner */}
                    <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-8 lg:gap-10 font-mono">
                        {[
                            { value: '86%', label: t('home.ops_stat_1', 'Clareza') },
                            { value: '42h', label: t('home.ops_stat_2', 'Poupadas') },
                            { value: '24/7', label: t('home.ops_stat_3', 'Online') },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={fadeUp}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="border-l-2 border-purple-500/30 pl-5"
                            >
                                <span className="text-4xl sm:text-6xl font-extrabold text-white block leading-none">
                                    {stat.value}
                                </span>
                                <span className="text-xs text-gray-500 mt-2 block uppercase tracking-widest">
                                    {stat.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
