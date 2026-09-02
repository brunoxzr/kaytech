import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { CareerMilestone } from '../../Types';

interface AdminCareerMilestonesProps {
    milestones: CareerMilestone[];
}

export default function AdminCareerMilestones({ milestones }: AdminCareerMilestonesProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingMilestone, setEditingMilestone] = useState<CareerMilestone | null>(null);

    const { data, setData, post, put, delete: destroy, reset, transform } = useForm({
        year: '',
        title: '',
        description: '',
        technologies: '',
        icon_name: '',
        order: 1,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        transform((form) => ({
            ...form,
            technologies: form.technologies
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        }));

        if (editingMilestone) {
            put(`/admin/carreira/${editingMilestone.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingMilestone(null); },
            });
        } else {
            post('/admin/carreira', {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        }
    };

    return (
        <AdminLayout
            title="Trajetória / Carreira"
            subtitle="Timeline exibida no perfil pessoal em /brunokay"
            headerAction={
                <button
                    onClick={() => { reset(); setEditingMilestone(null); setModalOpen(true); }}
                    className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Marco</span>
                </button>
            }
        >
            <Head title="Carreira — Admin KayTech" />

            <div className="space-y-3">
                {milestones.length === 0 && (
                    <p className="text-sm ui-t-faint">Nenhum marco de carreira cadastrado ainda.</p>
                )}
                {milestones.map((m) => (
                    <div key={m.id} className="ui-surface border ui-b rounded-xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <span className="text-2xl font-semibold ui-t-soft  shrink-0">{m.year}</span>
                            <div className="min-w-0">
                                <span className="font-medium ui-t block">{m.title}</span>
                                <span className="text-xs ui-t-faint truncate block">{m.description}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => {
                                    setEditingMilestone(m);
                                    setData({
                                        year: m.year,
                                        title: m.title,
                                        description: m.description,
                                        technologies: (m.technologies || []).join(', '),
                                        icon_name: m.icon_name || '',
                                        order: m.order,
                                    });
                                    setModalOpen(true);
                                }}
                                className="p-2 ui-subtle hover:ui-subtle ui-t rounded-lg"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Remover este marco de carreira?')) destroy(`/admin/carreira/${m.id}`); }}
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
                                {editingMilestone ? 'Editar Marco' : 'Novo Marco'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft ">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Ano</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="2026"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Descrição</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Tecnologias (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    placeholder="React, Laravel, PostgreSQL"
                                    value={data.technologies}
                                    onChange={(e) => setData('technologies', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="block text-xs  uppercase ui-t-soft">Ordem</label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-24 ui-subtle border ui-b rounded-xl px-4 py-2 text-xs ui-t"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full ui-btn ui-btn-primary font-medium py-3.5 rounded-xl transition text-xs uppercase "
                            >
                                Salvar Marco
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
