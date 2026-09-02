import React from 'react';

const NAV = [
    { label: 'Início', id: 'inicio' },
    { label: 'Sobre', id: 'sobre' },
    { label: 'Projetos', id: 'projetos' },
    { label: 'Skills', id: 'carreira' },
    { label: 'Contato', id: 'contato' },
];

interface BrunoFooterProps {
    displayName: string;
}

export const BrunoFooter: React.FC<BrunoFooterProps> = ({ displayName }) => {
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <footer className="border-t border-white/10 py-10 px-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <span className="text-sm font-bold text-white">{displayName}</span>

                    <nav className="flex flex-wrap gap-5">
                        {NAV.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className="text-xs text-gray-500 hover:text-white transition"
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-[11px] font-mono text-gray-600">
                    <p>© {new Date().getUTCFullYear()} {displayName}</p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hover:text-white transition"
                    >
                        Voltar ao topo
                    </button>
                </div>
            </div>
        </footer>
    );
};
