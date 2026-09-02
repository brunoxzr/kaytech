import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, Clock, Edit3, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { brl, Field, inputClass, Modal, primaryBtn, TX_TYPES } from '../../../Components/Admin/Finance/shared';

interface Lite { id: number; name: string; color: string; type?: string; }
interface Tx {
    id: number; account_id: number; category_id: number | null; transfer_account_id: number | null;
    type: string; amount: number; description: string; notes: string | null; date: string; paid: boolean;
    account?: { name: string }; category?: { name: string; color: string }; transfer_account?: { name: string };
}
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[]; }

interface Props {
    transactions: Paginated<Tx>;
    accounts: Lite[];
    categories: Lite[];
    filters: Record<string, string>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function Transactions({ transactions, accounts, categories, filters }: Props) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<Tx | null>(null);

    const form = useForm({
        account_id: accounts[0]?.id ?? '', category_id: '', transfer_account_id: '',
        type: 'expense', amount: '', description: '', notes: '', date: today(), paid: true as boolean,
    });

    const openNew = () => {
        setEditing(null);
        form.setData({ account_id: accounts[0]?.id ?? '', category_id: '', transfer_account_id: '', type: 'expense', amount: '', description: '', notes: '', date: today(), paid: true });
        setModal(true);
    };

    const openEdit = (t: Tx) => {
        setEditing(t);
        form.setData({
            account_id: t.account_id, category_id: t.category_id ?? '', transfer_account_id: t.transfer_account_id ?? '',
            type: t.type, amount: String(t.amount / 100), description: t.description, notes: t.notes ?? '',
            date: t.date, paid: t.paid,
        });
        setModal(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModal(false); form.reset(); setEditing(null); };
        editing
            ? form.put(`/admin/financas/lancamentos/${editing.id}`, { onSuccess: done })
            : form.post('/admin/financas/lancamentos', { onSuccess: done });
    };

