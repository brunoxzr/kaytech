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
                    className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Empresa</span>
                </button>
            }
        >
            <Head title="Empresas Marquee — Admin KayTech" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {companies.map((c) => (
                    <div key={c.id} className="ui-surface border ui-b rounded-xl p-6 flex flex-col justify-between items-center space-y-4 text-center">
                        <img src={c.logo} alt={c.name} className="h-12 w-auto object-contain filter grayscale" />
                        <span className="font-medium ui-t text-base">{c.name}</span>

                        <div className="flex gap-2 pt-2 border-t ui-b w-full justify-center">
                            <button
                                onClick={() => {
                                    setEditingCompany(c);
                                    setData({ name: c.name, logo: c.logo, url: c.url || '', order: c.order });
                                    setModalOpen(true);
                                }}
                                className="p-2 ui-subtle hover:ui-subtle ui-t rounded-lg"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Remover esta empresa?')) destroy(`/admin/empresas/${c.id}`); }}
                                className="p-2 ui-subtle hover:bg-red-500/20 ui-neg rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="ui-surface border ui-b rounded-xl p-6 sm:p-8 max-w-md w-full space-y-6">
                        <div className="flex items-center justify-between border-b ui-b pb-4">
                            <h2 className="text-xl font-medium ui-t">
                                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft ">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Nome da Empresa</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
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
                                <label className="block text-xs  uppercase ui-t-soft mb-1">URL (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full ui-btn ui-btn-primary font-medium py-3.5 rounded-xl transition text-xs uppercase "
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
