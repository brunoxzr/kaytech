import React from 'react';
import {
    Link as LinkIcon,
    Globe,
    Mail,
    MessageCircle,
    Phone,
    Send,
    AtSign,
    Camera,
    Video,
    Music,
    Store,
    Briefcase,
} from 'lucide-react';
import { LinkItem } from '../../Types';

interface LinkListProps {
    links: LinkItem[];
}

type IconComponent = React.ComponentType<{ className?: string }>;

// Small curated set of icons available in this lucide-react version (1.28.0,
// which does not ship brand icons like Instagram/Github/Twitter/Facebook) —
// avoids `import * as Icons from 'lucide-react'`, which bundles the entire
// icon library (600+ KB) into this chunk.
const ICON_MAP: Record<string, IconComponent> = {
    Globe,
    Mail,
    MessageCircle,
    Phone,
    Send,
    AtSign,
    Camera,
    Video,
    Music,
    Store,
    Briefcase,
    Link: LinkIcon,
};

const FALLBACK_ICON: IconComponent = LinkIcon;

const resolveIcon = (name?: string | null): IconComponent => {
    if (!name) return FALLBACK_ICON;
    return ICON_MAP[name] || FALLBACK_ICON;
};

export const LinkList: React.FC<LinkListProps> = ({ links }) => {
    if (links.length === 0) {
        return (
            <p className="text-sm text-white/50 text-center">Nenhum link disponível no momento.</p>
        );
    }

    return (
        <div className="w-full space-y-3">
            {links.map((link) => {
                const Icon = resolveIcon(link.icon_name);
                return (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 w-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 backdrop-blur-md transition-all duration-300"
                    >
                        <Icon className="w-5 h-5 text-white/70 group-hover:text-white shrink-0 transition-colors" />
                        <span className="flex-1 text-center font-semibold text-white/90 group-hover:text-white transition-colors">
                            {link.title}
                        </span>
                    </a>
                );
            })}
        </div>
    );
};
