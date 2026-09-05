import React from 'react';
import { LinkItem } from '../../Types';

interface LinkListProps {
    links: LinkItem[];
}

export const LinkList: React.FC<LinkListProps> = ({ links }) => {
    if (links.length === 0) {
        return (
            <p className="text-center text-sm text-white/40">Nenhum link disponível no momento.</p>
        );
    }

    return (
        <div className="w-full space-y-3">
            {links.map((link) => (
                <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/4 px-5 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/8"
                >
                    {link.icon_image && (
                        <img
                            src={link.icon_image}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded-md object-contain"
                        />
                    )}
                    <span className="flex-1 text-center text-sm font-medium text-white/85 transition-colors group-hover:text-white">
                        {link.title}
                    </span>
                    <span className="w-7 shrink-0 text-right font-mono text-xs text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/70">
                        →
                    </span>
                </a>
            ))}
        </div>
    );
};
