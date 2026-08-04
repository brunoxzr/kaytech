import React from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLinkProps {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    collapsed: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon, active, collapsed }) => {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center rounded-lg py-2.5 transition ${
                collapsed ? 'justify-center px-2' : 'px-4 gap-3'
            } ${
                active
                    ? 'bg-purple-600/15 text-purple-300 border-l-2 border-purple-500 font-bold'
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            }`}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden font-mono text-xs"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};
