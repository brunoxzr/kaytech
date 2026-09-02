import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../Types';

interface BrunoProjectsProps {
    projects: Project[];
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const BrunoProjects: React.FC<BrunoProjectsProps> = ({ projects }) => {
    if (projects.length === 0) return null;

    return (
        <section className="py-16 sm:py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <motion.span
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="text-[11px] font-mono uppercase tracking-widest text-gray-600 block mb-8"
                >
                    Projetos
                </motion.span>

                <div className="space-y-12">
                    {projects.map((project, idx) => (
                        <motion.article
                            key={project.slug}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={fadeUp}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className="group grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center"
                        >
                            <div className="sm:col-span-5 relative rounded-xl overflow-hidden border border-white/10 bg-black/40 h-40 sm:h-44">
                                <img
                                    src={project.cover}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            </div>
                            <div className="sm:col-span-7 space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
                                    {project.category}
                                </span>
                                <h3 className="text-base font-bold text-white">{project.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{project.summary}</p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {project.technologies.slice(0, 4).map((t, i) => (
                                        <span key={i} className="text-[10px] font-mono text-gray-600">
                                            {t}{i < Math.min(project.technologies.length, 4) - 1 ? ' /' : ''}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
                                    {project.projectUrl && (
                                        <a
                                            href={project.projectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-300 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition"
                                        >
                                            Visitar sistema
                                        </a>
                                    )}
                                    {project.extraLinks?.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-white transition"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
};
