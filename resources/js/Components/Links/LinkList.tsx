import React from 'react';
import { LinkItem } from '../../Types';

interface LinkListProps {
    links: LinkItem[];
}

export const LinkList: React.FC<LinkListProps> = ({ links }) => {
    if (links.length === 0) {
        return (
            <p className="text-sm text-white/40 text-center">Nenhum link disponível no momento.</p>
        );
    }

    return (
        <div className="w-full space-y-2">
            {links.map((link) => (
                <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-full border border-white/10 hover:border-white/30 rounded-full px-5 py-3 transition-colors duration-300"
                >
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                        {link.title}
                    </span>
                </a>
            ))}
        </div>
    );
};
