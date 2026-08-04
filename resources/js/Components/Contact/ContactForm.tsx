import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '../../i18n';
import { SharedProps } from '../../Types';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactForm: React.FC = () => {
    const { t } = useTranslation();
    const { props } = usePage<SharedProps>();
    const flashSuccess = props.flash?.success;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        project_type: 'Sistema web',
        budget_range: 'R$ 5k — R$ 15k',
        message: '',
        privacy: false,
        website: '', // Honeypot
    });

    const projectTypes = [
        'Sistema web',
        'Site institucional',
        'Landing page',
        'CRM personalizado',
        'Dashboard',
        'Automação',
        'Integração',
        'Inteligência artificial',
        'Consultoria',
        'Outro',
    ];

    const budgetRanges = [
        'Até R$ 5.000',
        'R$ 5.000 a R$ 15.000',
        'R$ 15.000 a R$ 30.000',
        'Acima de R$ 30.000',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contato', {
            preserveScroll: true,
            onSuccess: () => {
                reset('name', 'company', 'email', 'phone', 'message', 'privacy');
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#09090e] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative">
            
            {/* Honeypot field - visually hidden */}
            <div className="hidden" aria-hidden="true">
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    autoComplete="off"
                />
            </div>

            {(recentlySuccessful || flashSuccess) && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{flashSuccess || t('contact.success_message', 'Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.')}</span>
                </div>
            )}

            {Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Por favor, verifique os campos indicados abaixo.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                    <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.name', 'Nome completo')} *
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        placeholder={t('contact.name_placeholder', 'Seu nome')}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>

                {/* Empresa */}
                <div>
                    <label htmlFor="company" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.company', 'Empresa / Organização')}
                    </label>
                    <input
                        id="company"
                        type="text"
                        placeholder={t('contact.company_placeholder', 'Nome da sua empresa (opcional)')}
                        value={data.company}
                        onChange={(e) => setData('company', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    />
                    {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* E-mail */}
                <div>
                    <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.email', 'E-mail corporativo')} *
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        placeholder={t('contact.email_placeholder', 'seu.email@empresa.com')}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                    <label htmlFor="phone" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.phone', 'WhatsApp / Telefone')}
                    </label>
                    <input
                        id="phone"
                        type="text"
                        placeholder={t('contact.phone_placeholder', '(00) 00000-0000')}
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    />
                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Tipo de Projeto */}
                <div>
                    <label htmlFor="project_type" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.project_type', 'Tipo de projeto')} *
                    </label>
                    <select
                        id="project_type"
                        value={data.project_type}
                        onChange={(e) => setData('project_type', e.target.value)}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    >
                        {projectTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Faixa de Investimento */}
                <div>
                    <label htmlFor="budget_range" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                        {t('contact.budget_range', 'Faixa de investimento estimada')}
                    </label>
                    <select
                        id="budget_range"
                        value={data.budget_range}
                        onChange={(e) => setData('budget_range', e.target.value)}
                        className="w-full bg-[#121218] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                    >
                        {budgetRanges.map((range) => (
                            <option key={range} value={range}>
                                {range}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mensagem */}
            <div>
                <label htmlFor="message" className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    {t('contact.message', 'Detalhes do projeto / necessidade')} *
                </label>
                <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder={t('contact.message_placeholder', 'Descreva o que precisa ser criado, automatizado ou melhorado...')}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                />
                {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>

            {/* Privacy Checkbox */}
            <div className="flex items-start gap-3">
                <input
                    id="privacy"
                    type="checkbox"
                    required
                    checked={data.privacy}
                    onChange={(e) => setData('privacy', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-white/5 border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="privacy" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                    {t('contact.privacy_consent', 'Concordo com o tratamento dos dados fornecidos para contato comercial.')}
                </label>
            </div>
            {errors.privacy && <p className="text-xs text-red-400">{errors.privacy}</p>}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm py-4 rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <Send className="w-4 h-4" />
                <span>{processing ? t('contact.sending', 'Enviando...') : t('contact.submit_button', 'Enviar solicitação')}</span>
            </button>
        </form>
    );
};
