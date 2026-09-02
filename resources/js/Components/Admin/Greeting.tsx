import React from 'react';
import { usePage } from '@inertiajs/react';

interface AuthShape { auth?: { user?: { name?: string } | null } }

/** "Bom dia/tarde/noite, <primeiro nome>" — usa o horário local do navegador. */
export const Greeting: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { props } = usePage<AuthShape>();
    const full = props.auth?.user?.name ?? '';
    const first = full.split(' ')[0] || 'Bruno';

    const h = new Date().getHours();
    const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

    return <span className={className}>{period}, {first}</span>;
};
