import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Loader2, Send, RefreshCw, QrCode, Search, ExternalLink, UserPlus, Download, FileText, Reply, X } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Button } from '../../../Components/Admin/ui';

interface Chat {
    id: number; name: string | null; phone: string | null; is_group: boolean;
    profile_pic_url: string | null; last_message: string | null;
    last_message_at: string | null; unread: number; client_id: number | null;
    client_name: string | null; client_status: string | null; is_lead: boolean;
}
interface ClientHit { id: number; name: string; company: string | null; phone: string | null; status: string; }
interface Msg {
    id: number; wamid: string | null; from_me: boolean; type: string; body: string | null;
    media_url: string | null; mimetype: string | null;
    reply_to_wamid: string | null; reply_to_preview: string | null;
    status: string | null; sent_at: string;
}
interface Conn { state: string; error?: string }
interface Props { chats: Chat[]; connection: Conn }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
const fmtTime = (s: string | null) => {
    if (!s) return '';
    const d = new Date(s);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};
const title = (c: Chat) => c.name || (c.phone ? `+${c.phone}` : c.is_group ? 'Grupo' : 'Contato');
const initials = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, ' ').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const STATE_LABEL: Record<string, { txt: string; tone: string }> = {
    open: { txt: 'Conectado', tone: 'ui-pos' },
    connecting: { txt: 'Conectando…', tone: 'ui-t-soft' },
    close: { txt: 'Desconectado', tone: 'ui-neg' },
    not_configured: { txt: 'Não configurado', tone: 'ui-t-faint' },
    error: { txt: 'Erro', tone: 'ui-neg' },
    unknown: { txt: '—', tone: 'ui-t-faint' },
};

type Filter = 'all' | 'unread' | 'leads' | 'groups';
const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'unread', label: 'Não lidas' },
    { key: 'leads', label: 'Leads' },
    { key: 'groups', label: 'Grupos' },
];

function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
    const [broken, setBroken] = React.useState(false);
    if (url && !broken) {
        return (
            <img
                src={url}
                alt=""
                onError={() => setBroken(true)}
                style={{ width: size, height: size }}
                className="shrink-0 rounded-full object-cover"
            />
        );
    }
    return (
        <div
            style={{ width: size, height: size }}
            className="grid shrink-0 place-items-center rounded-full bg-[#2a3942] text-[13px] font-medium text-[#8696a0]"
        >
            {initials(name) || '?'}
        </div>
    );
}

function QuotedStrip({ preview, fromMe }: { preview: string; fromMe: boolean }) {
    return (
        <div className={`mb-1 rounded border-l-4 py-1 pl-2 pr-2 text-[12px] ${fromMe ? 'border-white/40 bg-white/10' : 'border-[#00a884] bg-black/20'}`}>
            <span className="line-clamp-2 opacity-80">{preview}</span>
        </div>
    );
}

function Bubble({ m }: { m: Msg }) {
    const mediaSrc = `/admin/whatsapp/midia/${m.id}`;
    const quoted = m.reply_to_preview ? <QuotedStrip preview={m.reply_to_preview} fromMe={m.from_me} /> : null;
    const time = (
        <span className={`ml-2 align-bottom text-[10px] ${m.from_me ? 'text-white/70' : 'text-[#667781]'}`}>
            {fmtTime(m.sent_at)}
        </span>
    );

    if (m.type === 'image') {
        return (
            <div className="max-w-[280px] overflow-hidden rounded-lg">
                {quoted && <div className="px-1 pt-1">{quoted}</div>}
                <img src={mediaSrc} alt="" className="w-full object-cover" loading="lazy" />
                {m.body && <div className="px-2 py-1 text-[13px]">{m.body}</div>}
                <div className="px-2 pb-1 text-right">{time}</div>
            </div>
        );
    }
    if (m.type === 'video') {
        return (
            <div className="max-w-[280px] overflow-hidden rounded-lg">
                {quoted && <div className="px-1 pt-1">{quoted}</div>}
                <video src={mediaSrc} controls className="w-full" />
                <div className="px-2 pb-1 text-right">{time}</div>
            </div>
        );
    }
    if (m.type === 'audio') {
        return (
            <div className="min-w-[220px]">
                {quoted}
                <div className="flex items-center gap-2">
                    <audio src={mediaSrc} controls className="h-10 max-w-[240px]" />
                    {time}
                </div>
            </div>
        );
    }
    if (m.type === 'sticker') {
        return (
            <div>
                {quoted}
                <img src={mediaSrc} alt="" className="h-32 w-32 object-contain" loading="lazy" />
            </div>
        );
    }
    if (m.type === 'document') {
        return (
            <div>
                {quoted}
                <a href={mediaSrc} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] underline">
                    <FileText className="h-4 w-4 shrink-0" /> {m.body || 'Documento'} <Download className="h-3.5 w-3.5 shrink-0" />
                </a>
            </div>
        );
    }
    return (
        <>
            {quoted}
            <span className="whitespace-pre-wrap break-words text-[13.5px]">{m.body}</span>
            {time}
        </>
    );
}

