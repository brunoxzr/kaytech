import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const WorkProcess: React.FC = () => {
    const { t } = useTranslation();

    const steps = [
        {
            title: t('home.work_step1_name', 'Diagnóstico'),
            desc: t('home.work_step1_desc', 'Entendemos o cenário, processo e ferramentas para capturar onde está o gargalo.'),
            meta: t('home.work_step1_meta', '1 a 2 dias'),
        },
        {
            title: t('home.work_step2_name', 'Proposta'),
            desc: t('home.work_step2_desc', 'Transformamos o problema em escopo claro, fases e prioridades.'),
            meta: t('home.work_step2_meta', 'Escopo definido'),
        },
        {
            title: t('home.work_step3_name', 'Desenvolvimento'),
            desc: t('home.work_step3_desc', 'Construção com entregas visíveis, responsividade e foco no uso real.'),
            meta: t('home.work_step3_meta', 'Entregas visíveis'),
        },
        {
            title: t('home.work_step4_name', 'Evolução'),
            desc: t('home.work_step4_desc', 'Melhorias contínuas, suporte e ajustes conforme o negócio roda.'),
            meta: t('home.work_step4_meta', 'Contínuo'),
        },
    ];

    return (
        <section id="sobre" className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-20 space-y-4"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        {t('home.work_eyebrow', 'COMO TRABALHAMOS')}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {t('home.work_title', 'Clareza do primeiro call à evolução contínua.')}
                    </h2>
                </motion.div>

                {/* Horizontal rail of steps — connected by a single line, no boxed cards */}
                <div className="relative">
                    <div className="hidden md:block absolute top-2 left-0 right-0 h-px bg-white/10" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                        {steps.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={fadeUp}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="relative pt-8 group"
                            >
                                <span className="hidden md:block absolute -top-[7px] left-0 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 border-white/20 group-hover:border-purple-400 transition-colors" />

                                <span className="font-mono text-xs text-gray-600 block mb-3">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>

                                <h3 className="text-lg font-bold text-white mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {item.desc}
                                </p>

                                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
                                    {item.meta}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};
