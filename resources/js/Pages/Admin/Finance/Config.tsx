import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PiggyBank, Tags, Repeat, LayoutDashboard, Target, Plus, ArrowRight, Edit3, Trash2, Link2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Panel, Button, Field, Input, Select, Modal } from '../../../Components/Admin/ui';
import { brl, ACCOUNT_TYPES } from '../../../Components/Admin/Finance/shared';

interface Account { id: number; name: string; type: string; institution: string | null; balance: number; archived: boolean; color: string; }
interface Cat { id: number; name: string; type: string; color: string; children?: Cat[]; }
interface Rec { id: number; description: string; type: string; amount: number; day_of_month: number; active: boolean; account?: { name: string }; }
interface BudgetRow { category_id: number; category: string; color: string; planned: number; spent: number; }
interface Goal {
    id: number; name: string; target_amount: number; current_amount: number; saved: number;
    account_id: number | null; account_name: string | null; target_date: string | null;
    color: string; achieved: boolean;
}
interface GoalAccount { id: number; name: string; balance: number; }

interface Props {
    accounts: Account[];
    categories: Cat[];
    recurring: Rec[];
    budgetRefDate: string;
    budgetRows: BudgetRow[];
    goals: Goal[];
    goalAccounts: GoalAccount[];
}

type Tab = 'contas' | 'categorias' | 'recorrencias' | 'orcamentos' | 'metas';

