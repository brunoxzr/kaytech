import React from 'react';
import { useTranslation } from '../../i18n';
import { usePage, Link } from '@inertiajs/react';
import { SharedProps } from '../../Types';
import { ProspectBot } from '../Chat/ProspectBot';

export const Footer: React.FC = () => {
    const { t } = useTranslation();
    const { props } = usePage<SharedProps>();
    const whatsappUrl = props.whatsappUrl || 'https://wa.me/5500000000000';

    const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const nav = [
        ['projetos', t('navigation.projects', 'Projetos')],
        ['servicos', t('navigation.services', 'Serviços')],
        ['processo', 'Processo'],
        ['fundador', 'Quem faz'],
        ['contato', t('navigation.contact', 'Contato')],
    ];

    return (
        <footer className="border-t border-white/10 bg-[#0d0d0d]">
            <div className="mx-auto max-w-5xl px-6 py-16">
                <div className="grid gap-10 sm:grid-cols-12">
                    {/* Marca */}
                    <div className="sm:col-span-5">
                        <div className="flex items-center gap-2.5">
                            <img src="/images/logo-kaytech.png" alt="KayTech" className="h-9 w-auto object-contain" />
                            <span className="font-mono text-sm font-semibold text-white">KayTech</span>
                        </div>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                            Software sob medida — <span className="say">do diagnóstico à evolução contínua</span>.
                        </p>
                    </div>

                    {/* Navegação */}
                    <div className="sm:col-span-3">
                        <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">Navegação</h4>
                        <ul className="space-y-2 font-mono text-[13px]">
                            {nav.map(([id, label]) => (
                                <li key={id}>
                                    <button onClick={() => go(id)} className="text-white/55 transition hover:text-white">
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contato + links */}
                    <div className="sm:col-span-4">
                        <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">Contato</h4>
                        <ul className="space-y-2 font-mono text-[13px]">
                            <li>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                                   className="text-white/55 transition hover:text-white">WhatsApp</a>
                            </li>
                            <li>
                                <a href="mailto:bruno.kay2304@gmail.com"
                                   className="text-white/55 transition hover:text-white">bruno.kay2304@gmail.com</a>
                            </li>
                            <li>
                                <Link href="/brunokay" className="text-white/55 transition hover:text-white">Portfólio do Bruno</Link>
                            </li>
                            <li>
                                <a href="/admin/login" className="text-white/30 transition hover:text-white">Painel administrativo</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} KayTech Solutions</span>
                    <span>Curitiba / Brasil</span>
                </div>
            </div>

            <ProspectBot />
        </footer>
    );
};
