import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit3, Play, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { brl, FREQUENCIES, Field, inputClass, Modal, primaryBtn } from '../../../Components/Admin/Finance/shared';

interface Lite { id: number; name: string; type?: string; }
interface Rec {
    id: number; account_id: number; category_id: number | null; type: string; amount: number;
    description: string; frequency: string; day_of_month: number; starts_on: string; ends_on: string | null;
    active: boolean; last_generated_on: string | null;
    account?: { name: string }; category?: { name: string; color: string };
}

const today = () => new Date().toISOString().slice(0, 10);

export default function Recurring({ recurring, accounts, categories }: { recurring: Rec[]; accounts: Lite[]; categories: Lite[] }) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<Rec | null>(null);
    const form = useForm({
        account_id: accounts[0]?.id ?? '', category_id: '', type: 'expense', amount: '',
        description: '', frequency: 'monthly', day_of_month: 5, starts_on: today(), ends_on: '', active: true as boolean,
    });

    const openNew = () => { setEditing(null); form.setData({ account_id: accounts[0]?.id ?? '', category_id: '', type: 'expense', amount: '', description: '', frequency: 'monthly', day_of_month: 5, starts_on: today(), ends_on: '', active: true }); setModal(true); };
    const openEdit = (r: Rec) => {
        setEditing(r);
        form.setData({ account_id: r.account_id, category_id: r.category_id ?? '', type: r.type, amount: String(r.amount / 100), description: r.description, frequency: r.frequency, day_of_month: r.day_of_month, starts_on: r.starts_on?.slice(0, 10), ends_on: r.ends_on?.slice(0, 10) ?? '', active: r.active });
        setModal(true);
    };
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModal(false); form.reset(); setEditing(null); };
        editing ? form.put(`/admin/financas/recorrencias/${editing.id}`, { onSuccess: done }) : form.post('/admin/financas/recorrencias', { onSuccess: done });
    };

    const catOptions = categories.filter((c) => c.type === form.data.type);

    return (
        <AdminLayout
            title="Recorrências"
            subtitle="Despesas e receitas fixas — geram contas a pagar/receber automaticamente"
            headerAction={
                <div className="flex gap-2">
                    <button onClick={() => router.post('/admin/financas/recorrencias/gerar')} className="flex items-center gap-2 rounded-xl border ui-b px-4 py-2.5 text-xs font-semibold ui-t-soft hover:ui-subtle">
                        <Play className="h-3.5 w-3.5" /> Gerar pendentes
                    </button>
                    <button onClick={openNew} className={primaryBtn}><Plus className="h-4 w-4" /> Nova recorrência</button>
                </div>
            }
        >
            <Head title="Recorrências — Finanças KayTech" />

            <div className="overflow-x-auto rounded-xl border ui-b">
                <table className="w-full text-left text-sm">
                    <thead className="border-b ui-b text-[11px] uppercase tracking-wider ui-t-faint">
                        <tr>
                            <th className="px-4 py-3">Descrição</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3">Conta</th>
                            <th className="px-4 py-3">Frequência</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                            <th className="px-4 py-3 text-center">Ativa</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y ui-b">
                        {recurring.map((r) => (
                            <tr key={r.id} className="ui-t-soft hover:ui-surface">
                                <td className="px-4 py-3 font-medium ui-t">{r.description}</td>
                                <td className="px-4 py-3">{r.category?.name ?? <span className="ui-t-faint">—</span>}</td>
                                <td className="px-4 py-3 ui-t-faint">{r.account?.name}</td>
                                <td className="px-4 py-3 ui-t-faint">{FREQUENCIES[r.frequency]} · {r.day_of_month === 0 ? 'último dia' : `dia ${r.day_of_month}`}</td>
                                <td className={`px-4 py-3 text-right font-medium ${r.type === 'income' ? 'ui-pos' : 'ui-neg'}`}>{brl(r.amount)}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block h-2 w-2 rounded-full ${r.active ? 'ui-pos' : 'ui-subtle'}`} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1.5">
                                        <button onClick={() => openEdit(r)} className="rounded-md p-1.5 ui-t-soft hover:ui-subtle border ui-b"><Edit3 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => { if (confirm('Remover recorrência?')) router.delete(`/admin/financas/recorrencias/${r.id}`); }} className="rounded-md p-1.5 ui-neg hover:ui-subtle border ui-b"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {recurring.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm ui-t-faint">Nenhuma recorrência cadastrada.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar recorrência' : 'Nova recorrência'}>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {[['expense', 'Saída'], ['income', 'Entrada']].map(([k, v]) => (
                            <button type="button" key={k} onClick={() => form.setData('type', k)}
                                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${form.data.type === k ? 'ui-b-strong ui-subtle ui-t' : 'ui-b ui-t-faint'}`}>{v}</button>
                        ))}
                    </div>
                    <Field label="Descrição"><input className={inputClass} required value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Valor (R$)"><input type="number" step="0.01" min="0.01" className={inputClass} required value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></Field>
                        <Field label="Dia do mês">
                            <select className={inputClass} value={form.data.day_of_month} onChange={(e) => form.setData('day_of_month', Number(e.target.value))}>
                                <option value={0}>Último dia</option>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Dia {d}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Conta">
                            <select className={inputClass} required value={form.data.account_id} onChange={(e) => form.setData('account_id', e.target.value)}>
                                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Categoria">
                            <select className={inputClass} value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)}>
                                <option value="">Sem categoria</option>
                                {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Frequência">
                            <select className={inputClass} value={form.data.frequency} onChange={(e) => form.setData('frequency', e.target.value)}>
                                {Object.entries(FREQUENCIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Início"><input type="date" className={inputClass} required value={form.data.starts_on} onChange={(e) => form.setData('starts_on', e.target.value)} /></Field>
                        <Field label="Fim (opcional)"><input type="date" className={inputClass} value={form.data.ends_on} onChange={(e) => form.setData('ends_on', e.target.value)} /></Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm ui-t-soft">
                        <input type="checkbox" checked={form.data.active} onChange={(e) => form.setData('active', e.target.checked)} className="rounded ui-b-strong ui-subtle" /> Ativa
                    </label>
                    <button type="submit" disabled={form.processing} className={`${primaryBtn} w-full py-3`}>{editing ? 'Salvar' : 'Criar recorrência'}</button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
