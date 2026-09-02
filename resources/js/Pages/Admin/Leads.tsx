import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { MessageSquare, Mail, Phone, Building } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    project_type: string;
    budget_range?: string;
    message: string;
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'archived';
    created_at: string;
}

interface AdminLeadsProps {
    leads: Lead[];
}

export default function AdminLeads({ leads }: AdminLeadsProps) {
    const handleStatusChange = (id: number, status: string) => {
        router.patch(`/admin/contatos/${id}/status`, { status });
    };

    return (
        <div className="min-h-screen ui-canvas ui-t p-6 sm:p-10 space-y-8">
            <Head title="Leads & Oportunidades — Admin KayTech" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold ui-t tracking-tight">Leads & Oportunidades</h1>
                    <p className="text-xs ui-t-soft mt-1">Solicitações de projeto enviadas pelo formulário comercial</p>
                </div>

                <Link href="/admin" className="text-xs ui-t-soft hover:ui-t ">← Dashboard</Link>
            </div>

            <div className="space-y-4">
                {leads.map((lead) => (
                    <div key={lead.id} className="p-6 rounded-xl ui-surface border ui-b space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b ui-b pb-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-medium ui-t flex items-center gap-3">
                                    <span>{lead.name}</span>
                                    {lead.company && (
                                        <span className="text-xs font-normal ui-t-soft bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                            {lead.company}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-xs ui-t-soft ">
                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 ui-t-soft" /> {lead.email}</span>
                                    {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 ui-pos" /> {lead.phone}</span>}
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs  ui-t-soft">Status:</span>
                                <select
                                    value={lead.status}
                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                    className="bg-[#121218] border ui-b rounded-xl px-3 py-1.5 text-xs ui-t  focus:outline-none focus:border-purple-500"
                                >
                                    <option value="new">NOVO</option>
                                    <option value="contacted">CONTATADO</option>
                                    <option value="qualified">QUALIFICADO</option>
                                    <option value="closed">FECHADO</option>
                                    <option value="archived">ARQUIVADO</option>
                                </select>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ">
                            <div>
                                <span className="ui-t-faint block">TIPO DE PROJETO:</span>
                                <span className="ui-t-soft font-medium">{lead.project_type}</span>
                            </div>
                            <div>
                                <span className="ui-t-faint block">INVESTIMENTO ESTIMADO:</span>
                                <span className="ui-t font-medium">{lead.budget_range || 'Não informado'}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl ui-surface border ui-b text-sm ui-t-soft">
                            <p className="whitespace-pre-line">{lead.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
