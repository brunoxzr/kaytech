import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../Types';

interface AchievementsProps {
    achievements: Achievement[];
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
    if (achievements.length === 0) return null;

    return (
        <section className="py-16 sm:py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <motion.span
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="text-[11px] font-mono uppercase tracking-widest text-gray-600 block mb-6"
                >
                    Certificações & Reconhecimentos
                </motion.span>

                <div className="divide-y divide-white/10">
                    {achievements.map((a, idx) => (
                        <motion.div
                            key={a.id}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={fadeUp}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4"
                        >
                            <h3 className="text-sm font-bold text-white sm:w-56 shrink-0">{a.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{a.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
