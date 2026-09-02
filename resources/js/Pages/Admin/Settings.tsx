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
        <div className="min-h-screen ui-canvas ui-t p-6 sm:p-10 space-y-8">
            <Head title="Configurações — Admin KayTech" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold ui-t tracking-tight">Configurações Globais</h1>
                    <p className="text-xs ui-t-soft mt-1">Ajuste links de contato, e-mail e provedor de tradução</p>
                </div>

                <Link href="/admin" className="text-xs ui-t-soft hover:ui-t ">← Dashboard</Link>
            </div>

            <div className="max-w-2xl ui-surface border ui-b rounded-xl p-8 space-y-6">
                {recentlySuccessful && (
                    <div className="p-4 rounded-xl ui-subtle border border-green-500/30 ui-pos text-xs ">
                        ✓ Configurações atualizadas com sucesso!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs  uppercase ui-t-soft mb-2">
                            URL do WhatsApp (VITE_WHATSAPP_URL)
                        </label>
                        <input
                            type="text"
                            required
                            value={data.whatsapp_url}
                            onChange={(e) => setData('whatsapp_url', e.target.value)}
                            className="w-full ui-subtle border ui-b rounded-xl px-4 py-3 text-sm ui-t "
                        />
                    </div>

                    <div>
                        <label className="block text-xs  uppercase ui-t-soft mb-2">
                            E-mail Corporativo de Contato
                        </label>
                        <input
                            type="email"
                            required
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            className="w-full ui-subtle border ui-b rounded-xl px-4 py-3 text-sm ui-t "
                        />
                    </div>

                    <div className="p-4 rounded-xl ui-surface border ui-b space-y-2">
                        <span className="text-xs  uppercase ui-t-soft font-medium block">
                            Provedor de Tradução Automática (TRANSLATION_DRIVER)
                        </span>
                        <p className="text-xs ui-t-soft ">
                            Provedor ativo no servidor: <strong className="ui-t uppercase">{driver || 'deepl'}</strong>
                        </p>
                        <p className="text-[11px] ui-t-faint">
                            Pode ser alternado em <code className="ui-t-soft">config/translation.php</code> ou via <code className="ui-t-soft">TRANSLATION_DRIVER=deepl|google|openai</code> no arquivo <code className="ui-t-soft">.env</code>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full ui-btn ui-btn-primary font-medium py-3.5 rounded-xl transition text-xs  uppercase "
                    >
                        Salvar Configurações
                    </button>
                </form>
            </div>
        </div>
    );
}
