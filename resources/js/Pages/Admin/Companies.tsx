import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ImageUpload } from '../../Components/Admin/ImageUpload';

interface CompanyAdminProps {
    companies: any[];
}

export default function AdminCompanies({ companies }: CompanyAdminProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingCompany, setEditingCompany] = useState<any | null>(null);

    const { data, setData, post, put, delete: destroy, reset } = useForm({
        name: '',
        logo: '',
        url: '',
        order: 1,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCompany) {
            put(`/admin/empresas/${editingCompany.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingCompany(null); }
            });
        } else {
            post('/admin/empresas', {
                onSuccess: () => { setModalOpen(false); reset(); }
            });
        }
    };

    return (
        <AdminLayout
            title="Empresas do Marquee"
            subtitle="Gerencie a lista oficial de marcas no carrossel infinito"
            headerAction={
                <button
                    onClick={() => { reset(); setEditingCompany(null); setModalOpen(true); }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Empresa</span>
                </button>
            }
        >
            <Head title="Empresas Marquee — Admin KayTech" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {companies.map((c) => (
                    <div key={c.id} className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between items-center space-y-4 text-center">
                        <img src={c.logo} alt={c.name} className="h-12 w-auto object-contain filter grayscale" />
                        <span className="font-bold text-white text-base">{c.name}</span>

                        <div className="flex gap-2 pt-2 border-t border-white/10 w-full justify-center">
                            <button
                                onClick={() => {
                                    setEditingCompany(c);
                                    setData({ name: c.name, logo: c.logo, url: c.url || '', order: c.order });
                                    setModalOpen(true);
                                }}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Remover esta empresa?')) destroy(`/admin/empresas/${c.id}`); }}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0d0d14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h2 className="text-xl font-bold text-white">
                                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 font-mono">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Nome da Empresa</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                                />
                            </div>
                            <ImageUpload
                                label="Logo"
                                value={data.logo}
                                onChange={(path) => setData('logo', path)}
                                folder="companies"
                                required
                            />
                            <div>
                                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">URL (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition text-xs uppercase font-mono"
                            >
                                Salvar Empresa
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
