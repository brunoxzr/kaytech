import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus, Trash2, LayoutGrid, Table as TableIcon, Rows3, CalendarClock, ExternalLink, StickyNote,
} from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { Panel, PanelTitle, Button, Field, Input, Select, Textarea, Modal, Badge, EmptyState } from '../../Components/Admin/ui';

type Status = 'lead' | 'prospect' | 'contacted' | 'proposal' | 'won' | 'lost';

const STATUS_LABEL: Record<Status, string> = {
    lead: 'Lead', prospect: 'Prospect', contacted: 'Contatado', proposal: 'Proposta', won: 'Fechado', lost: 'Perdido',
};
const STATUS_ORDER: Status[] = ['lead', 'prospect', 'contacted', 'proposal', 'won', 'lost'];

const BANT: { key: string; label: string }[] = [
    { key: 'need', label: 'Tem necessidade real' },
    { key: 'authority', label: 'Falei com quem decide' },
    { key: 'budget', label: 'Tem orçamento' },
    { key: 'timing', label: 'Tem prazo / urgência' },
];

interface Note { id: number; body: string; kind: string; created_at: string; }
interface Client {
    id: number; name: string; company: string | null; email: string | null; phone: string | null;
    status: Status; deal_value: number; source: string | null; tags: string[] | null;
    qualification: Record<string, boolean> | null;
    next_action: string | null; next_action_at: string | null;
    project_id: number | null; lead_id: number | null; project_title: string | null;
    order: number; notes: Note[];
}
interface Props {
    clients: Client[];
    projects: { id: number; title: string }[];
    leads: { id: number; name: string; email: string }[];
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

const emptyForm = {
    name: '', company: '', email: '', phone: '', status: 'lead' as Status, deal_value: '',
    source: '', tags: '' as string, next_action: '', next_action_at: '',
    project_id: '' as string | number, lead_id: '' as string | number, first_note: '',
};

export default function Clients({ clients, projects, leads }: Props) {
    const [view, setView] = React.useState<'kanban' | 'table' | 'cards'>('kanban');
    const [formOpen, setFormOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<Client | null>(null);
    const [detail, setDetail] = React.useState<Client | null>(null);
    const [dragId, setDragId] = React.useState<number | null>(null);

    const form = useForm<typeof emptyForm>({ ...emptyForm });
    const noteForm = useForm({ body: '', kind: 'note' });

    // mantém o modal de detalhe sincronizado após reload do Inertia
    React.useEffect(() => {
        if (detail) setDetail(clients.find((c) => c.id === detail.id) ?? null);
    }, [clients]); // eslint-disable-line

    const openNew = () => { setEditing(null); form.setData({ ...emptyForm }); setFormOpen(true); };
    const openEdit = (c: Client) => {
        setEditing(c);
        form.setData({
            name: c.name, company: c.company ?? '', email: c.email ?? '', phone: c.phone ?? '',
            status: c.status, deal_value: c.deal_value ? String(c.deal_value) : '',
            source: c.source ?? '', tags: (c.tags ?? []).join(', '),
            next_action: c.next_action ?? '', next_action_at: c.next_action_at ?? '',
            project_id: c.project_id ?? '', lead_id: c.lead_id ?? '', first_note: '',
        });
        setFormOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            tags: form.data.tags ? form.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
            qualification: editing?.qualification ?? {},
        };
        const opts = { onSuccess: () => { setFormOpen(false); form.reset(); setEditing(null); } };
        editing
            ? router.put(`/admin/clientes/${editing.id}`, payload, opts)
            : router.post('/admin/clientes', payload, opts);
    };

    const addNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!detail) return;
        noteForm.post(`/admin/clientes/${detail.id}/notas`, { onSuccess: () => noteForm.reset(), preserveScroll: true });
    };

    const drop = (status: Status) => {
        if (dragId == null) return;
        const target = clients.filter((c) => c.status === status);
        router.patch(`/admin/clientes/${dragId}/mover`, { status, order: target.length }, { preserveScroll: true });
        setDragId(null);
    };

    const grouped = STATUS_ORDER.map((s) => ({ status: s, items: clients.filter((c) => c.status === s) }));

    const NextActionTag = ({ c }: { c: Client }) => {
        if (!c.next_action_at) return null;
        const d = new Date(c.next_action_at + 'T00:00:00');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const overdue = d < today;
        const isToday = d.getTime() === today.getTime();
        return (
            <span className={`ui-badge ${overdue ? 'ui-neg' : isToday ? 'ui-pos' : ''}`}>
                <CalendarClock className="h-3 w-3" />
                {c.next_action ? `${c.next_action} · ` : ''}{fmtDate(c.next_action_at)}
            </span>
        );
    };

    const ClientCard = ({ c, draggable = false }: { c: Client; draggable?: boolean }) => (
        <button
            draggable={draggable}
            onDragStart={() => setDragId(c.id)}
            onClick={() => setDetail(c)}
            className="ui-panel w-full p-3 text-left transition hover:ui-b-strong"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium ui-t">{c.name}</p>
                    {c.company && <p className="truncate text-[12px] ui-t-faint">{c.company}</p>}
                </div>
                {c.deal_value > 0 && <span className="shrink-0 text-[12px] font-medium ui-t-soft">{brl(c.deal_value)}</span>}
            </div>
            {(c.tags?.length || c.next_action_at) && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags?.slice(0, 3).map((t) => <span key={t} className="ui-badge">{t}</span>)}
                    <NextActionTag c={c} />
                </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-[11px] ui-t-faint">
                {['lead', 'prospect', 'contacted'].includes(c.status) && (
                    <span className="flex items-center gap-0.5" title="Qualificação (BANT)">
                        {BANT.map((b) => (
                            <span key={b.key}
                                  className={`h-1.5 w-1.5 rounded-full ${(c.qualification ?? {})[b.key] ? 'bg-[var(--ui-pos)]' : 'ui-subtle'}`} />
                        ))}
                    </span>
                )}
                {c.notes.length > 0 && (
                    <span className="flex items-center gap-1">
                        <StickyNote className="h-3 w-3" /> {c.notes.length}
                    </span>
                )}
            </div>
        </button>
    );

    return (
        <AdminLayout
            title="Clientes"
            subtitle="Pipeline comercial, follow-ups e anotações"
            headerAction={
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border ui-b-strong p-0.5">
                        {([['kanban', LayoutGrid], ['table', TableIcon], ['cards', Rows3]] as const).map(([v, Icon]) => (
                            <button key={v} onClick={() => setView(v)}
                                    className={`rounded-md p-1.5 transition ${view === v ? 'ui-subtle ui-t' : 'ui-t-faint hover:ui-t'}`}
                                    title={v}>
                                <Icon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                    <Button onClick={openNew}><Plus className="h-4 w-4" /> Novo cliente</Button>
                </div>
            }
        >
            <Head title="Clientes — Admin KayTech" />

            {clients.length === 0 && <EmptyState>Nenhum cliente ainda. Clique em “Novo cliente” para começar.</EmptyState>}

            {/* KANBAN */}
            {clients.length > 0 && view === 'kanban' && (
                <div className="flex gap-3 overflow-x-auto pb-2 [&>*]:min-w-[240px] [&>*]:flex-1">
                    {grouped.map(({ status, items }) => (
                        <div
                            key={status}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => drop(status)}
                            className="ui-subtle rounded-xl p-2"
                        >
                            <div className="flex items-center justify-between px-1 pb-2 pt-1">
                                <span className="text-[12px] font-semibold ui-t">{STATUS_LABEL[status]}</span>
                                <span className="text-[11px] ui-t-faint">{items.length}</span>
                            </div>
                            <div className="space-y-2">
                                {items.map((c) => <ClientCard key={c.id} c={c} draggable />)}
                                {items.length === 0 && (
                                    <p className="rounded-lg border border-dashed ui-b py-6 text-center text-[11px] ui-t-faint">
                                        Arraste aqui
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TABELA */}
            {clients.length > 0 && view === 'table' && (
                <Panel className="p-0">
                    <div className="overflow-x-auto">
                        <table className="ui-table">
                            <thead>
                                <tr>
                                    <th>Nome</th><th>Empresa</th><th>Status</th><th>Valor</th>
                                    <th>Follow-up</th><th>Tags</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c.id} className="cursor-pointer" onClick={() => setDetail(c)}>
                                        <td className="font-medium ui-t">{c.name}</td>
                                        <td>{c.company ?? '—'}</td>
                                        <td><Badge tone={c.status === 'won' ? 'pos' : c.status === 'lost' ? 'neg' : 'default'}>{STATUS_LABEL[c.status]}</Badge></td>
                                        <td>{c.deal_value > 0 ? brl(c.deal_value) : '—'}</td>
                                        <td onClick={(e) => e.stopPropagation()}><NextActionTag c={c} /></td>
                                        <td className="ui-t-faint">{(c.tags ?? []).join(', ') || '—'}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { if (confirm(`Remover ${c.name}?`)) router.delete(`/admin/clientes/${c.id}`); }}
                                                    className="ui-t-faint hover:ui-neg">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            )}

            {/* CARDS */}
            {clients.length > 0 && view === 'cards' && (
                <div className="space-y-6">
                    {grouped.filter((g) => g.items.length > 0).map(({ status, items }) => (
                        <div key={status}>
                            <PanelTitle>{STATUS_LABEL[status]} · {items.length}</PanelTitle>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((c) => <ClientCard key={c.id} c={c} />)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ---------- MODAL: novo / editar ---------- */}
            <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nome"><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                        <Field label="Empresa"><Input value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="E-mail"><Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                        <Field label="Telefone"><Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Status">
                            <Select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as Status)}>
                                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                            </Select>
                        </Field>
                        <Field label="Valor do negócio (R$)"><Input type="number" step="0.01" min="0" value={form.data.deal_value} onChange={(e) => form.setData('deal_value', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Origem">
                            <Select value={form.data.source} onChange={(e) => form.setData('source', e.target.value)}>
                                <option value="">—</option>
                                {['Indicação', 'Site', 'LinkedIn', 'Instagram', 'Evento', 'Outro'].map((s) => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </Field>
                        <Field label="Tags (vírgula)"><Input value={form.data.tags} onChange={(e) => form.setData('tags', e.target.value)} placeholder="e-commerce, urgente" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Próxima ação"><Input value={form.data.next_action} onChange={(e) => form.setData('next_action', e.target.value)} placeholder="Enviar proposta" /></Field>
                        <Field label="Data"><Input type="date" value={form.data.next_action_at} onChange={(e) => form.setData('next_action_at', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Vincular a projeto">
                            <Select value={String(form.data.project_id)} onChange={(e) => form.setData('project_id', e.target.value)}>
                                <option value="">—</option>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </Select>
                        </Field>
                        <Field label="Vincular a lead">
                            <Select value={String(form.data.lead_id)} onChange={(e) => form.setData('lead_id', e.target.value)}>
                                <option value="">—</option>
                                {leads.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.email}</option>)}
                            </Select>
                        </Field>
                    </div>
                    {!editing && (
                        <Field label="Primeira anotação (opcional)">
                            <Textarea rows={2} value={form.data.first_note} onChange={(e) => form.setData('first_note', e.target.value)} />
                        </Field>
                    )}
                    <Button type="submit" className="w-full justify-center">{editing ? 'Salvar' : 'Adicionar cliente'}</Button>
                </form>
            </Modal>

            {/* ---------- MODAL: detalhe + anotações ---------- */}
            <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''}>
                {detail && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={detail.status === 'won' ? 'pos' : detail.status === 'lost' ? 'neg' : 'default'}>
                                {STATUS_LABEL[detail.status]}
                            </Badge>
                            {detail.deal_value > 0 && <span className="ui-badge">{brl(detail.deal_value)}</span>}
                            {detail.source && <span className="ui-badge">{detail.source}</span>}
                            <NextActionTag c={detail} />
                        </div>

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                            {detail.company && <div><dt className="ui-t-faint">Empresa</dt><dd className="ui-t">{detail.company}</dd></div>}
                            {detail.email && <div><dt className="ui-t-faint">E-mail</dt><dd className="ui-t">{detail.email}</dd></div>}
                            {detail.phone && <div><dt className="ui-t-faint">Telefone</dt><dd className="ui-t">{detail.phone}</dd></div>}
                            {detail.project_title && <div><dt className="ui-t-faint">Projeto</dt><dd className="ui-t">{detail.project_title}</dd></div>}
                        </dl>

                        {detail.tags?.length ? (
                            <div className="flex flex-wrap gap-1">
                                {detail.tags.map((t) => <span key={t} className="ui-badge">{t}</span>)}
                            </div>
                        ) : null}

                        {/* Checklist de qualificação (BANT) */}
                        <div className="rounded-lg border ui-b p-3">
                            {(() => {
                                const q = detail.qualification ?? {};
                                const done = BANT.filter((b) => q[b.key]).length;
                                return (
                                    <>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-[12px] font-semibold ui-t">Qualificação</span>
                                            <span className="text-[11px] ui-t-faint">{done}/{BANT.length}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {BANT.map((b) => (
                                                <label key={b.key} className="flex items-center gap-2 text-[13px] ui-t-soft">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!q[b.key]}
                                                        onChange={(e) => {
                                                            const next = { ...q, [b.key]: e.target.checked };
                                                            router.put(`/admin/clientes/${detail.id}`, {
                                                                name: detail.name, company: detail.company, email: detail.email,
                                                                phone: detail.phone, status: detail.status,
                                                                deal_value: String(detail.deal_value), source: detail.source,
                                                                tags: detail.tags ?? [], qualification: next,
                                                                next_action: detail.next_action, next_action_at: detail.next_action_at,
                                                                project_id: detail.project_id, lead_id: detail.lead_id,
                                                            }, { preserveScroll: true });
                                                        }}
                                                        className="rounded ui-b-strong ui-subtle"
                                                    />
                                                    {b.label}
                                                </label>
                                            ))}
                                        </div>
                                        {done === BANT.length && detail.status === 'lead' && (
                                            <p className="mt-2 text-[11px] ui-pos">✓ Qualificado — mova para “Prospect”.</p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => openEdit(detail)}>Editar</Button>
                            <Button variant="danger" onClick={() => { if (confirm(`Remover ${detail.name}?`)) { router.delete(`/admin/clientes/${detail.id}`); setDetail(null); } }}>
                                Remover
                            </Button>
                        </div>

                        {/* Timeline de anotações */}
                        <div className="border-t ui-b pt-4">
                            <p className="mb-3 text-[12px] font-semibold ui-t">Anotações</p>
                            <form onSubmit={addNote} className="mb-4 space-y-2">
                                <Textarea rows={2} required placeholder="Registrar contato, reunião, observação…"
                                          value={noteForm.data.body} onChange={(e) => noteForm.setData('body', e.target.value)} />
                                <div className="flex items-center gap-2">
                                    <Select className="w-40" value={noteForm.data.kind} onChange={(e) => noteForm.setData('kind', e.target.value)}>
                                        <option value="note">Nota</option>
                                        <option value="call">Ligação</option>
                                        <option value="meeting">Reunião</option>
                                        <option value="email">E-mail</option>
                                    </Select>
                                    <Button type="submit" disabled={noteForm.processing}>Adicionar</Button>
                                </div>
                            </form>
                            <ul className="space-y-3">
                                {detail.notes.map((n) => (
                                    <li key={n.id} className="border-l-2 ui-b-strong pl-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] uppercase tracking-wide ui-t-faint">
                                                {n.kind === 'status_change' ? 'Pipeline' : n.kind} · {fmtDate(n.created_at)}
                                            </span>
                                            {n.kind !== 'status_change' && (
                                                <button onClick={() => router.delete(`/admin/clientes/${detail.id}/notas/${n.id}`, { preserveScroll: true })}
                                                        className="ui-t-faint hover:ui-neg">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-[13px] ui-t-soft">{n.body}</p>
                                    </li>
                                ))}
                                {detail.notes.length === 0 && <p className="text-[13px] ui-t-faint">Nenhuma anotação ainda.</p>}
                            </ul>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
