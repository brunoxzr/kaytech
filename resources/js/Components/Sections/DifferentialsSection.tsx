import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { Award, MessageSquare, Sliders, Sparkles, Gauge, Layers, TrendingUp, CheckCircle, Headphones } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const DifferentialsSection: React.FC = () => {
    const { t } = useTranslation();

    const items = [
        { icon: MessageSquare, title: t('home.diff_1_title', 'Atendimento direto'), desc: t('home.diff_1_desc', 'Comunicação estratégica e sem intermediários.') },
        { icon: Sliders, title: t('home.diff_2_title', 'Soluções sob medida'), desc: t('home.diff_2_desc', 'Cada projeto é único e personalizado.') },
        { icon: Sparkles, title: t('home.diff_3_title', 'Visual premium'), desc: t('home.diff_3_desc', 'Design de alto padrão e impactante.') },
        { icon: Gauge, title: t('home.diff_4_title', 'Alta performance'), desc: t('home.diff_4_desc', 'Sistemas rápidos e otimizados.') },
        { icon: Layers, title: t('home.diff_5_title', 'Tecnologia moderna'), desc: t('home.diff_5_desc', 'Stack atualizada e escalável.') },
        { icon: TrendingUp, title: t('home.diff_6_title', 'Foco em resultado'), desc: t('home.diff_6_desc', 'Tecnologia construída para gerar valor real.') },
        { icon: CheckCircle, title: t('home.diff_7_title', 'Entrega profissional'), desc: t('home.diff_7_desc', 'Qualidade, organização e compromisso em cada etapa.') },
        { icon: Headphones, title: t('home.diff_8_title', 'Suporte próximo'), desc: t('home.diff_8_desc', 'Acompanhamento dedicado durante a evolução do projeto.') },
    ];

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Editorial split header: big number-like eyebrow + huge title on the left, description on the right */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 sm:mb-24 pb-8 border-b border-white/10"
                >
                    <div className="lg:col-span-8 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest">
                            <Award className="w-3.5 h-3.5" />
                            <span>{t('home.differentials_eyebrow', 'DIFERENCIAIS')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
                            {t('home.differentials_title', 'Por que escolher a KayTech?')}
                        </h2>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                            {t('home.differentials_desc', 'Não entregamos apenas código. Entregamos soluções que geram resultado real para o seu negócio.')}
                        </p>
                    </div>
                </motion.div>

                {/* Asymmetric list: alternating row layout instead of a uniform 4x2 card grid */}
                <div className="divide-y divide-white/5">
                    {items.map((diff, idx) => {
                        const IconComp = diff.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={fadeUp}
                                transition={{ duration: 0.5, delay: (idx % 4) * 0.05 }}
                                className="group grid grid-cols-12 gap-4 sm:gap-8 items-center py-6 sm:py-8 hover:bg-white/[0.015] transition-colors px-2 -mx-2 rounded-xl"
                            >
                                <span className="col-span-2 sm:col-span-1 font-mono text-xs sm:text-sm text-gray-600 group-hover:text-purple-400 transition-colors">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="col-span-2 sm:col-span-1 flex justify-start">
                                    <div className="p-2 w-max rounded-xl bg-white/5 text-gray-300 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition">
                                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <h3 className="col-span-8 sm:col-span-4 text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition">
                                    {diff.title}
                                </h3>
                                <p className="hidden sm:block sm:col-span-6 text-sm text-gray-500 leading-relaxed">
                                    {diff.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};
