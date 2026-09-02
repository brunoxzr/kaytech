import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { Panel, PanelTitle, Stat, Badge } from '../../Components/Admin/ui';

interface StatsProps {
    total_projects: number;
    total_companies: number;
    total_leads: number;
    new_leads: number;
}
interface LeadProps {
    id: number; name: string; email: string; project_type: string; status: string; created_at: string;
}
interface PipelineRow { status: string; count: number; value: number; }
interface Upcoming {
    id: number; name: string; company: string | null; next_action: string | null;
    next_action_at: string | null; overdue: boolean; today: boolean;
}
interface Crm {
    total: number;
    pipeline: PipelineRow[];
    won_value: number;
    open_value: number;
    upcoming: Upcoming[];
}
interface Finance {
    totalRaised: number;
    monthIncome: number;
    monthExpense: number;
    monthNet: number;
    series: { label: string; income: number; expense: number }[];
}
interface Props {
    stats: StatsProps;
    recent_leads: LeadProps[];
    crm: Crm;
    finance: Finance;
}

function MiniCashflow({ data }: { data: Finance['series'] }) {
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
    const W = 320, H = 90, pad = 6;
    const bw = (W - pad * 2) / data.length;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Entradas e saídas dos últimos 6 meses">
            {data.map((d, i) => {
                const x = pad + i * bw;
                const ih = (d.income / max) * (H - 18);
                const eh = (d.expense / max) * (H - 18);
                return (
                    <g key={i}>
                        <rect x={x + bw * 0.22} y={H - 14 - ih} width={bw * 0.26} height={ih} rx={1.5} fill="var(--ui-pos)" />
                        <rect x={x + bw * 0.52} y={H - 14 - eh} width={bw * 0.26} height={eh} rx={1.5} fill="var(--ui-neg)" />
                        <text x={x + bw / 2} y={H - 3} textAnchor="middle" fill="var(--ui-text-faint)" fontSize="8">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

const STATUS_LABEL: Record<string, string> = {
    prospect: 'Prospect', contacted: 'Contatado', proposal: 'Proposta', won: 'Fechado', lost: 'Perdido',
};
const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminDashboard({ stats, recent_leads, crm, finance }: Props) {
    return (
        <AdminLayout
            title="Visão geral"
            subtitle="Gestão do ecossistema KayTech"
            headerAction={<a href="/" target="_blank" className="text-[12px] ui-t-soft hover:ui-t">Abrir site público →</a>}
        >
            <Head title="Painel Admin — KayTech" />

            {/* KPIs gerais */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total levantado" value={brl(finance.totalRaised)} tone="pos" hint="entradas recebidas (histórico)" />
                <Stat label="Clientes no CRM" value={String(crm.total)} />
                <Stat label="Em negociação" value={brl(crm.open_value)} />
                <Stat label="Fechado" value={brl(crm.won_value)} tone={crm.won_value > 0 ? 'pos' : 'default'} />
            </div>

            {/* Resumo financeiro */}
            <Panel>
                <PanelTitle action={<Link href="/admin/financas" className="text-[12px] ui-t-soft hover:ui-t">Abrir Finanças</Link>}>
                    Entradas e saídas · 6 meses
                </PanelTitle>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:items-center">
                    <div className="sm:col-span-2">
                        <MiniCashflow data={finance.series} />
                        <div className="mt-2 flex gap-4 text-[11px] ui-t-faint">
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--ui-pos)' }} /> Entradas</span>
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--ui-neg)' }} /> Saídas</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                        <div>
                            <span className="block text-[11px] uppercase tracking-wide ui-t-faint">Entradas no mês</span>
                            <span className="text-base font-semibold ui-pos">{brl(finance.monthIncome)}</span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase tracking-wide ui-t-faint">Saídas no mês</span>
                            <span className="text-base font-semibold ui-neg">{brl(finance.monthExpense)}</span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase tracking-wide ui-t-faint">Resultado</span>
                            <span className={`text-base font-semibold ${finance.monthNet >= 0 ? 'ui-pos' : 'ui-neg'}`}>{brl(finance.monthNet)}</span>
                        </div>
                    </div>
                </div>
            </Panel>

            {/* CRM */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Panel className="lg:col-span-2">
                    <PanelTitle action={<Link href="/admin/clientes" className="text-[12px] ui-t-soft hover:ui-t">Abrir CRM</Link>}>
                        Pipeline
                    </PanelTitle>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {crm.pipeline.map((p) => (
                            <Link key={p.status} href="/admin/clientes"
                                  className="rounded-lg border ui-b p-3 transition hover:ui-b-strong">
                                <span className="block text-[11px] uppercase tracking-wide ui-t-faint">{STATUS_LABEL[p.status]}</span>
                                <span className="mt-1 block text-lg font-semibold ui-t">{p.count}</span>
                                {p.value > 0 && <span className="block text-[11px] ui-t-faint">{brl(p.value)}</span>}
                            </Link>
                        ))}
                    </div>
                </Panel>

                <Panel>
                    <PanelTitle>Próximos follow-ups</PanelTitle>
                    <ul className="ui-divide">
                        {crm.upcoming.map((u) => (
                            <li key={u.id} className="flex items-start gap-2 py-2.5">
                                <CalendarClock className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${u.overdue ? 'ui-neg' : u.today ? 'ui-pos' : 'ui-t-faint'}`} />
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] ui-t">{u.name}{u.company ? ` · ${u.company}` : ''}</p>
                                    <p className="text-[11px] ui-t-faint">
                                        {u.next_action ?? 'Follow-up'} ·{' '}
                                        {u.next_action_at && new Date(u.next_action_at + 'T00:00:00').toLocaleDateString('pt-BR')}
                                        {u.overdue && ' · atrasado'}{u.today && ' · hoje'}
                                    </p>
                                </div>
                            </li>
                        ))}
                        {crm.upcoming.length === 0 && <p className="py-3 text-[13px] ui-t-faint">Nada agendado.</p>}
                    </ul>
                </Panel>
            </div>

            {/* Leads do site */}
            <Panel>
                <PanelTitle action={<Link href="/admin/contatos" className="text-[12px] ui-t-soft hover:ui-t">Ver todos</Link>}>
                    Últimos leads do site
                </PanelTitle>
                <div className="overflow-x-auto">
                    <table className="ui-table">
                        <thead>
                            <tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {recent_leads.map((lead) => (
                                <tr key={lead.id}>
                                    <td className="font-medium ui-t">{lead.name}</td>
                                    <td>{lead.email}</td>
                                    <td>{lead.project_type}</td>
                                    <td><Badge tone={lead.status === 'new' ? 'pos' : 'default'}>{lead.status}</Badge></td>
                                </tr>
                            ))}
                            {recent_leads.length === 0 && (
                                <tr><td colSpan={4} className="py-8 text-center ui-t-faint">Nenhum lead ainda.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </AdminLayout>
    );
}
