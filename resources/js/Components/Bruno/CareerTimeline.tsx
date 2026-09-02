import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gamepad2,
    Code2,
    Layout,
    Server,
    Rocket,
    Sparkles,
    LucideIcon,
} from 'lucide-react';
import { CareerMilestone } from '../../Types';
import { CareerOrb } from './CareerOrb';

interface CareerTimelineProps {
    milestones: CareerMilestone[];
}

const ORB_COLORS = ['#f59e0b', '#22c55e', '#38bdf8', '#8b5cf6', '#ec4899'];

const ICON_MAP: Record<string, LucideIcon> = {
    Gamepad2,
    Code2,
    Layout,
    Server,
    Rocket,
};

const resolveIcon = (name?: string | null): LucideIcon => (name && ICON_MAP[name]) || Sparkles;

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

export const CareerTimeline: React.FC<CareerTimelineProps> = ({ milestones }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    if (milestones.length === 0) return null;

    return (
        <section className="relative py-16 sm:py-20 px-6">
            <div className="max-w-xl mx-auto">
                <motion.span
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="text-[11px] font-mono uppercase tracking-widest text-gray-600 block text-center mb-12"
                >
                    Trajetória
                </motion.span>

                {/* Vertical rail — a single centered column of "standing" milestones */}
                <div className="relative">
                    <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                    <div className="space-y-10 sm:space-y-12">
                        {milestones.map((m, idx) => {
                            const color = ORB_COLORS[idx % ORB_COLORS.length];
                            const isHovered = hovered === m.id;

                            return (
                                <motion.div
                                    key={m.id}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-80px' }}
                                    variants={fadeUp}
                                    transition={{ duration: 0.4, delay: (idx % 4) * 0.05 }}
                                    onMouseEnter={() => setHovered(m.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className="relative flex flex-col items-center text-center space-y-3 cursor-default"
                                >
                                    <motion.div
                                        animate={{ scale: isHovered ? 1.12 : 1 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="relative w-14 h-14 z-10"
                                    >
                                        <CareerOrb color={color} icon={resolveIcon(m.icon_name)} active={isHovered} />
                                    </motion.div>

                                    <span
                                        className="text-2xl font-extrabold tracking-tight leading-none transition-opacity duration-300"
                                        style={{ color, opacity: isHovered ? 1 : 0.75 }}
                                    >
                                        {m.year}
                                    </span>

                                    <div className="space-y-1.5 max-w-xs">
                                        <h3 className="text-sm font-bold text-white">{m.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                                        {m.technologies && m.technologies.length > 0 && (
                                            <p className="text-[11px] font-mono text-gray-600 pt-1">
                                                {m.technologies.join(' · ')}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
