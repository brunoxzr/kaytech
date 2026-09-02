import React from 'react';
import { motion } from 'framer-motion';

export const rise = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

/** Rótulo "…/ algo" — como na referência (.../About project, .../Projects). */
export const Slug: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`font-mono text-[11px] uppercase tracking-[0.22em] text-white/35 ${className}`}>
        …/ {children} …
    </span>
);

/**
 * Cabeçalho de seção — um bloco só, alinhado com o conteúdo.
 * `n` = número da seção (opcional), `title` = título em PT.
 */
export const SectionHeading: React.FC<{ n?: string; title: string; className?: string }> = ({ n, title, className = '' }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={rise}
        transition={{ duration: 0.6 }}
        className={`mb-10 flex items-baseline gap-4 ${className}`}
    >
        {n && <span className="font-mono text-sm text-white/30">{n}</span>}
        <h2 className="font-mono text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">{title}</h2>
    </motion.div>
);

/** @deprecated use SectionHeading */
export const SectionWord: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="font-mono text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">{children}</h2>
);

/** "…" decorativo das laterais do hero. */
export const Dots: React.FC<{ className?: string }> = ({ className = '' }) => (
    <span className={`font-mono text-2xl leading-none text-white/25 ${className}`}>…</span>
);

/**
 * Círculos finos gigantes de fundo (assinatura visual da referência).
 * Ficam atrás do conteúdo, saindo pela borda. `side` escolhe de onde nasce.
 */
export const OrbitLines: React.FC<{ side?: 'left' | 'right'; className?: string }> = ({ side = 'right', className = '' }) => (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
        <div
            className={`absolute top-1/2 aspect-square w-[42rem] -translate-y-1/2 rounded-full border border-white/[0.06] sm:w-[60rem]
                ${side === 'right' ? 'right-0 translate-x-1/3' : 'left-0 -translate-x-1/3'}`}
        />
        <div
            className={`absolute top-1/2 aspect-square w-[26rem] -translate-y-1/2 rounded-full border border-white/[0.05] sm:w-[38rem]
                ${side === 'right' ? 'right-0 translate-x-1/4' : 'left-0 -translate-x-1/4'}`}
        />
    </div>
);

/** Botão circular com seta ↗ — como no canto dos cards de projeto da referência. */
export const ArrowCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
    <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white/70 transition
            group-hover:border-white group-hover:bg-white group-hover:text-black ${className}`}
    >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </span>
);

/** Chip de tecnologia (pílula com borda). */
export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[11px] text-white/55">
        {children}
    </span>
);

/** Numeração vertical (1 2 3) ao lado de listas de cards. */
export const StepNumbers: React.FC<{ count: number; active?: number; className?: string }> = ({ count, active = 0, className = '' }) => (
    <div className={`hidden flex-col gap-3 lg:flex ${className}`} aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
            <span
                key={i}
                className={`grid h-8 w-8 place-items-center rounded-full border font-mono text-[11px] transition
                    ${i === active ? 'border-white text-white' : 'border-white/15 text-white/30'}`}
            >
                {i + 1}
            </span>
        ))}
    </div>
);
