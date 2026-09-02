import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ImageUpload } from '../../Components/Admin/ImageUpload';
import { KaytechProduct } from '../../Types';

interface AdminProductsProps {
    products: KaytechProduct[];
}

export default function AdminProducts({ products }: AdminProductsProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<KaytechProduct | null>(null);

    const { data, setData, post, put, delete: destroy, reset } = useForm({
        name: '',
        tagline: '',
        description: '',
        cover: '',
        access_url: '',
        background_color: '',
        background_image: '',
        order: 1,
        active: true as boolean,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            put(`/admin/produtos/${editingProduct.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingProduct(null); }
            });
        } else {
            post('/admin/produtos', {
                onSuccess: () => { setModalOpen(false); reset(); }
            });
        }
    };

    return (
        <AdminLayout
            title="Produtos KayTech"
            subtitle="Produtos e subempresas próprias exibidos na landing page"
            headerAction={
                <button
                    onClick={() => { reset(); setEditingProduct(null); setModalOpen(true); }}
                    className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Produto</span>
                </button>
            }
        >
            <Head title="Produtos — Admin KayTech" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p.id} className="ui-surface border ui-b rounded-xl overflow-hidden flex flex-col">
                        <div className="h-40 ui-canvas overflow-hidden">
                            <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium ui-t">{p.name}</span>
                                    <span className={`text-[10px]  px-2 py-0.5 rounded ${p.active ? 'ui-subtle ui-pos' : 'ui-subtle ui-t-faint'}`}>
                                        {p.active ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                                {p.tagline && <span className="text-xs ui-t-faint block mt-1">{p.tagline}</span>}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t ui-b">
                                {p.access_url ? (
                                    <a href={p.access_url} target="_blank" rel="noopener noreferrer" className="text-xs ui-t-soft hover:underline flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> Acessar
                                    </a>
                                ) : <span />}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingProduct(p);
                                            setData({
                                                name: p.name,
                                                tagline: p.tagline || '',
                                                description: p.description,
                                                cover: p.cover,
                                                access_url: p.access_url || '',
                                                background_color: p.background_color || '',
                                                background_image: p.background_image || '',
                                                order: p.order,
                                                active: p.active,
                                            });
                                            setModalOpen(true);
                                        }}
                                        className="p-2 ui-subtle hover:ui-subtle ui-t rounded-lg"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Remover este produto?')) destroy(`/admin/produtos/${p.id}`); }}
                                        className="p-2 ui-subtle hover:bg-red-500/20 ui-neg rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="ui-surface border ui-b rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b ui-b pb-4">
                            <h2 className="text-xl font-medium ui-t">
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft ">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Nome do Produto</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Tagline (opcional)</label>
                                <input
                                    type="text"
                                    value={data.tagline}
                                    onChange={(e) => setData('tagline', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Descrição</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <ImageUpload
                                label="Imagem de Capa"
                                value={data.cover}
                                onChange={(path) => setData('cover', path)}
                                folder="products"
                                required
                            />
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">URL de Acesso (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.access_url}
                                    onChange={(e) => setData('access_url', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Cor de Fundo da Página (opcional)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={data.background_color || '#050505'}
                                        onChange={(e) => setData('background_color', e.target.value)}
                                        className="w-10 h-10 bg-transparent border ui-b rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        placeholder="#050505"
                                        value={data.background_color}
                                        onChange={(e) => setData('background_color', e.target.value)}
                                        className="flex-1 ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                    />
                                </div>
                            </div>
                            <ImageUpload
                                label="Imagem de Fundo da Página (opcional)"
                                value={data.background_image}
                                onChange={(path) => setData('background_image', path)}
                                folder="products"
                            />
                            <div className="flex items-center gap-3">
                                <label className="block text-xs  uppercase ui-t-soft">Ordem</label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-24 ui-subtle border ui-b rounded-xl px-4 py-2 text-xs ui-t"
                                />
                                <label className="flex items-center gap-2 text-xs ui-t-soft ml-auto">
                                    <input
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="accent-[var(--ui-text)]"
                                    />
                                    Ativo
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full ui-btn ui-btn-primary font-medium py-3.5 rounded-xl transition text-xs uppercase "
                            >
                                Salvar Produto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
