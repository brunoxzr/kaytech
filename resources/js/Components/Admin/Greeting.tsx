import React from 'react';
import { usePage } from '@inertiajs/react';

interface AuthShape { auth?: { user?: { name?: string } | null } }

/** "Bom dia/tarde/noite, <primeiro nome>" — usa o horário local do navegador. */
export const Greeting: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { props } = usePage<AuthShape>();
    const full = props.auth?.user?.name ?? '';
    const first = full.split(' ')[0] || 'Bruno';

    const h = new Date().getHours();
    const { period, emoji } =
        h < 6 ? { period: 'Boa madrugada', emoji: '🌙' }
        : h < 12 ? { period: 'Bom dia', emoji: '☀️' }
        : h < 18 ? { period: 'Boa tarde', emoji: '👋' }
        : { period: 'Boa noite', emoji: '🌆' };

    return <span className={className}>{period}, {first} {emoji}</span>;
};
