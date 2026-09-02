import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { OrbitLines, rise } from '../Editorial/primitives';

/**
 * Hero editorial — JetBrains Mono gigante (a máquina) + ênfase em Newsreader itálico (a voz).
 * "…" nas laterais, círculos finos ao fundo, sem vídeo, sem cor.
 */
export const TypographicHero: React.FC = () => {
    const { t } = useTranslation();
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <section id="inicio" className="relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44">
            <OrbitLines side="right" />
            <div className="mx-auto max-w-5xl">
                <motion.div initial="hidden" animate="visible" variants={rise} transition={{ duration: 0.7 }}>
                    <div className="mb-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
                        <span className="text-lg leading-none text-white/25">…</span>
                        <img src="/images/logo-kaytech.png" alt="" className="h-8 w-auto object-contain opacity-80" />
                        <span>KayTech Solutions</span>
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-white/30">Est. 2024</span>
                        <span className="text-lg leading-none text-white/25">…</span>
                    </div>

                    <h1 className="font-mono text-[2.75rem] font-extrabold leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
                        {t('home.hero_line1', 'Software')}
                        <br />
                        <span className="ml-[8%] inline-block">
                            {t('home.hero_line2', 'sob medida')}
                        </span>
                    </h1>

                    <p className="mt-10 max-w-xl text-lg leading-relaxed text-white/60">
                        Sistemas web, dashboards e automações que tiram a empresa do{' '}
                        <span className="say text-white/80">operacional manual</span> — do diagnóstico à{' '}
                        <span className="say text-white/80">evolução contínua</span>.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-8">
                        <button
                            onClick={() => scrollTo('contato')}
                            className="border-b-2 border-white pb-1 font-mono text-sm font-semibold uppercase tracking-wide text-white"
                        >
                            {t('home.hero_cta', 'Começar diagnóstico')}
                        </button>
                        <button
                            onClick={() => scrollTo('projetos')}
                            className="font-mono text-sm text-white/45 transition hover:text-white"
                        >
                            {t('home.hero_cta_secondary', 'Ver projetos')} →
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
