import React from 'react';
import { Project } from '../../Types';
import { useTranslation } from '../../i18n';
import { useReducedMotion } from '../../Hooks/useReducedMotion';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';

interface FeaturedCasesProps {
    projects: Project[];
}

export const FeaturedCases: React.FC<FeaturedCasesProps> = ({ projects }) => {
    const { t, locale } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (projects.length === 0) return null;

    // Multiply list for continuous loop
    const marqueeItems = [...projects, ...projects, ...projects];

    const Card: React.FC<{ item: Project; idx: number }> = ({ item, idx }) => (
        <a
            key={idx}
            href={`/${locale}/projetos/${item.slug}`}
            className="group relative flex-shrink-0 w-72 sm:w-96 h-80 sm:h-[26rem] rounded-3xl overflow-hidden border border-white/10 bg-black/40"
        >
            <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <div className="absolute top-5 left-5">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-purple-300 uppercase tracking-wider">
                    {item.category}
                </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {item.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{t('home.btn_view_more', 'Ver projeto')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
            </div>
        </a>
    );

    return (
        <section id="projetos" className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="max-w-3xl mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest">
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>{t('home.cases_eyebrow', 'CASES')}</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {t('home.cases_title', 'Resultados em negócios reais, não só telas bonitas.')}
                    </h2>
                </div>
            </div>

            {/* Infinite Carousel with Side Masks */}
            <div className="relative w-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

                {prefersReducedMotion ? (
                    <div className="flex flex-wrap items-center justify-center gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {projects.map((item, idx) => (
                            <Card key={idx} item={item} idx={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="flex w-max gap-6 px-6 animate-cases-marquee hover:[animation-play-state:paused]">
                        {marqueeItems.map((item, idx) => (
                            <Card key={idx} item={item} idx={idx} />
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Final Buttons */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => scrollToAnchor('contato')}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-8 py-4 rounded-xl transition shadow-lg shadow-purple-600/30"
                    >
                        {t('home.btn_similar_project', 'Iniciar meu projeto')}
                    </button>

                    <button
                        onClick={() => scrollToAnchor('servicos')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white font-medium text-sm px-8 py-4 rounded-xl transition"
                    >
                        {t('home.btn_view_services', 'Conhecer serviços')}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes cases-marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-cases-marquee {
                    animation: cases-marquee 60s linear infinite;
                }
            `}</style>
        </section>
    );
};
