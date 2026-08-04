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
        <div className="min-h-screen bg-[#050505] text-white p-6 sm:p-10 space-y-8">
            <Head title="Leads & Oportunidades — Admin KayTech" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Leads & Oportunidades</h1>
                    <p className="text-xs text-gray-400 mt-1">Solicitações de projeto enviadas pelo formulário comercial</p>
                </div>

                <Link href="/admin" className="text-xs text-gray-400 hover:text-white font-mono">← Dashboard</Link>
            </div>

            <div className="space-y-4">
                {leads.map((lead) => (
                    <div key={lead.id} className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span>{lead.name}</span>
                                    {lead.company && (
                                        <span className="text-xs font-normal text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                            {lead.company}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-mono">
                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-400" /> {lead.email}</span>
                                    {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-green-400" /> {lead.phone}</span>}
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400">Status:</span>
                                <select
                                    value={lead.status}
                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                    className="bg-[#121218] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                            <div>
                                <span className="text-gray-500 block">TIPO DE PROJETO:</span>
                                <span className="text-purple-300 font-bold">{lead.project_type}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">INVESTIMENTO ESTIMADO:</span>
                                <span className="text-white font-bold">{lead.budget_range || 'Não informado'}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-gray-300">
                            <p className="whitespace-pre-line">{lead.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
