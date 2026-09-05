import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { Panel, PanelTitle, Stat, Badge } from '../../Components/Admin/ui';
import { Greeting } from '../../Components/Admin/Greeting';

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
interface RecentProspect { id: number; name: string; phone: string | null; tags: string[] | null; status: string; when: string | null; }
interface Crm {
    total: number;
    pipeline: PipelineRow[];
    won_value: number;
    open_value: number;
    active_leads: number;
    unqualified: number;
    won_count: number;
    conversion: number;
    overdue_count: number;
    recent_prospects: RecentProspect[];
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

const STATUS_LABEL: Record<string, string> = {
    lead: 'Lead', prospect: 'Prospect', contacted: 'Contatado', proposal: 'Proposta', won: 'Fechado', lost: 'Perdido',
};
const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminDashboard({ recent_leads, crm }: Props) {
    return (
        <AdminLayout
            title={<Greeting />}
            subtitle="Gestão do ecossistema KayTech"
            headerAction={<a href="/" target="_blank" className="text-[12px] ui-t-soft hover:ui-t">Abrir site público →</a>}
        >
            <Head title="Painel Admin — KayTech" />

            {/* KPIs — o que move o negócio */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                    label="Leads a qualificar"
                    value={String(crm.unqualified)}
                    tone={crm.unqualified > 0 ? 'neg' : 'default'}
                    hint={`${crm.active_leads} leads na fila`}
                />
                <Stat label="Valor no funil" value={brl(crm.open_value)} hint="lead → proposta" />
                <Stat label="Taxa de conversão" value={`${crm.conversion}%`} tone={crm.conversion >= 30 ? 'pos' : 'default'} hint={`${crm.won_count} fechados`} />
                <Stat label="Fechado" value={brl(crm.won_value)} tone={crm.won_value > 0 ? 'pos' : 'default'} />
            </div>

            {crm.overdue_count > 0 && (
                <Link href="/admin/clientes" className="block rounded-lg border ui-b-strong ui-subtle px-4 py-3 text-[13px] ui-neg hover:ui-b">
                    ⚠ {crm.overdue_count} follow-up{crm.overdue_count !== 1 ? 's' : ''} atrasado{crm.overdue_count !== 1 ? 's' : ''} — clique para resolver
                </Link>
            )}

            {/* Prospecção recente */}
            <Panel>
                <PanelTitle action={<Link href="/admin/prospeccao" className="text-[12px] ui-t-soft hover:ui-t">Buscar mais</Link>}>
                    Leads da prospecção
                </PanelTitle>
                {crm.recent_prospects.length === 0 ? (
                    <p className="py-4 text-[13px] ui-t-faint">
                        Nenhum lead prospectado ainda. <Link href="/admin/prospeccao" className="ui-t underline">Buscar empresas sem site</Link>.
                    </p>
                ) : (
                    <ul className="ui-divide">
                        {crm.recent_prospects.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] ui-t">{p.name}</p>
                                    <p className="text-[11px] ui-t-faint">
                                        {(p.tags ?? []).filter((t) => t !== 'Prospecção').join(' · ') || '—'}
                                        {p.phone && ` · ${p.phone}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Badge>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                                    <span className="text-[11px] ui-t-faint">{p.when}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            {/* CRM */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Panel className="lg:col-span-2">
                    <PanelTitle action={<Link href="/admin/clientes" className="text-[12px] ui-t-soft hover:ui-t">Abrir CRM</Link>}>
                        Pipeline
                    </PanelTitle>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
