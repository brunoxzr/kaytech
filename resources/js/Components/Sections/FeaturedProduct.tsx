import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { Camera, ExternalLink } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const FeaturedProduct: React.FC = () => {
    const { t } = useTranslation();
    const [count, setCount] = useState<number>(142);
    const [fps, setFps] = useState<number>(60);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            setFps(prev => Math.floor(58 + Math.random() * 4));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        t('home.kayvision_f1', 'Dashboard em tempo real'),
        t('home.kayvision_f2', 'Contador de fluxo'),
        t('home.kayvision_f3', 'Hot zones'),
    ];

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-6 space-y-6"
                    >
                        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                            {t('home.kayvision_eyebrow', 'PRODUTO EM DESTAQUE')}
                        </span>

                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            {t('home.kayvision_title', 'KayVision: visão computacional para operações inteligentes.')}
                        </h2>

                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-normal max-w-xl">
                            {t('home.kayvision_desc', 'Plataforma para transformar fluxo de pessoas, comportamento e movimento em dados claros para decisões melhores em lojas, eventos e espaços físicos.')}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                            {features.map((f, i) => (
                                <span key={i} className="text-xs font-mono uppercase tracking-wider text-gray-500 flex items-center gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-purple-500" />
                                    {f}
                                </span>
                            ))}
                        </div>

                        <div className="pt-4">
                            <a
                                href="/kayvision.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 bg-white text-black font-semibold text-sm px-7 py-4 rounded-full transition-transform duration-300 hover:scale-[1.03]"
                            >
                                <span>{t('home.btn_access_kayvision', 'Acessar KayVision')}</span>
                                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: live camera-feed demo — the one bespoke "product screenshot" worth keeping */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="lg:col-span-6 relative"
                    >
                        <div className="bg-[#09090e] border border-white/10 rounded-3xl p-6 space-y-4">

                            <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/5 pb-3">
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Camera className="w-4 h-4" />
                                    <span>CAM 01 — FLUXO LOJA PRINCIPAL</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-green-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        LIVE
                                    </span>
                                    <span>{fps} FPS</span>
                                </div>
                            </div>

                            <div className="relative h-64 sm:h-72 rounded-2xl bg-black overflow-hidden border border-white/5 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                                <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl" />
                                <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl" />

                                <div className="absolute top-10 left-12 w-20 h-28 border border-purple-400/60 rounded p-1 text-[9px] font-mono text-purple-300">
                                    <span>OBJ 98%</span>
                                </div>
                                <div className="absolute bottom-12 right-20 w-16 h-24 border border-purple-400/60 rounded p-1 text-[9px] font-mono text-purple-300">
                                    <span>OBJ 95%</span>
                                </div>

                                <div className="relative z-10 text-center">
                                    <span className="text-[10px] font-mono text-purple-400 tracking-widest block uppercase mb-1">
                                        FLUXO DE PESSOAS HOJE
                                    </span>
                                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                                        {count}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 font-mono text-xs text-center pt-2">
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Permanência Média</span>
                                    <span className="text-white font-bold">14.2 min</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Pico Diário</span>
                                    <span className="text-purple-300 font-bold">17:30</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block">Precisão IA</span>
                                    <span className="text-green-400 font-bold">99.4%</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
