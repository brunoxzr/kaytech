import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Loader2, Send, RefreshCw, QrCode, Search, ExternalLink, UserPlus } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Panel, Stat, Button } from '../../../Components/Admin/ui';

interface Chat {
    id: number; name: string | null; phone: string | null; is_group: boolean;
    profile_pic_url: string | null; last_message: string | null;
    last_message_at: string | null; unread: number; client_id: number | null;
}
interface Msg {
    id: number; from_me: boolean; type: string; body: string | null;
    media_url: string | null; status: string | null; sent_at: string;
}
interface Overview {
    chats: number; unread: number; waiting: number;
    sent_today: number; received_today: number; linked_clients: number;
}
interface Conn { state: string; error?: string }
interface Props { chats: Chat[]; connection: Conn; overview: Overview }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
const fmtTime = (s: string | null) => {
    if (!s) return '';
    const d = new Date(s);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};
const title = (c: Chat) => c.name || (c.phone ? `+${c.phone}` : c.is_group ? 'Grupo' : 'Contato');

const STATE_LABEL: Record<string, { txt: string; tone: string }> = {
    open: { txt: 'Conectado', tone: 'ui-pos' },
    connecting: { txt: 'Conectando…', tone: 'ui-t-soft' },
    close: { txt: 'Desconectado', tone: 'ui-neg' },
    not_configured: { txt: 'Não configurado', tone: 'ui-t-faint' },
    error: { txt: 'Erro', tone: 'ui-neg' },
    unknown: { txt: '—', tone: 'ui-t-faint' },
};

