import React from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

export interface ChatMsg { role: 'user' | 'model'; text: string; }

interface ChatWidgetProps {
    /** endpoint que recebe { messages } e responde { reply, done?, whatsapp? } */
    endpoint: string;
    title: string;
    intro: string;
    placeholder?: string;
    /** aparência: 'dark' (site público) | 'ui' (admin, usa tokens ui-*) */
    theme?: 'dark' | 'ui';
    /** csrf p/ rotas web */
    csrf?: string | null;
}

const csrfToken = () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export const ChatWidget: React.FC<ChatWidgetProps> = ({
    endpoint, title, intro, placeholder = 'Escreva sua mensagem…', theme = 'dark',
}) => {
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [msgs, setMsgs] = React.useState<ChatMsg[]>([{ role: 'model', text: intro }]);
    const [waLink, setWaLink] = React.useState<string | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [msgs, open]);

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
                body: JSON.stringify({ messages: next.filter((m) => m.text !== intro).map((m) => ({ role: m.role, text: m.text })) }),
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

    const dark = theme === 'dark';
    const panelCls = dark
        ? 'border-white/12 bg-[#111] text-white'
        : 'ui-panel ui-t';
    const bubbleCls = dark
        ? 'bg-white text-black'
        : 'ui-btn-primary';
    const meCls = dark ? 'bg-white text-black' : 'bg-[var(--ui-primary)] text-[var(--ui-primary-contrast)]';
    const botCls = dark ? 'bg-white/10 text-white/90' : 'ui-subtle ui-t';
    const inputCls = dark
        ? 'bg-white/5 border-white/15 text-white placeholder-white/30'
        : 'ui-input';

    return (
        <>
            {/* Bolha */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
                className={`fixed bottom-5 right-5 z-[60] grid h-13 w-13 place-items-center rounded-full shadow-lg transition hover:scale-105 ${bubbleCls}`}
                style={{ width: 52, height: 52 }}
            >
                {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </button>

            {/* Janela */}
            {open && (
                <div className={`fixed bottom-20 right-5 z-[60] flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl ${panelCls}`}>
                    <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? 'border-white/10' : 'ui-b'}`}>
                        <span className="text-[13px] font-semibold">{title}</span>
                        <button onClick={() => setOpen(false)} aria-label="Fechar" className="opacity-60 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        {msgs.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[13px] leading-relaxed ${m.role === 'user' ? meCls : botCls}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className={`rounded-xl px-3 py-2 ${botCls}`}><Loader2 className="h-4 w-4 animate-spin" /></div>
                            </div>
                        )}
                        {waLink && (
                            <a href={waLink} target="_blank" rel="noopener noreferrer"
                               className={`block rounded-xl px-3 py-2.5 text-center text-[13px] font-medium ${dark ? 'bg-emerald-500 text-white' : 'ui-btn-primary'}`}>
                                Finalizar no WhatsApp →
                            </a>
                        )}
                    </div>

                    <div className={`flex items-center gap-2 border-t px-3 py-2.5 ${dark ? 'border-white/10' : 'ui-b'}`}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                            placeholder={placeholder}
                            className={`flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none ${inputCls}`}
                        />
                        <button onClick={send} disabled={sending || !input.trim()}
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${bubbleCls} disabled:opacity-40`}>
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
