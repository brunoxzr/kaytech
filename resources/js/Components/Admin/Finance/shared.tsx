import React from 'react';

/** Formata centavos (int) para BRL. */
export const brl = (cents: number): string =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const brlShort = (cents: number): string => {
    const v = cents / 100;
    if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(1).replace('.', ',')} mil`;
    return brl(cents);
};

export const ACCOUNT_TYPES: Record<string, string> = {
    checking: 'Conta corrente',
    savings: 'Poupança',
    cash: 'Dinheiro',
    credit_card: 'Cartão de crédito',
    investment: 'Investimento',
};

export const FREQUENCIES: Record<string, string> = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
};

export const TX_TYPES: Record<string, string> = {
    income: 'Entrada',
    expense: 'Saída',
    transfer: 'Transferência',
};

// Re-exporta os primitivos de UI para os formulários de finanças
export { Field, Input, Select, Textarea, Modal, Button, Badge, Panel, EmptyState } from '../ui';
import { Stat } from '../ui';

/** Kpi compat: aceita `accent` (default|green|red|amber) além de `tone`. */
export const Kpi: React.FC<{ label: string; value: string; accent?: string; hint?: string }> = ({ label, value, accent, hint }) => (
    <Stat label={label} value={value} hint={hint}
        tone={accent === 'green' ? 'pos' : accent === 'red' ? 'neg' : 'default'} />
);

// compat com código antigo que importava strings de classe
export const inputClass = 'ui-input';
export const primaryBtn = 'ui-btn ui-btn-primary';
