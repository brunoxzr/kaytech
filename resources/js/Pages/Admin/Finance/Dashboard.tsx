import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Panel, PanelTitle, Stat, Button, Field, Input, Modal } from '../../../Components/Admin/ui';
import { brl, brlShort } from '../../../Components/Admin/Finance/shared';

interface Summary {
    totalRaised: number; income: number; expense: number; net: number;
    pendingPayable: number; pendingReceivable: number; overdueCount: number;
}
interface CashflowPoint { label: string; income: number; expense: number; }
interface CategorySlice { name: string; color: string; total: number; }
interface BudgetRow { category: string; color: string; planned: number; spent: number; }
interface Goal { id: number; name: string; target_amount: number; current_amount: number; color: string; achieved: boolean; target_date: string | null; }
interface TxRow {
    id: number; type: string; amount: number; description: string; date: string; paid: boolean;
    account?: { name: string }; category?: { name: string; color: string };
}
interface Props {
    refDate: string;
    summary: Summary;
    cashflow: CashflowPoint[];
    balanceTrend: { label: string; balance: number }[];
    byCategory: CategorySlice[];
    budgets: BudgetRow[];
    goals: Goal[];
    recentTransactions: TxRow[];
}

const monthLabel = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const shiftMonth = (iso: string, delta: number) => {
    const d = new Date(iso + 'T00:00:00');
    d.setMonth(d.getMonth() + delta);
    return d.toISOString().slice(0, 10);
};

