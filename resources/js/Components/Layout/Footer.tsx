import React from 'react';
import { useTranslation } from '../../i18n';
import { usePage, Link } from '@inertiajs/react';
import { SharedProps } from '../../Types';
import { Mail, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
    const { t } = useTranslation();
    const { props } = usePage<SharedProps>();
    const whatsappUrl = props.whatsappUrl || 'https://wa.me/5500000000000';

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#030304] text-gray-400 border-t border-white/10 pt-20 sm:pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[0.95] max-w-4xl">
                    Vamos construir algo que resolve de verdade.
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo-kaytech.png" alt="KayTech Solutions" className="h-8 w-auto object-contain" />
                            <span className="font-bold text-lg text-white tracking-wider">
                                KayTech<span className="text-purple-500">.</span>
                            </span>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                            Soluções digitais premium para empresas, instituições e marcas que desejam crescer com tecnologia séria, design refinado e alta performance.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
                            Navegação
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <button onClick={() => scrollToAnchor('inicio')} className="hover:text-white transition">
                                    {t('navigation.home', 'Início')}
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToAnchor('projetos')} className="hover:text-white transition">
                                    {t('navigation.projects', 'Projetos')}
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToAnchor('servicos')} className="hover:text-white transition">
                                    {t('navigation.services', 'Serviços')}
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToAnchor('sobre')} className="hover:text-white transition">
                                    {t('navigation.about', 'Sobre')}
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToAnchor('contato')} className="hover:text-white transition">
                                    {t('navigation.contact', 'Contato')}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
                            Contato
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
                                    <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                                    <span>WhatsApp</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:bruno.kay2304@gmail.com" className="flex items-center gap-2 hover:text-white transition">
                                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                                    <span>bruno.kay2304@gmail.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column: bio-link pages */}
                    <div className="md:col-span-3 space-y-3 md:text-right">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
                            Links
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/links" className="hover:text-white transition">
                                    Todos os links
                                </Link>
                            </li>
                            <li>
                                <Link href="/brunokay" className="hover:text-white transition">
                                    Perfil de Bruno Kay
                                </Link>
                            </li>
                            <li className="pt-2">
                                <a href="/admin/login" className="text-[11px] text-gray-500 hover:text-purple-400 transition font-mono">
                                    [ Painel Administrativo ]
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
                    <p>© 2026 KayTech Solutions. Todos os direitos reservados.</p>
                    <p>Desenvolvido com excelência.</p>
                </div>

            </div>
        </footer>
    );
};
