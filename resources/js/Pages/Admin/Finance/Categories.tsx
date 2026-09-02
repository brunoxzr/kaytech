import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../../Components/Admin/AdminLayout';
import { Field, inputClass, Modal, primaryBtn } from '../../../Components/Admin/Finance/shared';

interface Cat {
    id: number; parent_id: number | null; name: string; type: string; color: string; icon: string | null;
    children?: Cat[];
}

export default function Categories({ categories, flat }: { categories: Cat[]; flat: { id: number; name: string; type: string }[] }) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<Cat | null>(null);
    const form = useForm({ parent_id: '', name: '', type: 'expense', color: '#6B7280', icon: '', order: 0 });

    const openNew = (type: string, parentId?: number) => {
        setEditing(null);
        form.setData({ parent_id: parentId ? String(parentId) : '', name: '', type, color: '#6B7280', icon: '', order: 0 });
        setModal(true);
    };
    const openEdit = (c: Cat) => {
        setEditing(c);
        form.setData({ parent_id: c.parent_id ? String(c.parent_id) : '', name: c.name, type: c.type, color: c.color, icon: c.icon ?? '', order: 0 });
        setModal(true);
    };
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModal(false); form.reset(); setEditing(null); };
        editing ? form.put(`/admin/financas/categorias/${editing.id}`, { onSuccess: done }) : form.post('/admin/financas/categorias', { onSuccess: done });
    };

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    const Group = ({ title, items, type }: { title: string; items: Cat[]; type: string }) => (
        <div className="rounded-xl border ui-b ui-surface p-5">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold ui-t">{title}</h2>
                <button onClick={() => openNew(type)} className="flex items-center gap-1 text-xs ui-t-soft hover:underline"><Plus className="h-3.5 w-3.5" /> Categoria</button>
            </div>
            <ul className="space-y-1">
                {items.map((c) => (
                    <li key={c.id}>
                        <div className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:ui-canvas">
                            <span className="flex items-center gap-2 text-sm ui-t">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}
                            </span>
                            <span className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                <button onClick={() => openNew(type, c.id)} title="Subcategoria" className="rounded p-1 ui-t-faint hover:ui-t"><Plus className="h-3.5 w-3.5" /></button>
                                <button onClick={() => openEdit(c)} className="rounded p-1 ui-t-faint hover:ui-t"><Edit3 className="h-3.5 w-3.5" /></button>
                                <button onClick={() => { if (confirm('Remover categoria?')) router.delete(`/admin/financas/categorias/${c.id}`); }} className="rounded p-1 ui-neg/70 hover:ui-neg"><Trash2 className="h-3.5 w-3.5" /></button>
                            </span>
                        </div>
                        {c.children && c.children.length > 0 && (
                            <ul className="ml-5 border-l ui-b pl-3">
                                {c.children.map((sc) => (
                                    <li key={sc.id} className="group flex items-center justify-between rounded-lg px-2 py-1 hover:ui-canvas">
                                        <span className="flex items-center gap-2 text-xs ui-t-soft">
                                            <span className="h-2 w-2 rounded-full" style={{ background: sc.color }} />{sc.name}
                                        </span>
                                        <span className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                            <button onClick={() => openEdit(sc)} className="rounded p-1 ui-t-faint hover:ui-t"><Edit3 className="h-3 w-3" /></button>
                                            <button onClick={() => { if (confirm('Remover subcategoria?')) router.delete(`/admin/financas/categorias/${sc.id}`); }} className="rounded p-1 ui-neg/70 hover:ui-neg"><Trash2 className="h-3 w-3" /></button>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
                {items.length === 0 && <p className="px-2 py-2 text-xs ui-t-faint">Nenhuma categoria.</p>}
            </ul>
        </div>
    );

    return (
        <AdminLayout title="Categorias" subtitle="Organize entradas e saídas por categoria e subcategoria">
            <Head title="Categorias — Finanças KayTech" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Group title="Saídas" items={expense} type="expense" />
                <Group title="Entradas" items={income} type="income" />
            </div>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nome"><input className={inputClass} required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fluxo">
                            <select className={inputClass} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                <option value="expense">Saída</option>
                                <option value="income">Entrada</option>
                            </select>
                        </Field>
                        <Field label="Cor"><input type="color" className={`${inputClass} h-9 p-1`} value={form.data.color} onChange={(e) => form.setData('color', e.target.value)} /></Field>
                    </div>
                    <Field label="Categoria pai (opcional)">
                        <select className={inputClass} value={form.data.parent_id} onChange={(e) => form.setData('parent_id', e.target.value)}>
                            <option value="">— nível principal —</option>
                            {flat.filter((c) => c.type === form.data.type && c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    <button type="submit" disabled={form.processing} className={`${primaryBtn} w-full py-3`}>{editing ? 'Salvar' : 'Criar categoria'}</button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
