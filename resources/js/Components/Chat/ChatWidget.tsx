import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, GripHorizontal } from 'lucide-react';

export interface ChatMsg { role: 'user' | 'model'; text: string; }

interface ChatWidgetProps {
    endpoint: string;
    title: string;
    intro: string;
    placeholder?: string;
    theme?: 'dark' | 'ui';
}

const csrfToken = () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

/** Três pontinhos pulando — "digitando…" */
const TypingDots: React.FC<{ dark: boolean }> = ({ dark }) => (
    <span className="flex items-center gap-1 py-1">
        {[0, 1, 2].map((i) => (
            <motion.span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-white/60' : 'bg-[var(--ui-text-faint)]'}`}
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
        ))}
    </span>
);

const KayAvatar: React.FC<{ dark: boolean }> = ({ dark }) => (
    <span className={`grid h-6 w-6 shrink-0 select-none place-items-center overflow-hidden rounded-full border ${dark ? 'border-white/15 bg-white/10' : 'ui-b ui-subtle'}`}>
        <img src="/images/logo-kaytech.png" alt="KayTech" className="h-4 w-4 object-contain" />
    </span>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    endpoint, title, intro, placeholder = 'Escreva sua mensagem…', theme = 'dark',
}) => {
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [msgs, setMsgs] = React.useState<ChatMsg[]>([]);
    const [waLink, setWaLink] = React.useState<string | null>(null);
    const [drag, setDrag] = React.useState({ x: 0, y: 0 });
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const dragOrigin = React.useRef<{ mx: number; my: number; x: number; y: number } | null>(null);

    // Intro aparece "digitando" ao abrir pela primeira vez
    React.useEffect(() => {
        if (open && msgs.length === 0) {
            setSending(true);
            const t = setTimeout(() => {
                setMsgs([{ role: 'model', text: intro }]);
                setSending(false);
            }, 700);
            return () => clearTimeout(t);
        }
    }, [open]); // eslint-disable-line

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [msgs, sending, open]);

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        const next = [...msgs, { role: 'user' as const, text }];
        setMsgs(next);
        setInput('');
        setSending(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, text: m.text })) }),
            });
            const data = await res.json();
            setMsgs((m) => [...m, { role: 'model', text: data.reply ?? '(sem resposta)' }]);
            if (data.whatsapp) setWaLink(data.whatsapp);
        } catch {
            setMsgs((m) => [...m, { role: 'model', text: 'Falha de conexão. Tente novamente.' }]);
        } finally {
            setSending(false);
        }
    };

    /* ---- arrastar pela barra de título ---- */
    const onDragStart = (e: React.PointerEvent) => {
        dragOrigin.current = { mx: e.clientX, my: e.clientY, x: drag.x, y: drag.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onDragMove = (e: React.PointerEvent) => {
        if (!dragOrigin.current) return;
        const o = dragOrigin.current;
        setDrag({ x: o.x + (e.clientX - o.mx), y: o.y + (e.clientY - o.my) });
    };
    const onDragEnd = () => { dragOrigin.current = null; };

    const dark = theme === 'dark';
    const panelCls = dark ? 'border-white/12 bg-[#111] text-white' : 'ui-panel ui-t';
    const bubbleCls = dark ? 'bg-white text-black' : 'ui-btn-primary';
    const meCls = dark ? 'bg-white text-black' : 'bg-[var(--ui-primary)] text-[var(--ui-primary-contrast)]';
    const botCls = dark ? 'bg-white/10 text-white/90' : 'ui-subtle ui-t';
    const inputCls = dark ? 'bg-white/5 border-white/15 text-white placeholder-white/30' : 'ui-input';

    return (
        <>
            {/* Bolha */}
            <motion.button
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
                className={`fixed bottom-5 right-5 z-[60] grid place-items-center rounded-full shadow-lg ${bubbleCls}`}
                style={{ width: 52, height: 52 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={open ? 'x' : 'chat'}
                        initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}>
                        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                    </motion.span>
                </AnimatePresence>
            </motion.button>

            {/* Janela */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                        className={`fixed bottom-20 right-5 z-[60] flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl ${panelCls}`}
                        style={{ x: drag.x, y: drag.y }}
                    >
                        {/* Barra de título — arrastável */}
                        <div
                            onPointerDown={onDragStart}
                            onPointerMove={onDragMove}
                            onPointerUp={onDragEnd}
                            className={`flex cursor-grab items-center gap-2.5 border-b px-4 py-3 active:cursor-grabbing ${dark ? 'border-white/10' : 'ui-b'}`}
                        >
                            <KayAvatar dark={dark} />
                            <div className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold leading-tight">{title}</span>
                                <span className={`block text-[10px] ${dark ? 'text-white/40' : 'ui-t-faint'}`}>
                                    {sending ? 'digitando…' : 'online'}
                                </span>
                            </div>
                            <GripHorizontal className={`h-4 w-4 ${dark ? 'text-white/25' : 'ui-t-faint'}`} />
                            <button onClick={() => setOpen(false)} aria-label="Fechar" className="opacity-60 hover:opacity-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Mensagens */}
                        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                            <AnimatePresence initial={false}>
                                {msgs.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {m.role === 'model' && <KayAvatar dark={dark} />}
                                        <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                            m.role === 'user' ? `${meCls} rounded-br-sm` : `${botCls} rounded-bl-sm`
                                        }`}>
                                            {m.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {sending && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                                    <KayAvatar dark={dark} />
                                    <div className={`rounded-2xl rounded-bl-sm px-3 py-2 ${botCls}`}><TypingDots dark={dark} /></div>
                                </motion.div>
                            )}

                            {waLink && (
                                <motion.a
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    href={waLink} target="_blank" rel="noopener noreferrer"
                                    className={`block rounded-xl px-3 py-2.5 text-center text-[13px] font-medium ${dark ? 'bg-emerald-500 text-white' : 'ui-btn-primary'}`}
                                >
                                    Finalizar no WhatsApp →
                                </motion.a>
                            )}
                        </div>

                        {/* Campo */}
                        <div className={`flex items-center gap-2 border-t px-3 py-2.5 ${dark ? 'border-white/10' : 'ui-b'}`}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                                placeholder={placeholder}
                                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none ${inputCls}`}
                            />
                            <motion.button
                                onClick={send}
                                disabled={sending || !input.trim()}
                                whileTap={{ scale: 0.9 }}
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${bubbleCls} disabled:opacity-40`}
                            >
                                <Send className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
