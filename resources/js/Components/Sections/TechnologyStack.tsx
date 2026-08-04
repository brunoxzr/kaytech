import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const TechnologyStack: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('frontend');

    const categories = [
        { id: 'frontend', name: 'Frontend' },
        { id: 'backend', name: 'Backend' },
        { id: 'data', name: 'Dados & APIs' },
        { id: 'ai', name: 'Inteligência Artificial' },
        { id: 'infra', name: 'Infraestrutura' },
    ];

    const stackData: Record<string, string[]> = {
        frontend: ['React', 'Vue.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Inertia.js'],
        backend: ['Laravel', 'PHP 8.3', 'Node.js', 'Python', 'REST APIs', 'Microserviços'],
        data: ['PostgreSQL', 'MySQL', 'Modelagem de dados', 'APIs REST', 'Cache & Redis'],
        ai: ['OpenAI API', 'Google Gemini', 'Agentes de IA', 'Chatbots', 'Visão computacional (YOLO)', 'MediaPipe'],
        infra: ['Git & GitHub', 'Docker', 'Linux', 'VPS Server', 'Nginx', 'Vercel', 'CI/CD Pipelines'],
    };

    return (
        <section className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-12 space-y-4"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        TECNOLOGIAS & STACK
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        Engenharia moderna e escalável.
                    </h2>
                </motion.div>

                {/* Category rail — plain text tabs, single underline, no pill buttons */}
                <div className="flex flex-wrap gap-x-8 gap-y-3 mb-12 border-b border-white/10 pb-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`relative text-sm font-medium pb-1 transition-colors ${
                                activeTab === cat.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {cat.name}
                            {activeTab === cat.id && (
                                <motion.span
                                    layoutId="stack-tab-underline"
                                    className="absolute -bottom-[25px] left-0 right-0 h-px bg-purple-500"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-wrap gap-x-10 gap-y-4"
                    >
                        {stackData[activeTab]?.map((item, idx) => (
                            <span
                                key={idx}
                                className="text-lg sm:text-xl font-mono text-gray-300 hover:text-purple-300 transition-colors cursor-default"
                            >
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </AnimatePresence>

            </div>
        </section>
    );
};
