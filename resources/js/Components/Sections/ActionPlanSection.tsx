import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const ActionPlanSection: React.FC = () => {
    const { t } = useTranslation();

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const items = [
        { title: 'Sistema web centralizado', desc: t('home.action_plan_item1', 'Sistema web para centralizar dados, cadastros e operação.') },
        { title: 'Dashboard operacional', desc: t('home.action_plan_item2', 'Dashboard para acompanhar indicadores sem depender de achismo.') },
        { title: 'Automações inteligentes', desc: t('home.action_plan_item3', 'Automação para reduzir trabalho manual e erro humano.') },
    ];

    const highlights = [
        t('home.action_plan_h1', 'UX melhorada'),
        t('home.action_plan_h2', 'Web responsivo'),
        t('home.action_plan_h3', 'Dados organizados'),
    ];

    return (
        <section className="bg-[#07070a] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">
                            {t('home.action_plan_subtitle', 'Produto digital sob medida')}
                        </span>
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
                            {t('home.action_plan_title', 'Seu plano de ação')}
                        </h2>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                            {highlights.map((h, i) => (
                                <span key={i} className="text-xs font-mono text-gray-500">{h}</span>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="group inline-flex items-center gap-3 text-white font-semibold text-sm pt-4"
                        >
                            <span className="border-b border-purple-500/40 group-hover:border-purple-400 pb-1 transition-colors">
                                {t('home.btn_start_diagnosis', 'Começar diagnóstico')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-purple-400 transition-transform group-hover:translate-x-1" />
                        </button>
                    </motion.div>

                    {/* Numbered list — plain typographic rows, no fake dashboard/flowchart mockup */}
                    <div className="lg:col-span-8 divide-y divide-white/10 border-t border-b border-white/10">
                        {items.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={fadeUp}
                                transition={{ duration: 0.5, delay: idx * 0.08 }}
                                className="group grid grid-cols-12 gap-6 items-baseline py-8 sm:py-10"
                            >
                                <span className="col-span-2 sm:col-span-1 font-mono text-sm text-gray-600 group-hover:text-purple-400 transition-colors">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="col-span-10 sm:col-span-4 text-xl sm:text-2xl font-bold text-white">
                                    {item.title}
                                </h3>
                                <p className="hidden sm:block col-span-7 text-sm text-gray-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};
