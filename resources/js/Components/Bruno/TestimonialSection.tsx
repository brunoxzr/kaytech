import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '../../Types';

interface TestimonialSectionProps {
    testimonials: Testimonial[];
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ testimonials }) => {
    if (testimonials.length === 0) return null;

    return (
        <section className="py-16 sm:py-20 px-6">
            <div className="max-w-2xl mx-auto space-y-10">
                {testimonials.map((t) => (
                    <motion.div
                        key={t.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={fadeUp}
                        transition={{ duration: 0.5 }}
                        className="border-l-2 border-white/15 pl-5 space-y-3"
                    >
                        <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                            "{t.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                            {t.photo && (
                                <img src={t.photo} alt={t.author_name} className="w-8 h-8 rounded-full object-cover grayscale" />
                            )}
                            <span className="text-sm text-gray-500">
                                <strong className="text-white font-semibold">{t.author_name}</strong> — {t.author_role}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
