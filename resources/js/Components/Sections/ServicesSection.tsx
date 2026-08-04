import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Service } from '../../Types';
import { useTranslation } from '../../i18n';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface ServicesSectionProps {
    services: Service[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
    const { t } = useTranslation();
    const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.number || '01');

    return (
        <section id="servicos" className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-16 space-y-4"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        {t('home.services_eyebrow', 'SERVIÇOS')}
                    </span>

                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {t('home.services_title', 'Soluções completas para seu negócio.')}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed">
                        {t('home.services_desc', 'Um ecossistema completo de soluções digitais para impulsionar sua empresa com tecnologia, design, automação e estratégia.')}
                    </p>
                </motion.div>

                {/* Editorial interactive list — plain rows, no icon chips */}
                <div className="divide-y divide-white/10 border-t border-b border-white/10">
                    {services.map((service) => {
                        const isSelected = selectedServiceId === service.number;

                        return (
                            <div
                                key={service.number}
                                onClick={() => setSelectedServiceId(service.number)}
                                className="group cursor-pointer py-6"
                            >
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <span className={`font-mono text-sm transition-colors ${isSelected ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                            {service.number}
                                        </span>
                                        <h3 className={`text-xl sm:text-2xl font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                            {service.title}
                                        </h3>
                                    </div>

                                    <span className={`text-lg font-light transition-transform duration-300 ${isSelected ? 'rotate-45 text-purple-400' : 'text-gray-600'}`}>
                                        +
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pt-4 pl-0 sm:pl-14 max-w-3xl text-sm text-gray-400 leading-relaxed">
                                                {service.description}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};
