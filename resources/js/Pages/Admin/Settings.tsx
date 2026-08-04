import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

interface SettingsProps {
    settings: {
        whatsapp_url?: string;
        contact_email?: string;
    };
    driver?: string;
}

export default function AdminSettings({ settings, driver }: SettingsProps) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        whatsapp_url: settings.whatsapp_url || 'https://wa.me/5500000000000',
        contact_email: settings.contact_email || 'bruno.kay2304@gmail.com',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/configuracoes');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 sm:p-10 space-y-8">
            <Head title="Configurações — Admin KayTech" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Configurações Globais</h1>
                    <p className="text-xs text-gray-400 mt-1">Ajuste links de contato, e-mail e provedor de tradução</p>
                </div>

                <Link href="/admin" className="text-xs text-gray-400 hover:text-white font-mono">← Dashboard</Link>
            </div>

            <div className="max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 space-y-6">
                {recentlySuccessful && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono">
                        ✓ Configurações atualizadas com sucesso!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono uppercase text-gray-300 mb-2">
                            URL do WhatsApp (VITE_WHATSAPP_URL)
                        </label>
                        <input
                            type="text"
                            required
                            value={data.whatsapp_url}
                            onChange={(e) => setData('whatsapp_url', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-gray-300 mb-2">
                            E-mail Corporativo de Contato
                        </label>
                        <input
                            type="email"
                            required
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono"
                        />
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <span className="text-xs font-mono uppercase text-purple-400 font-bold block">
                            Provedor de Tradução Automática (TRANSLATION_DRIVER)
                        </span>
                        <p className="text-xs text-gray-400 font-mono">
                            Provedor ativo no servidor: <strong className="text-white uppercase">{driver || 'deepl'}</strong>
                        </p>
                        <p className="text-[11px] text-gray-500">
                            Pode ser alternado em <code className="text-gray-400">config/translation.php</code> ou via <code className="text-gray-400">TRANSLATION_DRIVER=deepl|google|openai</code> no arquivo <code className="text-gray-400">.env</code>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition text-xs font-mono uppercase shadow-lg shadow-purple-600/30"
                    >
                        Salvar Configurações
                    </button>
                </form>
            </div>
        </div>
    );
}
