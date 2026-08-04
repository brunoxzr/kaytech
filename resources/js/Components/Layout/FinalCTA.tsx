import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { usePage } from '@inertiajs/react';
import { SharedProps } from '../../Types';
import { MessageSquare, ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
    const { t } = useTranslation();
    const { props } = usePage<SharedProps>();
    const whatsappUrl = props.whatsappUrl || 'https://wa.me/5500000000000';

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="bg-[#050505] pt-24 sm:pt-32 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-8"
                >
                    <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
                        {t('home.final_cta_title', 'Sua empresa merece tecnologia de verdade.')}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                        {t('home.final_cta_desc', 'Conte o que precisa ser criado, melhorado ou automatizado. A KayTech transforma essa necessidade em uma solução digital preparada para o uso real.')}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <button
                            onClick={() => scrollToAnchor('contato')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-8 py-4 rounded-xl transition shadow-xl shadow-purple-600/30 flex items-center gap-3"
                        >
                            <span>{t('home.btn_request_quote', 'Solicitar orçamento')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm px-8 py-4 rounded-xl transition flex items-center gap-3"
                        >
                            <MessageSquare className="w-4 h-4 text-green-400" />
                            <span>{t('home.btn_whatsapp', 'Falar pelo WhatsApp')}</span>
                        </a>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};