function ClientLinkMenu({ chat }: { chat: Chat }) {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState<ClientHit[]>([]);
    const [searching, setSearching] = React.useState(false);
    const boxRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    React.useEffect(() => {
        if (!open || q.trim().length < 2) { setResults([]); return; }
        setSearching(true);
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/admin/whatsapp/clientes/buscar?q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
                setResults(await res.json());
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q, open]);

    const link = (clientId: number | null) => {
        router.patch(`/admin/whatsapp/conversas/${chat.id}/vincular`, { client_id: clientId }, { preserveScroll: true });
        setOpen(false);
        setQ('');
    };

    const createNew = () => {
        router.post('/admin/clientes', {
            name: title(chat), phone: chat.phone, status: 'lead',
            source: 'WhatsApp', temperature: 'warm',
        }, { preserveScroll: true });
        setOpen(false);
    };

    return (
        <div className="relative" ref={boxRef}>
            {chat.client_id ? (
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-1 rounded-full bg-[#2a3942] px-2.5 py-1 text-[11px] text-[#e9edef] hover:bg-[#334148]"
                >
                    <ExternalLink className="h-3 w-3" /> {chat.client_name ?? 'no CRM'}
                    {chat.client_status && <span className="opacity-60">· {chat.client_status}</span>}
                </button>
            ) : (
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-1 rounded-full bg-[#2a3942] px-2.5 py-1 text-[11px] text-[#e9edef] hover:bg-[#334148]"
                >
                    <UserPlus className="h-3 w-3" /> vincular lead
                </button>
            )}

            {open && (
                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-[#222d34] bg-[#233138] p-2 shadow-xl">
                    {chat.client_id && (
                        <div className="mb-2 flex items-center justify-between border-b border-[#222d34] pb-2">
                            <div className="min-w-0">
                                <p className="truncate text-[12.5px] text-[#e9edef]">{chat.client_name}</p>
                                <p className="text-[10.5px] text-[#8696a0]">{chat.client_status}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <a href="/admin/clientes" className="rounded bg-[#2a3942] px-2 py-1 text-[10.5px] text-[#e9edef] hover:bg-[#334148]">abrir</a>
                                <button onClick={() => link(null)} className="rounded bg-[#2a3942] px-2 py-1 text-[10.5px] text-red-300 hover:bg-[#334148]">desvincular</button>
                            </div>
                        </div>
                    )}
                    <input
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar lead/cliente por nome ou telefone…"
                        className="w-full rounded bg-[#1c262b] px-2.5 py-1.5 text-[12.5px] text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                    />
                    <div className="mt-1.5 max-h-48 overflow-y-auto">
                        {searching && <p className="p-2 text-center text-[11px] text-[#8696a0]">Buscando…</p>}
                        {!searching && q.trim().length >= 2 && results.length === 0 && (
                            <p className="p-2 text-center text-[11px] text-[#8696a0]">Nada encontrado.</p>
                        )}
                        {results.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => link(r.id)}
                                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12.5px] text-[#e9edef] hover:bg-[#2a3942]"
                            >
                                <span className="truncate">{r.name}{r.company ? ` · ${r.company}` : ''}</span>
                                <span className="shrink-0 text-[10.5px] text-[#8696a0]">{r.status}</span>
                            </button>
                        ))}
                    </div>
                    {chat.phone && (
                        <button
                            onClick={createNew}
                            className="mt-1.5 flex w-full items-center gap-1.5 rounded border-t border-[#222d34] px-2 pt-2 text-[12px] text-[#00a884] hover:opacity-80"
                        >
                            <UserPlus className="h-3.5 w-3.5" /> criar novo lead com este contato
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Inbox({ chats, connection }: Props) {
    const [activeId, setActiveId] = React.useState<number | null>(chats[0]?.id ?? null);
    const [messages, setMessages] = React.useState<Msg[]>([]);
    const [loadingThread, setLoadingThread] = React.useState(false);
    const [text, setText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const [q, setQ] = React.useState('');
    const [filter, setFilter] = React.useState<Filter>('all');
    const [qr, setQr] = React.useState<string | null>(null);
    const [showQr, setShowQr] = React.useState(false);
    const [importing, setImporting] = React.useState(false);
    const [replyTo, setReplyTo] = React.useState<Msg | null>(null);
    const endRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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
        setReplyTo(null);
    }, [activeId, loadThread]);

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end' });
    }, [messages]);

    React.useEffect(() => {
        const t = setInterval(() => {
            router.reload({ only: ['chats'], preserveScroll: true, preserveState: true });
            if (activeId) loadThread(activeId);
        }, 15000);
        return () => clearInterval(t);
    }, [activeId, loadThread]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !activeId || sending) return;
        setSending(true);
        const body = text;
        const quoting = replyTo;
        setText('');
        setReplyTo(null);
        setMessages((m) => [...m, {
            id: Date.now(), wamid: null, from_me: true, type: 'text', body, media_url: null, mimetype: null,
            reply_to_wamid: quoting?.wamid ?? null,
            reply_to_preview: quoting ? (quoting.body || `[${quoting.type}]`) : null,
            status: 'sending', sent_at: new Date().toISOString(),
        }]);
        try {
            await fetch(`/admin/whatsapp/conversas/${activeId}/enviar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ text: body, reply_to_id: quoting?.id ?? undefined }),
            });
            loadThread(activeId);
            router.reload({ only: ['chats'], preserveScroll: true, preserveState: true });
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

    const runImport = () => {
        setImporting(true);
        router.post('/admin/whatsapp/importar', {}, {
            preserveScroll: true,
            onFinish: () => setImporting(false),
        });
    };

    const filtered = chats
        .filter((c) => {
            if (filter === 'unread') return c.unread > 0;
            if (filter === 'leads') return c.is_lead;
            if (filter === 'groups') return c.is_group;
            return true;
        })
        .filter((c) => {
            if (!q.trim()) return true;
            const s = q.toLowerCase();
            return title(c).toLowerCase().includes(s) || (c.last_message ?? '').toLowerCase().includes(s);
        });

    return (
        <AdminLayout
            title="Mensagens"
            subtitle="Seu WhatsApp dentro do painel"
            headerAction={
                <div className="flex items-center gap-2">
                    <span className={`text-[12px] ${st.tone}`}>● {st.txt}</span>
                    <Button variant="ghost" onClick={runImport} disabled={importing}>
                        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sincronizar
                    </Button>
                    <Button variant="ghost" onClick={openQr}><QrCode className="h-4 w-4" /> Conectar</Button>
                </div>
            }
        >
            <Head title="Mensagens — Admin KayTech" />

            {connection.state === 'not_configured' && (
                <p className="mb-3 text-[13px] ui-t-soft">
                    Configure <code>EVOLUTION_BASE_URL</code> e <code>EVOLUTION_API_KEY</code> no <code>.env</code>, crie a instância e
                    aponte o webhook. Depois clique em <strong>Conectar</strong> e escaneie o QR.
                </p>
            )}

            <div className="grid grid-cols-1 overflow-hidden rounded-xl border ui-b lg:grid-cols-[340px_1fr]" style={{ height: '78vh' }}>
                {/* lista estilo WhatsApp */}
                <div className="flex h-full min-h-0 flex-col border-r ui-b bg-[#111b21]">
                    <div className="space-y-2 p-2.5">
                        <div className="flex items-center gap-2 rounded-lg bg-[#202c33] px-3 py-1.5">
                            <Search className="h-3.5 w-3.5 text-[#8696a0]" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Buscar conversa"
                                className="w-full bg-transparent py-1 text-[13px] text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                            />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                                        filter === f.key ? 'bg-[#00a884] text-[#062f27]' : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {filtered.length === 0 && (
                            <p className="p-6 text-center text-[12px] text-[#8696a0]">Nenhuma conversa.</p>
                        )}
                        {filtered.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveId(c.id)}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                                    c.id === activeId ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                                }`}
                            >
                                <Avatar url={c.profile_pic_url} name={title(c)} />
                                <div className="min-w-0 flex-1 border-b border-[#222d34] pb-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[14px] text-[#e9edef]">{title(c)}</span>
                                        <span className="shrink-0 text-[11px] text-[#8696a0]">{fmtTime(c.last_message_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-[13px] text-[#8696a0]">{c.last_message}</span>
                                        {c.unread > 0 && (
                                            <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-[#00a884] px-1 text-[10.5px] font-semibold text-[#062f27]">
                                                {c.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* thread estilo WhatsApp */}
                <div className="flex h-full min-h-0 flex-col bg-[#0b141a]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '18px 18px' }}>
                    {!active ? (
                        <p className="grid flex-1 place-items-center text-[13px] text-[#8696a0]">Selecione uma conversa.</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-[#222d34] bg-[#202c33] px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                    <Avatar url={active.profile_pic_url} name={title(active)} size={36} />
                                    <div>
                                        <p className="text-[14px] font-medium text-[#e9edef]">{title(active)}</p>
                                        <p className="text-[11px] text-[#8696a0]">{active.phone ? `+${active.phone}` : active.is_group ? 'Grupo' : ''}</p>
                                    </div>
                                </div>
                                <ClientLinkMenu chat={active} />
                            </div>

                            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-4">
                                {loadingThread && <div className="grid place-items-center py-6"><Loader2 className="h-4 w-4 animate-spin text-[#8696a0]" /></div>}
                                {!loadingThread && messages.length === 0 && (
                                    <p className="py-6 text-center text-[12px] text-[#8696a0]">Sem mensagens ainda.</p>
                                )}
                                {messages.map((m) => (
                                    <div key={m.id} className={`group flex ${m.from_me ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[75%] items-center gap-1 ${m.from_me ? 'flex-row-reverse' : ''}`}>
                                            <button
                                                type="button"
                                                title="Responder"
                                                onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                                                className="shrink-0 rounded-full p-1.5 text-[#8696a0] opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                                            >
                                                <Reply className="h-3.5 w-3.5" />
                                            </button>
                                            <div
                                                onDoubleClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                                                className={`cursor-pointer select-none rounded-lg px-2 py-1.5 shadow-sm ${
                                                    m.from_me ? 'bg-[#005c4b] text-white' : 'bg-[#202c33] text-[#e9edef]'
                                                }`}
                                            >
                                                <Bubble m={m} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={endRef} />
                            </div>

                            <form onSubmit={send} className="border-t border-[#222d34] bg-[#202c33]">
                                {replyTo && (
                                    <div className="flex items-center gap-2 border-b border-[#222d34]/60 px-3 pt-2.5">
                                        <div className="flex-1 rounded border-l-4 border-[#00a884] bg-black/20 px-2.5 py-1.5">
                                            <p className="text-[11px] font-medium text-[#00a884]">
                                                {replyTo.from_me ? 'Você' : title(active)}
                                            </p>
                                            <p className="line-clamp-1 text-[12.5px] text-[#8696a0]">
                                                {replyTo.body || `[${replyTo.type}]`}
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setReplyTo(null)} className="shrink-0 rounded-full p-1.5 text-[#8696a0] hover:bg-white/10">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-end gap-2 p-3">
                                    <textarea
                                        ref={textareaRef}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e as unknown as React.FormEvent); }
                                            if (e.key === 'Escape' && replyTo) setReplyTo(null);
                                        }}
                                        rows={1}
                                        placeholder={connection.state === 'open' ? 'Escreva uma mensagem…' : 'Conecte o WhatsApp para enviar'}
                                        disabled={connection.state !== 'open'}
                                        className="max-h-32 min-h-10 flex-1 resize-none rounded-lg bg-[#2a3942] px-3 py-2 text-[13.5px] text-[#e9edef] outline-none placeholder:text-[#8696a0] disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !text.trim() || connection.state !== 'open'}
                                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#00a884] text-[#062f27] transition hover:brightness-110 disabled:opacity-40"
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

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
