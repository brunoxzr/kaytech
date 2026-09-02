import React from 'react';
import { X } from 'lucide-react';

/* ============ Painel ============ */
export const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={`ui-panel p-5 ${className}`}>{children}</div>
);

export const PanelTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
    <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[13px] font-semibold ui-t">{children}</h2>
        {action}
    </div>
);

/* ============ Cabeçalho de página ============ */
export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
    title, subtitle, action,
}) => (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold tracking-tight ui-t">{title}</h1>
            {subtitle && <p className="mt-1 text-[13px] ui-t-faint">{subtitle}</p>}
        </div>
        {action}
    </div>
);

/* ============ Stat (KPI silencioso — sem card pesado) ============ */
export const Stat: React.FC<{ label: string; value: string; tone?: 'default' | 'pos' | 'neg'; hint?: string }> = ({
    label, value, tone = 'default', hint,
}) => (
    <div className="ui-panel p-4">
        <span className="block text-[11px] font-medium uppercase tracking-wide ui-t-faint">{label}</span>
        <span className={`mt-1.5 block text-xl font-semibold tracking-tight ${tone === 'pos' ? 'ui-pos' : tone === 'neg' ? 'ui-neg' : 'ui-t'}`}>
            {value}
        </span>
        {hint && <span className="mt-0.5 block text-[11px] ui-t-faint">{hint}</span>}
    </div>
);

/* ============ Botões ============ */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' };
export const Button: React.FC<BtnProps> = ({ variant = 'primary', className = '', children, ...rest }) => (
    <button className={`ui-btn ui-btn-${variant} ${className}`} {...rest}>{children}</button>
);

/* ============ Campo ============ */
export const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide ui-t-faint">{label}</label>
        {children}
    </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...rest }) => (
    <input className={`ui-input ${className}`} {...rest} />
);
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...rest }) => (
    <select className={`ui-input ${className}`} {...rest}>{children}</select>
);
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...rest }) => (
    <textarea className={`ui-input ${className}`} {...rest} />
);

/* ============ Modal — X sempre no canto superior direito ============ */
export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
    open, onClose, title, children,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="ui-panel w-full max-w-lg p-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-6 px-6 pb-4 pt-5">
                    <h2 className="text-base font-semibold ui-t">{title}</h2>
                    <button onClick={onClose} aria-label="Fechar" className="ui-t-faint transition hover:ui-t">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="border-t ui-b px-6 py-5">{children}</div>
            </div>
        </div>
    );
};

/* ============ Estado vazio ============ */
export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="ui-panel px-6 py-12 text-center text-[13px] ui-t-faint">{children}</div>
);

/* ============ Badge ============ */
export const Badge: React.FC<{ children: React.ReactNode; tone?: 'default' | 'pos' | 'neg' }> = ({ children, tone = 'default' }) => (
    <span className={`ui-badge ${tone === 'pos' ? 'ui-pos' : tone === 'neg' ? 'ui-neg' : ''}`}>{children}</span>
);
