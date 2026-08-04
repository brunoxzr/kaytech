import React from 'react';
import { Project } from '../../Types';
import { SeoHead } from '../../Components/UI/SeoHead';
import { Navbar } from '../../Components/Layout/Navbar';
import { Footer } from '../../Components/Layout/Footer';
import { useTranslation } from '../../i18n';
import { ArrowLeft, ExternalLink, CheckCircle2, Sparkles, Layers } from 'lucide-react';

interface ShowProjectProps {
    project: Project;
    relatedProjects: Project[];
}

export default function ShowProject({ project, relatedProjects }: ShowProjectProps) {
    const { t, locale } = useTranslation();

    const scrollToAnchor = (id: string) => {
        window.location.href = `/${locale}#${id}`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden">
            <SeoHead
                title={`${project.title} — Case KayTech Solutions`}
                description={project.summary}
                ogImage={project.cover}
            />

            <Navbar visible={true} />

            <main className="pt-32 pb-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    
                    {/* Back button */}
                    <div>
                        <a
                            href={`/${locale}#projetos`}
                            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-purple-400 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{t('projects.back_to_projects', 'Voltar para Projetos')}</span>
                        </a>
                    </div>

                    {/* Header Details */}
                    <div className="space-y-6 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{project.category}</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                            {project.title}
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-normal">
                            {project.summary}
                        </p>

                        {/* Tech tags & external link */}
                        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/10">
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-purple-300"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            {project.projectUrl && (
                                <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/30"
                                >
                                    <span>{t('projects.visit_project', 'Acessar Projeto')}</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Main Cover Display */}
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
                        <img
                            src={project.cover}
                            alt={project.title}
                            className="w-full h-auto max-h-[600px] object-cover"
                        />
                    </div>

                    {/* Challenge & Solution Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        {project.challenge && (
                            <div className="p-8 rounded-3xl bg-[#0a0a0f] border border-white/10 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest">
                                    <Layers className="w-4 h-4" />
                                    <span>{t('projects.challenge', 'O Desafio')}</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                    {project.challenge}
                                </p>
                            </div>
                        )}

                        {project.solution && (
                            <div className="p-8 rounded-3xl bg-[#0a0a0f] border border-white/10 space-y-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-green-400 uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('projects.solution', 'A Solução')}</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                    {project.solution}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Gallery if present */}
                    {project.gallery && project.gallery.length > 0 && (
                        <div className="space-y-6 pt-8">
                            <h3 className="text-2xl font-bold text-white tracking-tight">Galeria de Interface</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {project.gallery.map((img, idx) => (
                                    <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                                        <img src={img} alt={`${project.title} gallery ${idx}`} className="w-full h-auto object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Call to action for similar project */}
                    <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-950/30 via-[#0d0d14] to-[#050505] border border-purple-500/20 text-center space-y-6">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                            {t('projects.want_similar', 'Deseja um projeto semelhante para sua empresa?')}
                        </h3>
                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-8 py-4 rounded-xl transition shadow-xl shadow-purple-600/30"
                        >
                            {t('projects.request_similar_btn', 'Falar com um Especialista')}
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