function CashflowChart({ data }: { data: CashflowPoint[] }) {
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
    const W = 520, H = 170, pad = 22;
    const bw = (W - pad * 2) / data.length;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Fluxo de caixa">
            {[0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2)} y2={H - pad - f * (H - pad * 2)}
                      stroke="var(--ui-border)" />
            ))}
            {data.map((d, i) => {
                const x = pad + i * bw;
                const ih = (d.income / max) * (H - pad * 2);
                const eh = (d.expense / max) * (H - pad * 2);
                return (
                    <g key={i}>
                        <rect x={x + bw * 0.2} y={H - pad - ih} width={bw * 0.26} height={ih} rx={2} fill="var(--ui-pos)" />
                        <rect x={x + bw * 0.54} y={H - pad - eh} width={bw * 0.26} height={eh} rx={2} fill="var(--ui-neg)" />
                        <text x={x + bw / 2} y={H - 5} textAnchor="middle" fill="var(--ui-text-faint)" fontSize="9">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

function BalanceTrendChart({ data }: { data: { label: string; balance: number }[] }) {
    if (data.length < 2) return <p className="py-8 text-center text-[13px] ui-t-faint">Dados insuficientes.</p>;
    const W = 520, H = 170, pad = 26;
    const values = data.map((d) => d.balance);
    const min = Math.min(0, ...values);
    const max = Math.max(1, ...values);
    const x = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
    const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.balance).toFixed(1)}`).join(' ');
    const area = `${line} L ${x(data.length - 1).toFixed(1)} ${H - pad} L ${x(0).toFixed(1)} ${H - pad} Z`;
    const last = data[data.length - 1];
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Evolução do saldo (12 meses)">
            {[0, 0.5, 1].map((f) => (
                <line key={f} x1={pad} x2={W - pad} y1={pad + f * (H - pad * 2)} y2={pad + f * (H - pad * 2)} stroke="var(--ui-border)" />
            ))}
            <path d={area} fill="var(--ui-text)" opacity="0.06" />
            <path d={line} fill="none" stroke="var(--ui-text)" strokeWidth="1.75" />
            <circle cx={x(data.length - 1)} cy={y(last.balance)} r="3.5" fill="var(--ui-text)" />
            {data.map((d, i) => (i % 2 === 0 || i === data.length - 1) && (
                <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fill="var(--ui-text-faint)" fontSize="9">{d.label}</text>
            ))}
        </svg>
    );
}

function DonutChart({ data }: { data: CategorySlice[] }) {
    const total = data.reduce((s, d) => s + d.total, 0);
    if (total === 0) return <p className="py-8 text-center text-[13px] ui-t-faint">Sem despesas categorizadas neste mês.</p>;
    let acc = 0;
    const R = 58, C = 2 * Math.PI * R;
    return (
        <div className="flex flex-wrap items-center gap-6">
            <svg viewBox="0 0 150 150" className="h-36 w-36 -rotate-90">
                {data.map((d, i) => {
                    const frac = d.total / total;
                    const seg = (
                        <circle key={i} cx="75" cy="75" r={R} fill="none" stroke={d.color} strokeWidth="16"
                                strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} />
                    );
                    acc += frac;
                    return seg;
                })}
            </svg>
            <ul className="flex-1 space-y-1.5 text-[13px]">
                {data.slice(0, 6).map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 ui-t-soft">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name}
                        </span>
                        <span className="font-medium ui-t">{brl(d.total)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function FinanceDashboard({
    refDate, summary, cashflow, balanceTrend, byCategory, budgets, goals, recentTransactions,
}: Props) {
    const [goalModal, setGoalModal] = React.useState(false);
    const goalForm = useForm({ name: '', target_amount: '', current_amount: '0', target_date: '', color: '#1F7A3D' });
    const go = (iso: string) => router.get('/admin/financas', { date: iso }, { preserveScroll: true });
    const saveGoal = (e: React.FormEvent) => {
        e.preventDefault();
        goalForm.post('/admin/financas/metas', { onSuccess: () => { setGoalModal(false); goalForm.reset(); } });
    };

    return (
        <AdminLayout
            title="Finanças"
            subtitle="Visão geral da saúde financeira"
            headerAction={
                <div className="flex items-center gap-1 rounded-lg border ui-b-strong p-0.5">
                    <button onClick={() => go(shiftMonth(refDate, -1))} className="rounded-md p-1.5 ui-t-faint transition hover:ui-subtle">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[136px] text-center text-[12px] font-medium capitalize ui-t-soft">{monthLabel(refDate)}</span>
                    <button onClick={() => go(shiftMonth(refDate, 1))} className="rounded-md p-1.5 ui-t-faint transition hover:ui-subtle">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            }
        >
            <Head title="Finanças — Admin KayTech" />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total levantado" value={brl(summary.totalRaised)} tone="pos" hint="todas as entradas já recebidas" />
                <Stat label="Entradas no mês" value={brl(summary.income)} tone="pos" />
                <Stat label="Saídas no mês" value={brl(summary.expense)} tone="neg" />
                <Stat label="Resultado do mês" value={brl(summary.net)} tone={summary.net >= 0 ? 'pos' : 'neg'} />
            </div>

            {(summary.pendingPayable > 0 || summary.pendingReceivable > 0) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Stat label="A pagar" value={brl(summary.pendingPayable)} tone="neg" />
                    <Stat label="A receber" value={brl(summary.pendingReceivable)} tone="pos" />
                    <Stat label="Vencidos" value={String(summary.overdueCount)} tone={summary.overdueCount > 0 ? 'neg' : 'default'} hint="pendentes atrasados" />
                </div>
            )}

            <Panel>
                <PanelTitle>Evolução do saldo · 12 meses</PanelTitle>
                <BalanceTrendChart data={balanceTrend} />
            </Panel>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel>
                    <PanelTitle>Fluxo de caixa · 6 meses</PanelTitle>
                    <CashflowChart data={cashflow} />
                    <div className="mt-3 flex gap-4 text-[11px] ui-t-faint">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--ui-pos)' }} /> Entradas</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--ui-neg)' }} /> Saídas</span>
                    </div>
                </Panel>
                <Panel>
                    <PanelTitle>Gasto por categoria</PanelTitle>
                    <DonutChart data={byCategory} />
                </Panel>
            </div>

            {budgets.length > 0 && (
                <Panel>
                    <PanelTitle action={<Link href="/admin/financas/orcamentos" className="text-[12px] ui-t-soft hover:ui-t">Editar</Link>}>
                        Orçamento do mês
                    </PanelTitle>
                    <div className="space-y-3">
                        {budgets.map((b, i) => {
                            const pct = b.planned > 0 ? Math.min(100, (b.spent / b.planned) * 100) : 100;
                            const over = b.spent > b.planned;
                            return (
                                <div key={i}>
                                    <div className="mb-1 flex justify-between text-[12px]">
                                        <span className="ui-t-soft">{b.category}</span>
                                        <span className={over ? 'ui-neg' : 'ui-t-faint'}>{brl(b.spent)} / {brl(b.planned)}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full ui-subtle">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? 'var(--ui-neg)' : b.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel>
                    <PanelTitle action={
                        <button onClick={() => setGoalModal(true)} className="flex items-center gap-1 text-[12px] ui-t-soft hover:ui-t">
                            <Plus className="h-3.5 w-3.5" /> Nova
                        </button>
                    }>Metas</PanelTitle>
                    <div className="space-y-4">
                        {goals.map((g) => {
                            const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
                            return (
                                <div key={g.id}>
                                    <div className="mb-1 flex items-center justify-between text-[12px]">
                                        <span className="ui-t-soft">{g.name}</span>
                                        <span className="ui-t-faint">{brl(g.current_amount)} / {brl(g.target_amount)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full ui-subtle">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                                        </div>
                                        <button onClick={() => { if (confirm('Remover meta?')) router.delete(`/admin/financas/metas/${g.id}`); }}
                                                className="ui-t-faint hover:ui-neg">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && <p className="text-[13px] ui-t-faint">Nenhuma meta definida.</p>}
                    </div>
                </Panel>

                <Panel>
                    <PanelTitle action={<Link href="/admin/financas/lancamentos" className="text-[12px] ui-t-soft hover:ui-t">Ver todos</Link>}>
                        Últimos lançamentos
                    </PanelTitle>
                    <ul className="ui-divide">
                        {recentTransactions.map((t) => (
                            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                                <span className="flex min-w-0 items-center gap-2.5">
                                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${t.type === 'income' ? 'ui-pos' : 'ui-neg'}`}>
                                        {t.type === 'income' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-[13px] ui-t">{t.description}</span>
                                        <span className="block text-[11px] ui-t-faint">
                                            {t.account?.name} · {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}{!t.paid && ' · pendente'}
                                        </span>
                                    </span>
                                </span>
                                <span className={`shrink-0 text-[13px] font-medium ${t.type === 'income' ? 'ui-pos' : 'ui-neg'}`}>
                                    {t.type === 'income' ? '+' : '−'}{brlShort(t.amount)}
                                </span>
                            </li>
                        ))}
                        {recentTransactions.length === 0 && <p className="py-4 text-[13px] ui-t-faint">Nenhum lançamento ainda.</p>}
                    </ul>
                </Panel>
            </div>

            <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Nova meta">
                <form onSubmit={saveGoal} className="space-y-4">
                    <Field label="Nome"><Input required value={goalForm.data.name} onChange={(e) => goalForm.setData('name', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Valor alvo (R$)"><Input type="number" step="0.01" min="0.01" required value={goalForm.data.target_amount} onChange={(e) => goalForm.setData('target_amount', e.target.value)} /></Field>
                        <Field label="Já guardado (R$)"><Input type="number" step="0.01" min="0" value={goalForm.data.current_amount} onChange={(e) => goalForm.setData('current_amount', e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Data alvo"><Input type="date" value={goalForm.data.target_date} onChange={(e) => goalForm.setData('target_date', e.target.value)} /></Field>
                        <Field label="Cor"><Input type="color" className="h-9 p-1" value={goalForm.data.color} onChange={(e) => goalForm.setData('color', e.target.value)} /></Field>
                    </div>
                    <Button type="submit" disabled={goalForm.processing} className="w-full justify-center">Salvar meta</Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