export default function Inbox({ chats, connection, overview }: Props) {
    const [activeId, setActiveId] = React.useState<number | null>(chats[0]?.id ?? null);
    const [messages, setMessages] = React.useState<Msg[]>([]);
    const [loadingThread, setLoadingThread] = React.useState(false);
    const [text, setText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [q, setQ] = React.useState('');
    const [qr, setQr] = React.useState<string | null>(null);
    const [showQr, setShowQr] = React.useState(false);
    const endRef = React.useRef<HTMLDivElement>(null);

    const active = chats.find((c) => c.id === activeId) ?? null;
    const st = STATE_LABEL[connection.state] ?? STATE_LABEL.unknown;

    const loadThread = React.useCallback(async (id: number) => {
        setLoadingThread(true);
        try {
            const res = await fetch(`/admin/whatsapp/conversas/${id}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            const data = await res.json();
            setMessages(data.messages ?? []);
        } catch {
            setMessages([]);
        } finally {
            setLoadingThread(false);
        }
    }, []);

    React.useEffect(() => {
        if (activeId) loadThread(activeId);
    }, [activeId, loadThread]);

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end' });
    }, [messages]);

    // polling leve a cada 15s
    React.useEffect(() => {
        const t = setInterval(() => {
            router.reload({ only: ['chats', 'overview'], preserveScroll: true, preserveState: true });
            if (activeId) loadThread(activeId);
        }, 15000);
        return () => clearInterval(t);
    }, [activeId, loadThread]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !activeId || sending) return;
        setSending(true);
        const body = text;
        setText('');
        setMessages((m) => [...m, { id: Date.now(), from_me: true, type: 'text', body, media_url: null, status: 'sending', sent_at: new Date().toISOString() }]);
        try {
            await fetch(`/admin/whatsapp/conversas/${activeId}/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ text: body }),
            });
            loadThread(activeId);
            router.reload({ only: ['chats', 'overview'], preserveScroll: true, preserveState: true });
        } catch {
            /* mantém o balão otimista */
        } finally {
            setSending(false);
        }
    };

    const openQr = async () => {
        setShowQr(true);
        setQr(null);
        try {
            const res = await fetch('/admin/whatsapp/conectar', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            const data = await res.json();
            setQr(data.qr ?? null);
        } catch {
            setQr(null);
        }
    };

    const filtered = chats.filter((c) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return title(c).toLowerCase().includes(s) || (c.last_message ?? '').toLowerCase().includes(s);
    });

    return (
        <AdminLayout
            title="Mensagens"
            subtitle="Seu WhatsApp dentro do painel — conversas, respostas e visão geral"
            headerAction={
                <div className="flex items-center gap-2">
                    <span className={`text-[12px] ${st.tone}`}>● {st.txt}</span>
                    <Button variant="ghost" onClick={openQr}><QrCode className="h-4 w-4" /> Conectar</Button>
                    <Button variant="ghost" onClick={() => router.reload({ only: ['chats', 'overview'] })}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            }
        >
            <Head title="Mensagens — Admin KayTech" />

            {/* Visão geral */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Stat label="Conversas" value={String(overview.chats)} />
                <Stat label="Não lidas" value={String(overview.unread)} tone={overview.unread > 0 ? 'neg' : 'default'} />
                <Stat label="Aguardando resposta" value={String(overview.waiting)} tone={overview.waiting > 0 ? 'neg' : 'default'} />
                <Stat label="Enviadas hoje" value={String(overview.sent_today)} />
                <Stat label="Recebidas hoje" value={String(overview.received_today)} />
                <Stat label="Ligadas ao CRM" value={String(overview.linked_clients)} />
            </div>

            {connection.state === 'not_configured' && (
                <Panel>
                    <p className="text-[13px] ui-t-soft">
                        Configure <code>EVOLUTION_BASE_URL</code> e <code>EVOLUTION_API_KEY</code> no <code>.env</code> do servidor,
                        crie a instância <code>{'{EVOLUTION_INSTANCE}'}</code> e aponte o webhook para
                        <code> /webhooks/evolution</code>. Depois clique em <strong>Conectar</strong> e escaneie o QR.
                    </p>
                </Panel>
            )}

            {/* Inbox */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                {/* lista */}
                <Panel className="flex max-h-[70vh] flex-col p-0">
                    <div className="border-b ui-b p-2">
                        <div className="flex items-center gap-2 rounded-lg ui-subtle px-2">
                            <Search className="h-3.5 w-3.5 ui-t-faint" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Buscar conversa"
                                className="w-full bg-transparent py-2 text-[13px] outline-none ui-t"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 && (
                            <p className="p-4 text-center text-[12px] ui-t-faint">Nenhuma conversa.</p>
                        )}
                        {filtered.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveId(c.id)}
                                className={`flex w-full items-center gap-3 border-b ui-b px-3 py-2.5 text-left transition ${
                                    c.id === activeId ? 'ui-subtle' : 'hover:ui-subtle'
                                }`}
                            >
                                <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ui-subtle text-[12px] ui-t-soft">
                                    {c.profile_pic_url ? <img src={c.profile_pic_url} alt="" className="h-full w-full object-cover" /> : title(c).slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[13px] font-medium ui-t">{title(c)}</span>
                                        <span className="shrink-0 text-[10px] ui-t-faint">{fmtTime(c.last_message_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[12px] ui-t-faint">{c.last_message}</span>
                                        {c.unread > 0 && (
                                            <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                                                {c.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </Panel>

                {/* thread */}
                <Panel className="flex max-h-[70vh] flex-col p-0">
                    {!active ? (
                        <p className="grid flex-1 place-items-center text-[13px] ui-t-faint">Selecione uma conversa.</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b ui-b p-3">
                                <div>
                                    <p className="text-[14px] font-semibold ui-t">{title(active)}</p>
                                    <p className="text-[11px] ui-t-faint">{active.phone ? `+${active.phone}` : active.is_group ? 'Grupo' : ''}</p>
                                </div>
                                <div className="flex gap-2">
                                    {active.client_id ? (
                                        <a href={`/admin/clientes`} className="ui-badge hover:ui-subtle">
                                            <ExternalLink className="h-3 w-3" /> no CRM
                                        </a>
                                    ) : active.phone ? (
                                        <button
                                            onClick={() =>
                                                router.post('/admin/clientes', {
                                                    name: title(active), phone: active.phone, status: 'lead',
                                                    source: 'WhatsApp', temperature: 'warm',
                                                }, { preserveScroll: true })
                                            }
                                            className="ui-badge hover:ui-subtle"
                                        >
                                            <UserPlus className="h-3 w-3" /> criar cliente
                                        </button>
                                    ) : null}
                                    {active.phone && (
                                        <a href={`https://wa.me/${active.phone}`} target="_blank" rel="noreferrer" className="ui-badge hover:ui-subtle">
                                            abrir no app
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                                {loadingThread && <div className="grid place-items-center py-6"><Loader2 className="h-4 w-4 animate-spin ui-t-faint" /></div>}
                                {!loadingThread && messages.length === 0 && (
                                    <p className="py-6 text-center text-[12px] ui-t-faint">Sem mensagens ainda.</p>
                                )}
                                {messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.from_me ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-[13px] ${
                                                m.from_me ? 'bg-emerald-600 text-white' : 'ui-subtle ui-t'
                                            }`}
                                        >
                                            {m.type !== 'text' && <span className="mr-1 opacity-70">[{m.type}]</span>}
                                            <span className="whitespace-pre-wrap break-words">{m.body || (m.media_url ? 'mídia' : '')}</span>
                                            <span className={`ml-2 text-[9px] ${m.from_me ? 'text-white/70' : 'ui-t-faint'}`}>
                                                {fmtTime(m.sent_at)}{m.from_me && m.status ? ` · ${m.status}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={endRef} />
                            </div>

                            <form onSubmit={send} className="flex items-end gap-2 border-t ui-b p-3">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); }
                                    }}
                                    rows={1}
                                    placeholder={connection.state === 'open' ? 'Escreva uma mensagem…' : 'Conecte o WhatsApp para enviar'}
                                    disabled={connection.state !== 'open'}
                                    className="max-h-32 min-h-10 flex-1 resize-none rounded-xl ui-subtle border ui-b px-3 py-2 text-[13px] ui-t disabled:opacity-50"
                                />
                                <Button type="submit" disabled={sending || !text.trim() || connection.state !== 'open'}>
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </>
                    )}
                </Panel>
            </div>

            {/* QR modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowQr(false)}>
                    <div className="ui-surface border ui-b rounded-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <p className="mb-3 text-[14px] font-semibold ui-t">Parear WhatsApp</p>
                        {qr ? (
                            <img src={qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`} alt="QR" className="mx-auto h-56 w-56" />
                        ) : (
                            <div className="grid h-56 w-56 place-items-center"><Loader2 className="h-5 w-5 animate-spin ui-t-faint" /></div>
                        )}
                        <p className="mt-3 text-[12px] ui-t-faint">WhatsApp → Aparelhos conectados → Conectar aparelho</p>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
