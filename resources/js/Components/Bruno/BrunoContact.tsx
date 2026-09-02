import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import { LinkPageSetting } from '../../Types';

interface BrunoContactProps {
    settings: LinkPageSetting;
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const BrunoContact: React.FC<BrunoContactProps> = ({ settings }) => {
    const { data, setData, post, processing, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/brunokay/contato', { onSuccess: () => reset() });
    };

    return (
        <section id="contato" className="py-16 sm:py-20 px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <span className="text-[11px] font-mono uppercase tracking-widest text-gray-600">
                        Vamos conversar
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Aberto para projetos, colaborações e ideias que realmente importam.
                    </h2>
                </motion.div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {settings.whatsapp_url && (
                        <a
                            href={settings.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition"
                        >
                            WhatsApp
                        </a>
                    )}
                    {settings.contact_email && (
                        <a
                            href={`mailto:${settings.contact_email}`}
                            className="text-gray-300 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition"
                        >
                            {settings.contact_email}
                        </a>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            placeholder="Seu nome"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 focus:border-white/40 px-0 py-2 text-sm text-white placeholder:text-gray-600 outline-none transition"
                        />
                        <input
                            type="email"
                            required
                            placeholder="seuemail@email.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 focus:border-white/40 px-0 py-2 text-sm text-white placeholder:text-gray-600 outline-none transition"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Assunto"
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 focus:border-white/40 px-0 py-2 text-sm text-white placeholder:text-gray-600 outline-none transition"
                    />
                    <textarea
                        required
                        rows={3}
                        placeholder="Me conta o desafio, ideia ou projeto..."
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 focus:border-white/40 px-0 py-2 text-sm text-white placeholder:text-gray-600 outline-none transition resize-none"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-sm font-semibold text-white border-b border-white pb-0.5 disabled:opacity-50 pt-2"
                    >
                        Enviar mensagem
                    </button>
                    {recentlySuccessful && (
                        <p className="text-sm text-gray-500">Mensagem enviada com sucesso.</p>
                    )}
                </form>
            </div>
        </section>
    );
};
