import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Send, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Panel, Button, Field, Textarea } from '../../../Components/Admin/ui';

interface Client {
    id: number; name: string; company: string | null;
    phone: string | null; status: string; tags: string[] | null;
}
interface Conn { state: string }
interface Props { connection: Conn; clients: Client[]; statuses: string[] }

const STATUS_LABEL: Record<string, string> = {
    lead: 'Lead', prospect: 'Prospect', contacted: 'Em contato',
    proposal: 'Proposta', won: 'Fechado', lost: 'Perdido',
};

export default function Broadcast({ connection, clients, statuses }: Props) {
    const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set(['lead', 'prospect']));
    const [picked, setPicked] = React.useState<Set<number>>(new Set());
    const [extra, setExtra] = React.useState('');

    const { data, setData, post, processing } = useForm({ message: '', numbers: [] as string[] });

    const filtered = clients.filter((c) => statusFilter.size === 0 || statusFilter.has(c.status));

    const toggleStatus = (s: string) => {
        setStatusFilter((prev) => {
            const n = new Set(prev);
            n.has(s) ? n.delete(s) : n.add(s);
            return n;
        });
    };
    const togglePick = (id: number) => {
        setPicked((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };
    const allShown = filtered.length > 0 && filtered.every((c) => picked.has(c.id));
    const toggleAll = () => {
        setPicked((prev) => {
            const n = new Set(prev);
            if (allShown) filtered.forEach((c) => n.delete(c.id));
            else filtered.forEach((c) => n.add(c.id));
            return n;
        });
    };

    const extraNumbers = extra
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

    const pickedNumbers = clients.filter((c) => picked.has(c.id) && c.phone).map((c) => c.phone as string);
    const numbers = Array.from(new Set([...pickedNumbers, ...extraNumbers]));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim() || numbers.length === 0 || processing) return;
        if (!confirm(`Enviar para ${numbers.length} número(s)?`)) return;
        setData('numbers', numbers);
        post('/admin/whatsapp/disparo', {
            preserveScroll: true,
            onSuccess: () => { setPicked(new Set()); setExtra(''); setData('message', ''); },
        });
    };

    return (
        <AdminLayout
            title="Enviar mensagens"
            subtitle="Dispare a mesma mensagem para vários contatos — com intervalo entre envios"
        >
            <Head title="Enviar mensagens — Admin KayTech" />

            {connection.state !== 'open' && (
                <Panel>
                    <p className="text-[13px] ui-neg">
                        WhatsApp não está conectado. Vá em <strong>Mensagens → Conectar</strong> e escaneie o QR antes de disparar.
                    </p>
                </Panel>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
                {/* seleção */}
                <Panel className="flex max-h-[70vh] flex-col p-0">
                    <div className="flex flex-wrap items-center gap-2 border-b ui-b p-3">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => toggleStatus(s)}
                                className={`rounded-full px-3 py-1 text-[11px] transition ${
                                    statusFilter.has(s) ? 'ui-btn-primary ui-t' : 'ui-subtle ui-t-soft'
                                }`}
                            >
                                {STATUS_LABEL[s] ?? s}
                            </button>
                        ))}
                        <label className="ml-auto flex items-center gap-1.5 text-[12px] ui-t-soft">
                            <input type="checkbox" checked={allShown} onChange={toggleAll} className="rounded ui-b-strong ui-subtle" />
                            selecionar todos ({filtered.length})
                        </label>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 && <p className="p-4 text-center text-[12px] ui-t-faint">Nenhum cliente com telefone nesse filtro.</p>}
                        {filtered.map((c) => (
                            <label key={c.id} className="flex items-center gap-3 border-b ui-b px-3 py-2.5 hover:ui-subtle">
                                <input
                                    type="checkbox"
                                    checked={picked.has(c.id)}
                                    onChange={() => togglePick(c.id)}
                                    className="rounded ui-b-strong ui-subtle"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium ui-t">{c.name}</p>
                                    <p className="truncate text-[12px] ui-t-faint">
                                        {c.phone ?? 'sem telefone'}{c.company ? ` · ${c.company}` : ''}
                                    </p>
                                </div>
                                <span className="shrink-0 text-[10px] uppercase ui-t-faint">{STATUS_LABEL[c.status] ?? c.status}</span>
                            </label>
                        ))}
                    </div>
                </Panel>

                {/* mensagem */}
                <div className="space-y-4">
                    <Panel>
                        <form onSubmit={submit} className="space-y-3">
                            <Field label="Mensagem">
                                <Textarea
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Oi! Aqui é o Bruno da KayTech…"
                                />
                            </Field>
                            <Field label="Números avulsos (um por linha ou separados por vírgula)">
                                <Textarea
                                    rows={3}
                                    value={extra}
                                    onChange={(e) => setExtra(e.target.value)}
                                    placeholder="43 99999-9999&#10;5543988888888"
                                />
                            </Field>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] ui-t-faint">{numbers.length} destinatário(s)</span>
                                <Button type="submit" disabled={processing || !data.message.trim() || numbers.length === 0 || connection.state !== 'open'}>
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Disparar</>}
                                </Button>
                            </div>
                        </form>
                    </Panel>
                    <Panel>
                        <p className="text-[12px] ui-t-faint">
                            O envio respeita ~0,7s entre números. Evite textos idênticos para listas muito grandes — o WhatsApp
                            pode bloquear o número. Prefira lotes menores e mensagens levemente variadas.
                        </p>
                    </Panel>
                </div>
            </div>
        </AdminLayout>
    );
}