export default function FinanceConfig({ accounts, categories, recurring, budgetRefDate, budgetRows, goals, goalAccounts }: Props) {
    const [tab, setTab] = React.useState<Tab>('contas');

    const tabs: { id: Tab; label: string; icon: typeof PiggyBank }[] = [
        { id: 'contas', label: 'Contas', icon: PiggyBank },
        { id: 'categorias', label: 'Categorias', icon: Tags },
        { id: 'recorrencias', label: 'Recorrências', icon: Repeat },
        { id: 'orcamentos', label: 'Orçamentos', icon: LayoutDashboard },
        { id: 'metas', label: 'Metas', icon: Target },
    ];

    /* ---- Metas ---- */
    const [goalModal, setGoalModal] = React.useState(false);
    const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null);
    const goalForm = useForm({
        name: '', target_amount: '', current_amount: '0',
        account_id: goalAccounts.find((a) => /invest/i.test(a.name))?.id ?? '' as string | number,
        target_date: '', color: '#22C55E',
    });
    const openNewGoal = () => {
        setEditingGoal(null);
        goalForm.setData({
            name: '', target_amount: '', current_amount: '0',
            account_id: goalAccounts.find((a) => /invest/i.test(a.name))?.id ?? '',
            target_date: '', color: '#22C55E',
        });
        setGoalModal(true);
    };
    const openEditGoal = (g: Goal) => {
        setEditingGoal(g);
        goalForm.setData({
            name: g.name, target_amount: String(g.target_amount), current_amount: String(g.current_amount),
            account_id: g.account_id ?? '', target_date: g.target_date ?? '', color: g.color,
        });
        setGoalModal(true);
    };
    const submitGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setGoalModal(false); goalForm.reset(); setEditingGoal(null); };
        editingGoal
            ? goalForm.put(`/admin/financas/metas/${editingGoal.id}`, { onSuccess: done })
            : goalForm.post('/admin/financas/metas', { onSuccess: done });
    };

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');
    const activeAcc = accounts.filter((a) => !a.archived);
    const totalPlanned = budgetRows.reduce((s, r) => s + Math.round(r.planned * 100), 0);
    const totalSpent = budgetRows.reduce((s, r) => s + r.spent, 0);
    const monthLabel = new Date(budgetRefDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <AdminLayout title="Configuração" subtitle="Contas, categorias, recorrências e orçamentos">
            <Head title="Config — Finanças KayTech" />

            {/* Abas */}
            <div className="flex flex-wrap gap-1 border-b ui-b">
                {tabs.map((tt) => (
                    <button
                        key={tt.id}
                        onClick={() => setTab(tt.id)}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-medium transition ${
                            tab === tt.id ? 'ui-t' : 'ui-t-faint hover:ui-t'
                        }`}
                        style={{ borderColor: tab === tt.id ? 'var(--ui-text)' : 'transparent' }}
                    >
                        <tt.icon className="h-4 w-4" strokeWidth={1.75} />
                        {tt.label}
                    </button>
                ))}
            </div>

            {/* ---------- CONTAS ---------- */}
            {tab === 'contas' && (
                <Panel className="overflow-hidden p-0">
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="text-[13px] font-semibold ui-t">
                            {activeAcc.length} conta{activeAcc.length !== 1 ? 's' : ''} ·{' '}
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(activeAcc.reduce((s, a) => s + a.balance, 0))}</span>
                        </span>
                        <Link href="/admin/financas/contas" className="flex items-center gap-1 text-[12px] ui-t-soft hover:ui-t">
                            Gerenciar <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="ui-divide border-t ui-b">
                        {activeAcc.map((a) => (
                            <div key={a.id} className="flex items-center justify-between px-5 py-3">
                                <span className="flex items-center gap-2.5 text-[13px]">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                                    <span className="ui-t">{a.name}</span>
                                    <span className="ui-t-faint">{ACCOUNT_TYPES[a.type]}{a.institution ? ` · ${a.institution}` : ''}</span>
                                </span>
                                <span className={`text-[13px] font-semibold ${a.balance >= 0 ? 'ui-t' : 'ui-neg'}`}
                                      style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(a.balance)}</span>
                            </div>
                        ))}
                        {activeAcc.length === 0 && <p className="px-5 py-8 text-center text-[13px] ui-t-faint">Nenhuma conta.</p>}
                    </div>
                </Panel>
            )}

            {/* ---------- CATEGORIAS ---------- */}
            {tab === 'categorias' && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {[['Saídas', expense], ['Entradas', income]].map(([title, items]) => (
                        <Panel key={title as string}>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-[13px] font-semibold ui-t">{title as string}</h3>
                                <Link href="/admin/financas/categorias" className="text-[12px] ui-t-soft hover:ui-t">Editar</Link>
                            </div>
                            <ul className="space-y-1">
                                {(items as Cat[]).map((c) => (
                                    <li key={c.id}>
                                        <span className="flex items-center gap-2 py-1 text-[13px] ui-t-soft">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}
                                        </span>
                                        {c.children && c.children.length > 0 && (
                                            <ul className="ml-5 border-l ui-b pl-3">
                                                {c.children.map((sc) => (
                                                    <li key={sc.id} className="flex items-center gap-2 py-0.5 text-[12px] ui-t-faint">
                                                        <span className="h-2 w-2 rounded-full" style={{ background: sc.color }} />{sc.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                                {(items as Cat[]).length === 0 && <p className="py-2 text-[12px] ui-t-faint">Nenhuma categoria.</p>}
                            </ul>
                        </Panel>
                    ))}
                </div>
            )}

            {/* ---------- RECORRÊNCIAS ---------- */}
            {tab === 'recorrencias' && (
                <Panel className="overflow-hidden p-0">
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="text-[13px] font-semibold ui-t">{recurring.length} recorrência{recurring.length !== 1 ? 's' : ''}</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.post('/admin/financas/recorrencias/gerar')}
                                    className="text-[12px] ui-t-soft hover:ui-t">Gerar pendentes</button>
                            <Link href="/admin/financas/recorrencias" className="flex items-center gap-1 text-[12px] ui-t-soft hover:ui-t">
                                Gerenciar <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                    <div className="ui-divide border-t ui-b">
                        {recurring.map((r) => (
                            <div key={r.id} className="flex items-center justify-between px-5 py-3 text-[13px]">
                                <span className="flex items-center gap-2.5">
                                    <span className={`inline-block h-2 w-2 rounded-full ${r.active ? 'ui-pos' : 'ui-subtle'}`} />
                                    <span className="ui-t">{r.description}</span>
                                    <span className="ui-t-faint">dia {r.day_of_month} · {r.account?.name}</span>
                                </span>
                                <span className={`font-semibold ${r.type === 'income' ? 'ui-pos' : 'ui-neg'}`}
                                      style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(r.amount)}</span>
                            </div>
                        ))}
                        {recurring.length === 0 && <p className="px-5 py-8 text-center text-[13px] ui-t-faint">Nenhuma recorrência.</p>}
                    </div>
                </Panel>
            )}

            {/* ---------- ORÇAMENTOS ---------- */}
            {tab === 'orcamentos' && (
                <Panel>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[13px] font-semibold capitalize ui-t">{monthLabel}</h3>
                        <div className="flex items-center gap-4 text-[12px] ui-t-faint">
                            <span>Orçado <strong className="ui-t">{brl(totalPlanned)}</strong></span>
                            <span>Gasto <strong className={totalSpent > totalPlanned && totalPlanned > 0 ? 'ui-neg' : 'ui-t'}>{brl(totalSpent)}</strong></span>
                            <Link href="/admin/financas/orcamentos" className="ui-t-soft hover:ui-t">Editar</Link>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {budgetRows.filter((r) => r.planned > 0 || r.spent > 0).map((r) => {
                            const plannedCents = Math.round(r.planned * 100);
                            const pct = plannedCents > 0 ? Math.min(100, (r.spent / plannedCents) * 100) : 100;
                            const over = plannedCents > 0 && r.spent > plannedCents;
                            return (
                                <div key={r.category_id}>
                                    <div className="mb-1 flex justify-between text-[12px]">
                                        <span className="ui-t-soft">{r.category}</span>
                                        <span className={over ? 'ui-neg' : 'ui-t-faint'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            {brl(r.spent)}{plannedCents > 0 && ` / ${brl(plannedCents)}`}
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full ui-subtle">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? 'var(--ui-neg)' : r.color }} />
                                    </div>
                                </div>
                            );
                        })}
                        {budgetRows.every((r) => r.planned === 0 && r.spent === 0) && (
                            <p className="py-4 text-center text-[13px] ui-t-faint">Nenhum orçamento definido para este mês.</p>
                        )}
                    </div>
                </Panel>
            )}

            {/* ---------- METAS ---------- */}
            {tab === 'metas' && (
                <Panel>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[13px] font-semibold ui-t">{goals.length} meta{goals.length !== 1 ? 's' : ''}</h3>
                        <Button onClick={openNewGoal}><Plus className="h-4 w-4" /> Nova meta</Button>
                    </div>
                    <div className="space-y-4">
                        {goals.map((g) => {
                            const targetCents = Math.round(g.target_amount * 100);
                            const pct = targetCents > 0 ? Math.min(100, (g.saved / targetCents) * 100) : 0;
                            const done = g.saved >= targetCents;
                            return (
                                <div key={g.id} className="rounded-lg border ui-b p-4">
                                    <div className="mb-2 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="flex items-center gap-2 text-[13px] font-medium ui-t">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                                                {g.name}
                                                {done && <span className="text-[11px] ui-pos">✓ concluída</span>}
                                            </p>
                                            <p className="mt-0.5 text-[11px] ui-t-faint">
                                                {g.account_name
                                                    ? <span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" /> acompanha “{g.account_name}”</span>
                                                    : 'valor manual'}
                                                {g.target_date && ` · até ${new Date(g.target_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openEditGoal(g)} className="rounded-md border ui-b p-1.5 ui-t-soft hover:ui-subtle">
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => { if (confirm(`Remover a meta “${g.name}”?`)) router.delete(`/admin/financas/metas/${g.id}`); }}
                                                    className="rounded-md border ui-b p-1.5 ui-neg hover:ui-subtle">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-1 flex justify-between text-[12px]">
                                        <span className="ui-t-soft" style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(g.saved)}</span>
                                        <span className="ui-t-faint" style={{ fontVariantNumeric: 'tabular-nums' }}>{brl(targetCents)}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full ui-subtle">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && <p className="py-6 text-center text-[13px] ui-t-faint">Nenhuma meta ainda.</p>}
                    </div>
                </Panel>
            )}

            <Modal open={goalModal} onClose={() => setGoalModal(false)} title={editingGoal ? 'Editar meta' : 'Nova meta'}>
                <form onSubmit={submitGoal} className="space-y-4">
                    <Field label="Nome"><Input required value={goalForm.data.name} onChange={(e) => goalForm.setData('name', e.target.value)} placeholder="Reserva de emergência" /></Field>
                    <Field label="Valor alvo (R$)">
                        <Input type="number" step="0.01" min="0.01" required
                               value={goalForm.data.target_amount} onChange={(e) => goalForm.setData('target_amount', e.target.value)} />
                    </Field>
                    <Field label="Acompanhar o saldo de uma conta">
                        <Select value={String(goalForm.data.account_id)} onChange={(e) => goalForm.setData('account_id', e.target.value)}>
                            <option value="">— não vincular (valor manual) —</option>
                            {goalAccounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {brl(a.balance)}</option>)}
                        </Select>
                    </Field>
                    {!goalForm.data.account_id && (
                        <Field label="Já guardado (R$)">
                            <Input type="number" step="0.01" min="0"
                                   value={goalForm.data.current_amount} onChange={(e) => goalForm.setData('current_amount', e.target.value)} />
                        </Field>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Prazo (opcional)"><Input type="date" value={goalForm.data.target_date} onChange={(e) => goalForm.setData('target_date', e.target.value)} /></Field>
                        <Field label="Cor"><Input type="color" className="h-9 p-1" value={goalForm.data.color} onChange={(e) => goalForm.setData('color', e.target.value)} /></Field>
                    </div>
                    {goalForm.data.account_id && (
                        <p className="text-[12px] ui-t-faint">O progresso da meta vai acompanhar o saldo atual dessa conta automaticamente.</p>
                    )}
                    <Button type="submit" disabled={goalForm.processing} className="w-full justify-center py-2.5">
                        {editingGoal ? 'Salvar' : 'Criar meta'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
