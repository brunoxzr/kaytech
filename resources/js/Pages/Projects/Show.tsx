import React from 'react';
import { Project } from '../../Types';
import { SeoHead } from '../../Components/UI/SeoHead';
import { Navbar } from '../../Components/Layout/Navbar';
import { Footer } from '../../Components/Layout/Footer';
import { useTranslation } from '../../i18n';
import { SectionHeading, Chip, OrbitLines } from '../../Components/Editorial/primitives';

interface ShowProjectProps {
    project: Project;
    relatedProjects: Project[];
}

export default function ShowProject({ project, relatedProjects }: ShowProjectProps) {
    const { t, locale } = useTranslation();

    return (
        <div className="min-h-screen bg-[#0d0d0d] font-mono text-white antialiased">
            <SeoHead
                title={`${project.title} — Case KayTech`}
                description={project.summary}
                ogImage={project.cover}
            />
            <Navbar visible />

            <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
                <a href={`/${locale}#projetos`}
                   className="text-[11px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white">
                    ← {t('projects.back_to_projects', 'Voltar para projetos')}
                </a>

                {/* Cabeçalho */}
                <div className="relative mt-10">
                    <OrbitLines side="right" />
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">{project.category}</span>
                    <h1 className="mt-3 text-4xl font-medium leading-[0.95] tracking-tighter sm:text-6xl">
                        {project.title}
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">{project.summary}</p>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6">
                        <div className="flex flex-wrap gap-1.5">
                            {project.technologies.map((tech) => <Chip key={tech}>{tech}</Chip>)}
                        </div>
                        {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                               className="border-b border-white pb-1 text-[13px] font-medium text-white">
                                {t('projects.visit_project', 'Acessar projeto')} ↗
                            </a>
                        )}
                    </div>
                </div>

                {/* Capa */}
                <div className="mt-12 overflow-hidden border border-white/10 bg-black">
                    <img src={project.cover} alt={project.title} className="max-h-[600px] w-full object-cover" />
                </div>

                {/* Desafio / Solução */}
                <div className="mt-12 grid grid-cols-1 gap-10 border-t border-white/10 pt-10 md:grid-cols-2">
                    {project.challenge && (
                        <div>
                            <SectionHeading title="O desafio" />
                            <p className="mt-3 text-sm leading-relaxed text-white/55">{project.challenge}</p>
                        </div>
                    )}
                    {project.solution && (
                        <div>
                            <SectionHeading title="A solução" />
                            <p className="mt-3 text-sm leading-relaxed text-white/55">{project.solution}</p>
                        </div>
                    )}
                </div>

                {/* Galeria */}
                {project.gallery && project.gallery.length > 0 && (
                    <div className="mt-12 border-t border-white/10 pt-10">
                        <SectionHeading title="Interface" />
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {project.gallery.map((img, idx) => (
                                <div key={idx} className="overflow-hidden border border-white/10 bg-black">
                                    <img src={img} alt={`${project.title} ${idx + 1}`} className="w-full object-cover grayscale transition duration-700 hover:grayscale-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Relacionados */}
                {relatedProjects.length > 0 && (
                    <div className="mt-12 border-t border-white/10 pt-10">
                        <SectionHeading title="Outros cases" />
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {relatedProjects.map((p) => (
                                <a key={p.slug} href={`/${locale}/projetos/${p.slug}`}
                                   className="group block overflow-hidden border border-white/10">
                                    <div className="aspect-16/10 overflow-hidden bg-black">
                                        <img src={p.cover} alt={p.title}
                                             className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0" />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[13px] font-medium">{p.title}</p>
                                        <p className="text-[11px] text-white/35">{p.category}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 border-t border-white/10 pt-10">
                    <div className="flex items-start gap-4">
                        <span className="font-mono text-2xl text-white/25">…</span>
                        <div>
                            <h3 className="max-w-lg font-mono text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
                                {t('projects.want_similar', 'Quer algo assim para a sua empresa?')}
                            </h3>
                            <a href={`/${locale}#contato`}
                               className="mt-4 inline-block border-b border-white pb-1 text-[13px] font-medium text-white">
                                {t('projects.request_similar_btn', 'Falar com a KayTech')} →
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
