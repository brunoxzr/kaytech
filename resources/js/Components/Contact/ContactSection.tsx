import React from 'react';
import { motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { useTranslation } from '../../i18n';
import { SharedProps } from '../../Types';
import { MessageCircle, ArrowUpRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const ContactSection: React.FC = () => {
    const { t } = useTranslation();
    const { props } = usePage<SharedProps>();
    const whatsappUrl = props.whatsappUrl || 'https://wa.me/5500000000000';

    return (
        <section id="contato" className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        {t('home.contact_eyebrow', 'VAMOS CONVERSAR')}
                    </span>

                    <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl mx-auto">
                        {t('home.contact_title', 'Sua empresa merece tecnologia de verdade.')}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed max-w-xl mx-auto">
                        {t('home.contact_desc', 'Chama no WhatsApp e vamos conversar sobre o que sua empresa precisa. Resposta inicial em até 24 horas.')}
                    </p>

                    <div className="pt-4">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 bg-white text-black font-semibold text-base px-9 py-5 rounded-full transition-transform duration-300 hover:scale-[1.03]"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>{t('home.btn_whatsapp', 'Falar pelo WhatsApp')}</span>
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