    const applyFilter = (key: string, value: string) =>
        router.get('/admin/financas/lancamentos', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const catOptions = categories.filter((c) => form.data.type === 'transfer' || c.type === form.data.type);

    return (
        <AdminLayout
            title="Lançamentos"
            subtitle="Todas as entradas, saídas e transferências"
            headerAction={<button onClick={openNew} className={primaryBtn}><Plus className="h-4 w-4" /> Novo lançamento</button>}
        >
            <Head title="Lançamentos — Finanças KayTech" />

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                <input placeholder="Buscar descrição…" defaultValue={filters.search ?? ''}
                       onKeyDown={(e) => e.key === 'Enter' && applyFilter('search', (e.target as HTMLInputElement).value)}
                       className={`${inputClass} max-w-[200px] py-2`} />
                <select value={filters.account_id ?? ''} onChange={(e) => applyFilter('account_id', e.target.value)} className={`${inputClass} max-w-[160px] py-2`}>
                    <option value="">Todas as contas</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select value={filters.type ?? ''} onChange={(e) => applyFilter('type', e.target.value)} className={`${inputClass} max-w-[150px] py-2`}>
                    <option value="">Todos os tipos</option>
                    {Object.entries(TX_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={filters.status ?? ''} onChange={(e) => applyFilter('status', e.target.value)} className={`${inputClass} max-w-[140px] py-2`}>
                    <option value="">Pago e pendente</option>
                    <option value="paid">Só pagos</option>
                    <option value="pending">Só pendentes</option>
                </select>
                <input type="date" value={filters.from ?? ''} onChange={(e) => applyFilter('from', e.target.value)} className={`${inputClass} max-w-[150px] py-2`} />
                <input type="date" value={filters.to ?? ''} onChange={(e) => applyFilter('to', e.target.value)} className={`${inputClass} max-w-[150px] py-2`} />
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-xl border ui-b">
                <table className="w-full text-left text-sm">
                    <thead className="border-b ui-b text-[11px] uppercase tracking-wider ui-t-faint">
                        <tr>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3">Conta</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y ui-b">
                        {transactions.data.map((t) => (
                            <tr key={t.id} className="ui-t-soft hover:ui-surface">
                                <td className="whitespace-nowrap px-4 py-3 ui-t-faint">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3 font-medium ui-t">
                                    {t.description}
                                    {t.type === 'transfer' && <span className="ml-2 text-xs ui-t-faint">→ {t.transfer_account?.name}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    {t.category ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full" style={{ background: t.category.color }} />{t.category.name}
                                        </span>
                                    ) : <span className="ui-t-faint">—</span>}
                                </td>
                                <td className="px-4 py-3 ui-t-faint">{t.account?.name}</td>
                                <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${t.type === 'income' ? 'ui-pos' : t.type === 'expense' ? 'ui-neg' : 'ui-t-soft'}`}>
                                    {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}{brl(t.amount)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => router.patch(`/admin/financas/lancamentos/${t.id}/pago`, {}, { preserveScroll: true })}
                                        title={t.paid ? 'Pago — clique para marcar pendente' : 'Pendente — clique para marcar pago'}
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${t.paid ? 'ui-subtle ui-pos' : 'ui-subtle ui-t-soft'}`}
                                    >
                                        {t.paid ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                        {t.paid ? 'Pago' : 'Pendente'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1.5">
                                        <button onClick={() => openEdit(t)} className="rounded-md p-1.5 ui-t-soft hover:ui-subtle border ui-b"><Edit3 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => { if (confirm('Remover lançamento?')) router.delete(`/admin/financas/lancamentos/${t.id}`); }} className="rounded-md p-1.5 ui-neg hover:ui-subtle border ui-b"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {transactions.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-sm ui-t-faint">Nenhum lançamento encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-wrap gap-1">
                {transactions.links.map((l, i) => (
                    l.url
                        ? <Link key={i} href={l.url} className={`rounded-lg px-3 py-1.5 text-xs ${l.active ? ' ui-t' : 'ui-subtle ui-t-soft hover:ui-subtle'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
                        : <span key={i} className="rounded-lg px-3 py-1.5 text-xs ui-t/20" dangerouslySetInnerHTML={{ __html: l.label }} />
                ))}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar lançamento' : 'Novo lançamento'}>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(TX_TYPES).map(([k, v]) => (
                            <button type="button" key={k} onClick={() => form.setData('type', k)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${form.data.type === k ? 'ui-b-strong ui-subtle ui-t' : 'ui-b ui-t-faint hover:ui-b-strong'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                    <Field label="Descrição"><input className={inputClass} required value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Valor (R$)"><input type="number" step="0.01" min="0.01" className={inputClass} required value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></Field>
                        <Field label="Data"><input type="date" className={inputClass} required value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} /></Field>
                    </div>
                    <Field label={form.data.type === 'transfer' ? 'Conta de origem' : 'Conta'}>
                        <select className={inputClass} required value={form.data.account_id} onChange={(e) => form.setData('account_id', e.target.value)}>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </Field>
                    {form.data.type === 'transfer' ? (
                        <Field label="Conta de destino">
                            <select className={inputClass} required value={form.data.transfer_account_id} onChange={(e) => form.setData('transfer_account_id', e.target.value)}>
                                <option value="">Selecione…</option>
                                {accounts.filter((a) => String(a.id) !== String(form.data.account_id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>
                    ) : (
                        <Field label="Categoria">
                            <select className={inputClass} value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)}>
                                <option value="">Sem categoria</option>
                                {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                    )}
                    <label className="flex items-center gap-2 text-sm ui-t-soft">
                        <input type="checkbox" checked={form.data.paid} onChange={(e) => form.setData('paid', e.target.checked)} className="rounded ui-b-strong ui-subtle" />
                        Já foi pago / recebido (desmarque para conta a pagar/receber)
                    </label>
                    <Field label="Observações"><textarea className={inputClass} rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></Field>
                    <button type="submit" disabled={form.processing} className={`${primaryBtn} w-full py-3`}>{editing ? 'Salvar alterações' : 'Registrar lançamento'}</button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
