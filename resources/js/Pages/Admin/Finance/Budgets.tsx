import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { brl } from '../../../Components/Admin/Finance/shared';

interface Row { category_id: number; category: string; color: string; planned: number; spent: number; }

const monthLabel = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const shiftMonth = (iso: string, delta: number) => {
    const d = new Date(iso + 'T00:00:00');
    d.setMonth(d.getMonth() + delta);
    return d.toISOString().slice(0, 10);
};

function BudgetInput({ row, year, month }: { row: Row; year: number; month: number }) {
    const form = useForm({ category_id: row.category_id, year, month, amount: String(row.planned || '') });
    const save = () => form.post('/admin/financas/orcamentos', { preserveScroll: true });

    const plannedCents = Math.round(Number(form.data.amount || 0) * 100);
    const pct = plannedCents > 0 ? Math.min(100, (row.spent / plannedCents) * 100) : 0;
    const over = plannedCents > 0 && row.spent > plannedCents;

    return (
        <div className="rounded-xl border ui-b ui-surface p-4">
            <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium ui-t/85">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />{row.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs ui-t-faint">
                    <span>R$</span>
                    <input
                        type="number" step="0.01" min="0"
                        value={form.data.amount}
                        onChange={(e) => form.setData('amount', e.target.value)}
                        onBlur={save}
                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        className="w-24 rounded-lg border ui-b ui-canvas px-2 py-1 text-right text-sm ui-t focus:border-[var(--ui-text)] focus:outline-none"
                        placeholder="0,00"
                    />
                </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full ui-subtle">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? '#fb7185' : row.color }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px]">
                <span className={over ? 'ui-neg' : 'ui-t-faint'}>Gasto: {brl(row.spent)}</span>
                {plannedCents > 0 && <span className="ui-t-faint">Resta: {brl(Math.max(0, plannedCents - row.spent))}</span>}
            </div>
        </div>
    );
}

export default function Budgets({ refDate, rows }: { refDate: string; rows: Row[] }) {
    const d = new Date(refDate + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const totalPlanned = rows.reduce((s, r) => s + Math.round(r.planned * 100), 0);
    const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

    const go = (iso: string) => router.get('/admin/financas/orcamentos', { date: iso }, { preserveScroll: true });

    return (
        <AdminLayout
            title="Orçamentos"
            subtitle="Defina um limite por categoria e acompanhe o previsto vs. realizado"
            headerAction={
                <div className="flex items-center gap-1 rounded-xl border ui-b ui-surface p-1">
                    <button onClick={() => go(shiftMonth(refDate, -1))} className="rounded-lg p-1.5 ui-t-faint hover:ui-subtle hover:ui-t"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="min-w-[140px] text-center text-xs font-medium capitalize ui-t">{monthLabel(refDate)}</span>
                    <button onClick={() => go(shiftMonth(refDate, 1))} className="rounded-lg p-1.5 ui-t-faint hover:ui-subtle hover:ui-t"><ChevronRight className="h-4 w-4" /></button>
                </div>
            }
        >
            <Head title="Orçamentos — Finanças KayTech" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border ui-b ui-surface p-5">
                    <span className="text-[11px] uppercase tracking-wider ui-t-faint">Orçado</span>
                    <span className="mt-1 block text-xl font-semibold ui-t">{brl(totalPlanned)}</span>
                </div>
                <div className="rounded-xl border ui-b ui-surface p-5">
                    <span className="text-[11px] uppercase tracking-wider ui-t-faint">Gasto</span>
                    <span className={`mt-1 block text-xl font-semibold ${totalSpent > totalPlanned && totalPlanned > 0 ? 'ui-neg' : 'ui-t'}`}>{brl(totalSpent)}</span>
                </div>
                <div className="rounded-xl border ui-b ui-surface p-5">
                    <span className="text-[11px] uppercase tracking-wider ui-t-faint">Saldo do orçamento</span>
                    <span className={`mt-1 block text-xl font-semibold ${totalPlanned - totalSpent >= 0 ? 'ui-pos' : 'ui-neg'}`}>{brl(totalPlanned - totalSpent)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {rows.map((r) => <BudgetInput key={r.category_id} row={r} year={year} month={month} />)}
                {rows.length === 0 && <p className="text-sm ui-t-faint">Crie categorias de saída para orçar.</p>}
            </div>
        </AdminLayout>
    );
}
