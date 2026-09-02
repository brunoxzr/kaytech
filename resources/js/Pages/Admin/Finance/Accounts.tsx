import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { ACCOUNT_TYPES, brl, Field, inputClass, Modal, primaryBtn } from '../../../Components/Admin/Finance/shared';

interface Account {
    id: number; name: string; type: string; institution: string | null; color: string;
    archived: boolean; order: number; opening_balance: number; balance: number;
}

export default function Accounts({ accounts }: { accounts: Account[] }) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<Account | null>(null);
    const form = useForm({ name: '', type: 'checking', institution: '', opening_balance: '0', color: '#1F7A3D', archived: false as boolean, order: 0 });

    const openNew = () => { setEditing(null); form.setData({ name: '', type: 'checking', institution: '', opening_balance: '0', color: '#1F7A3D', archived: false, order: accounts.length }); setModal(true); };
    const openEdit = (a: Account) => {
        setEditing(a);
        form.setData({ name: a.name, type: a.type, institution: a.institution ?? '', opening_balance: String(a.opening_balance), color: a.color, archived: a.archived, order: a.order });
        setModal(true);
    };
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModal(false); form.reset(); setEditing(null); };
        editing ? form.put(`/admin/financas/contas/${editing.id}`, { onSuccess: done }) : form.post('/admin/financas/contas', { onSuccess: done });
    };

    const total = accounts.filter((a) => !a.archived).reduce((s, a) => s + a.balance, 0);

    return (
        <AdminLayout
            title="Contas"
            subtitle="Bancos, carteiras, cartões e investimentos"
            headerAction={<button onClick={openNew} className={primaryBtn}><Plus className="h-4 w-4" /> Nova conta</button>}
        >
            <Head title="Contas — Finanças KayTech" />

            <div className="rounded-xl border ui-b ui-surface p-5">
                <span className="text-[11px] uppercase tracking-wider ui-t-faint">Saldo consolidado</span>
                <span className={`mt-1 block text-2xl font-semibold ${total >= 0 ? 'ui-t' : 'ui-neg'}`}>{brl(total)}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((a) => (
                    <div key={a.id} className={`rounded-xl border ui-b ui-surface p-5 ${a.archived ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="flex items-center gap-2 font-medium ui-t">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />{a.name}
                                </span>
                                <span className="mt-0.5 block text-xs ui-t-faint">
                                    {ACCOUNT_TYPES[a.type]}{a.institution ? ` · ${a.institution}` : ''}{a.archived ? ' · arquivada' : ''}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(a)} className="rounded-md p-1.5 ui-t-soft hover:ui-subtle border ui-b"><Edit3 className="h-3.5 w-3.5" /></button>
                                <button onClick={() => { if (confirm('Remover conta e todos os seus lançamentos?')) router.delete(`/admin/financas/contas/${a.id}`); }} className="rounded-md p-1.5 ui-neg hover:ui-subtle border ui-b"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        </div>
                        <span className={`mt-4 block text-xl font-semibold ${a.balance >= 0 ? 'ui-t' : 'ui-neg'}`}>{brl(a.balance)}</span>
                    </div>
                ))}
                {accounts.length === 0 && <p className="text-sm ui-t-faint">Nenhuma conta cadastrada.</p>}
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar conta' : 'Nova conta'}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nome"><input className={inputClass} required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo">
                            <select className={inputClass} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Instituição"><input className={inputClass} value={form.data.institution} onChange={(e) => form.setData('institution', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Saldo inicial (R$)"><input type="number" step="0.01" className={inputClass} value={form.data.opening_balance} onChange={(e) => form.setData('opening_balance', e.target.value)} /></Field>
                        <Field label="Cor"><input type="color" className={`${inputClass} h-9 p-1`} value={form.data.color} onChange={(e) => form.setData('color', e.target.value)} /></Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm ui-t-soft">
                        <input type="checkbox" checked={form.data.archived} onChange={(e) => form.setData('archived', e.target.checked)} className="rounded ui-b-strong ui-subtle" />
                        Conta arquivada (não conta no saldo consolidado)
                    </label>
                    <button type="submit" disabled={form.processing} className={`${primaryBtn} w-full py-3`}>{editing ? 'Salvar' : 'Criar conta'}</button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
