import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const DiagnosisSection: React.FC = () => {
    const { t } = useTranslation();

    const problems = [
        {
            num: '01',
            title: t('home.diagnosis_p1_title', 'Tempo perdido em tarefas manuais'),
            desc: t('home.diagnosis_p1_desc', 'Processos repetitivos que poderiam virar sistema, automação ou painel.'),
        },
        {
            num: '02',
            title: t('home.diagnosis_p2_title', 'Informações espalhadas'),
            desc: t('home.diagnosis_p2_desc', 'Planilhas, conversas e arquivos soltos dificultando decisões rápidas.'),
        },
        {
            num: '03',
            title: t('home.diagnosis_p3_title', 'Fluxo sem padrão'),
            desc: t('home.diagnosis_p3_desc', 'Cada pessoa executa de um jeito e o negócio perde previsibilidade.'),
        },
        {
            num: '04',
            title: t('home.diagnosis_p4_title', 'Decisão no escuro'),
            desc: t('home.diagnosis_p4_desc', 'Sem dashboards, fica difícil enxergar desempenho, gargalos e oportunidades.'),
        },
    ];

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-16 space-y-4"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        {t('home.diagnosis_eyebrow', 'DIAGNÓSTICO')}
                    </span>

                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        {t('home.diagnosis_title', 'Quando o operacional vira gargalo, a empresa para de escalar.')}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed pt-2">
                        {t('home.diagnosis_desc', 'Antes de escrever uma linha de código, a KayTech entende o fluxo real do negócio: tarefas manuais, dados espalhados, retrabalho, atendimento lento e decisões sem painel.')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border-t border-white/10 pt-12">
                    {problems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={fadeUp}
                            transition={{ duration: 0.5, delay: (idx % 2) * 0.1 }}
                            className="group relative pb-8 border-b border-white/10 transition-all duration-300 hover:border-purple-500/50"
                        >
                            <div className="flex items-start gap-6">
                                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-gray-700 group-hover:text-purple-400 transition-colors duration-300">
                                    {item.num}
                                </span>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};
