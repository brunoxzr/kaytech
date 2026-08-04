import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit3, Copy } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ShortLink } from '../../Types';

interface AdminShortLinksProps {
    shortLinks: ShortLink[];
}

export default function AdminShortLinks({ shortLinks }: AdminShortLinksProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

    const { data, setData, post, put, delete: destroy, reset } = useForm({
        slug: '',
        destination_url: '',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLink) {
            put(`/admin/encurtador/${editingLink.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingLink(null); }
            });
        } else {
            post('/admin/encurtador', {
                onSuccess: () => { setModalOpen(false); reset(); }
            });
        }
    };

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/go/${slug}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <AdminLayout
            title="Encurtador de Links"
            subtitle="Crie links curtos no formato kaytech.com/go/slug"
            headerAction={
                <button
                    onClick={() => { reset(); setEditingLink(null); setModalOpen(true); }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Link Curto</span>
                </button>
            }
        >
            <Head title="Encurtador — Admin KayTech" />

            <div className="space-y-3">
                {shortLinks.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum link curto criado ainda.</p>
                )}
                {shortLinks.map((link) => (
                    <div key={link.id} className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-purple-300 text-sm">/go/{link.slug}</span>
                                <button onClick={() => copyLink(link.slug)} className="text-gray-500 hover:text-white">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <span className="text-xs text-gray-500 truncate block">{link.destination_url}</span>
                            <span className="text-[10px] font-mono text-gray-600 uppercase">{link.clicks} clique{link.clicks !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => {
                                    setEditingLink(link);
                                    setData({ slug: link.slug, destination_url: link.destination_url });
                                    setModalOpen(true);
                                }}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Remover este link curto?')) destroy(`/admin/encurtador/${link.id}`); }}
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
                                {editingLink ? 'Editar Link Curto' : 'Novo Link Curto'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 font-mono">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Slug (ex: promo, evento2026)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-mono">/go/</span>
                                    <input
                                        type="text"
                                        required
                                        pattern="[a-zA-Z0-9_-]+"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">URL de Destino</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    value={data.destination_url}
                                    onChange={(e) => setData('destination_url', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition text-xs uppercase font-mono"
                            >
                                Salvar Link Curto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
