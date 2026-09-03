import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2, Landmark, Wallet, PiggyBank, CreditCard, TrendingUp, Scale } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { ACCOUNT_TYPES, brl, Field, inputClass, Modal, primaryBtn } from '../../../Components/Admin/Finance/shared';

interface Account {
    id: number; name: string; type: string; institution: string | null; color: string;
    archived: boolean; order: number; opening_balance: number; balance: number;
}

const TYPE_ICON: Record<string, typeof Landmark> = {
    checking: Landmark,
    savings: PiggyBank,
    cash: Wallet,
    credit_card: CreditCard,
    investment: TrendingUp,
};

export default function Accounts({ accounts }: { accounts: Account[] }) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<Account | null>(null);
    const form = useForm({ name: '', type: 'checking', institution: '', opening_balance: '0', color: '#1F7A3D', archived: false as boolean, order: 0 });

    const [adjusting, setAdjusting] = React.useState<Account | null>(null);
    const adjustForm = useForm({ target: '' });
    const openAdjust = (a: Account) => { setAdjusting(a); adjustForm.setData({ target: String(a.balance) }); };
    const submitAdjust = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjusting) return;
        adjustForm.patch(`/admin/financas/contas/${adjusting.id}/ajustar-saldo`, { onSuccess: () => { setAdjusting(null); adjustForm.reset(); } });
    };

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

    const active = accounts.filter((a) => !a.archived);
    const total = active.reduce((s, a) => s + a.balance, 0);
    const positive = active.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
    const negative = active.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);

    return (
        <AdminLayout
            title="Contas"
            subtitle="Saldo por conta — bancos, carteiras, cartões e investimentos"
            headerAction={<button onClick={openNew} className={primaryBtn}><Plus className="h-4 w-4" /> Nova conta</button>}
        >
            <Head title="Contas — Finanças KayTech" />

            {/* Consolidado — faixa estilo gateway */}
            <div className="ui-panel overflow-hidden p-0">
                <div className="grid grid-cols-1 divide-y ui-b sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-5">
                        <span className="text-[11px] font-medium uppercase tracking-wide ui-t-faint">Saldo consolidado</span>
                        <span className={`mt-1.5 block text-2xl font-semibold tracking-tight ${total >= 0 ? 'ui-t' : 'ui-neg'}`}
                              style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {brl(total)}
                        </span>
                        <span className="mt-0.5 block text-[11px] ui-t-faint">{active.length} conta{active.length !== 1 ? 's' : ''} ativa{active.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="p-5">
                        <span className="text-[11px] font-medium uppercase tracking-wide ui-t-faint">Disponível</span>
                        <span className="mt-1.5 block text-2xl font-semibold tracking-tight ui-pos" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {brl(positive)}
                        </span>
                        <span className="mt-0.5 block text-[11px] ui-t-faint">contas com saldo positivo</span>
                    </div>
                    <div className="p-5">
                        <span className="text-[11px] font-medium uppercase tracking-wide ui-t-faint">Negativo</span>
                        <span className="mt-1.5 block text-2xl font-semibold tracking-tight ui-neg" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {brl(negative)}
                        </span>
                        <span className="mt-0.5 block text-[11px] ui-t-faint">cartões / conta no vermelho</span>
                    </div>
                </div>
            </div>

            {/* Lista de contas — linhas limpas */}
            <div className="ui-panel overflow-hidden p-0">
                <div className="ui-divide">
                    {active.map((a) => {
                        const Icon = TYPE_ICON[a.type] ?? Landmark;
                        return (
                            <div key={a.id} className="group flex items-center gap-4 px-5 py-4">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border ui-b"
                                      style={{ color: a.color }}>
                                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium ui-t">{a.name}</p>
                                    <p className="truncate text-[11px] ui-t-faint">
                                        {ACCOUNT_TYPES[a.type]}{a.institution ? ` · ${a.institution}` : ''}
                                    </p>
                                </div>
                                <span className={`shrink-0 text-[15px] font-semibold ${a.balance >= 0 ? 'ui-t' : 'ui-neg'}`}
                                      style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {brl(a.balance)}
                                </span>
                                <div className="flex shrink-0 gap-1.5 opacity-0 transition group-hover:opacity-100">
                                    <button onClick={() => openAdjust(a)} title="Ajustar saldo" className="rounded-md border ui-b p-1.5 ui-t-soft hover:ui-subtle">
                                        <Scale className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => openEdit(a)} className="rounded-md border ui-b p-1.5 ui-t-soft hover:ui-subtle">
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => { if (confirm('Remover conta e todos os seus lançamentos?')) router.delete(`/admin/financas/contas/${a.id}`); }}
                                            className="rounded-md border ui-b p-1.5 ui-neg hover:ui-subtle">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {active.length === 0 && (
                        <p className="px-5 py-12 text-center text-[13px] ui-t-faint">Nenhuma conta cadastrada.</p>
                    )}
                </div>
            </div>

            {/* Arquivadas */}
            {accounts.some((a) => a.archived) && (
                <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide ui-t-faint">Arquivadas</p>
                    <div className="ui-panel overflow-hidden p-0">
                        <div className="ui-divide">
                            {accounts.filter((a) => a.archived).map((a) => (
                                <div key={a.id} className="flex items-center justify-between px-5 py-3 opacity-60">
                                    <span className="text-[13px] ui-t-soft">{a.name} · {ACCOUNT_TYPES[a.type]}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] ui-t-faint" style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(a.balance)}</span>
                                        <button onClick={() => openEdit(a)} className="rounded-md border ui-b p-1.5 ui-t-soft hover:ui-subtle">
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Modal open={!!adjusting} onClose={() => setAdjusting(null)} title={`Ajustar saldo — ${adjusting?.name ?? ''}`}>
                {adjusting && (
                    <form onSubmit={submitAdjust} className="space-y-4">
                        <p className="text-[13px] ui-t-faint">
                            Saldo atual: <strong className="ui-t">{brl(adjusting.balance)}</strong>.
                            Informe o novo saldo — a conta passa a valer isso, sem criar lançamento e sem mexer no total levantado nem no resultado do mês.
                        </p>
                        <Field label="Novo saldo (R$)">
                            <input type="number" step="0.01" className={inputClass} required autoFocus
                                   value={adjustForm.data.target} onChange={(e) => adjustForm.setData('target', e.target.value)} />
                        </Field>
                        {adjustForm.data.target !== '' && Number(adjustForm.data.target) * 100 !== adjusting.balance && (
                            <p className="text-[12px] ui-t-soft">
                                Mudança: <strong className={Number(adjustForm.data.target) * 100 > adjusting.balance ? 'ui-pos' : 'ui-neg'}>
                                    {brl(Math.round(Number(adjustForm.data.target) * 100) - adjusting.balance)}
                                </strong>
                            </p>
                        )}
                        <button type="submit" disabled={adjustForm.processing} className={`${primaryBtn} w-full justify-center py-2.5`}>
                            Atualizar saldo
                        </button>
                    </form>
                )}
            </Modal>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar conta' : 'Nova conta'}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nome"><input className={inputClass} required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo">
                            <select className={inputClass} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Instituição"><input className={inputClass} value={form.data.institution} onChange={(e) => form.setData('institution', e.target.value)} placeholder="Nubank, Itaú…" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Saldo inicial (R$)"><input type="number" step="0.01" className={inputClass} value={form.data.opening_balance} onChange={(e) => form.setData('opening_balance', e.target.value)} /></Field>
                        <Field label="Cor"><input type="color" className={`${inputClass} h-9 p-1`} value={form.data.color} onChange={(e) => form.setData('color', e.target.value)} /></Field>
                    </div>
                    <label className="flex items-center gap-2 text-[13px] ui-t-soft">
                        <input type="checkbox" checked={form.data.archived} onChange={(e) => form.setData('archived', e.target.checked)} className="rounded ui-b-strong ui-subtle" />
                        Conta arquivada (não conta no consolidado)
                    </label>
                    <button type="submit" disabled={form.processing} className={`${primaryBtn} w-full justify-center py-2.5`}>{editing ? 'Salvar' : 'Criar conta'}</button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
