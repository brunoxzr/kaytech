import React from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';

interface StatsProps {
    total_projects: number;
    total_companies: number;
    total_leads: number;
    new_leads: number;
}

interface LeadProps {
    id: number;
    name: string;
    email: string;
    project_type: string;
    status: string;
    created_at: string;
}

interface AdminDashboardProps {
    stats: StatsProps;
    recent_leads: LeadProps[];
}

export default function AdminDashboard({ stats, recent_leads }: AdminDashboardProps) {
    return (
        <AdminLayout
            title="Visão Geral"
            subtitle="Gestão centralizada do ecossistema KayTech Solutions"
            headerAction={
                <a href="/" target="_blank" className="text-xs text-purple-400 hover:underline font-mono">
                    ➔ Abrir site público
                </a>
            }
        >
            <Head title="Painel Admin — KayTech Solutions" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 font-mono">
                <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-2">
                    <span className="text-xs text-gray-400 uppercase">Projetos Ativos</span>
                    <span className="text-3xl font-extrabold text-white block">{stats.total_projects}</span>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-2">
                    <span className="text-xs text-gray-400 uppercase">Empresas Marquee</span>
                    <span className="text-3xl font-extrabold text-white block">{stats.total_companies}</span>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-2">
                    <span className="text-xs text-gray-400 uppercase">Total de Leads</span>
                    <span className="text-3xl font-extrabold text-purple-400 block">{stats.total_leads}</span>
                </div>

                <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-2">
                    <span className="text-xs text-gray-400 uppercase">Leads Novos</span>
                    <span className="text-3xl font-extrabold text-green-400 block">{stats.new_leads}</span>
                </div>
            </div>

            {/* Recent Leads Table */}
            <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/10 space-y-4">
                <h2 className="text-xl font-bold text-white">Últimos Leads de Contato</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead className="text-gray-500 border-b border-white/10 uppercase">
                            <tr>
                                <th className="py-3 px-4">Nome</th>
                                <th className="py-3 px-4">E-mail</th>
                                <th className="py-3 px-4">Tipo</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {recent_leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/5 transition">
                                    <td className="py-3 px-4 font-bold text-white">{lead.name}</td>
                                    <td className="py-3 px-4">{lead.email}</td>
                                    <td className="py-3 px-4">{lead.project_type}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                                            lead.status === 'new' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'
                                        }`}>
                                            {lead.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
