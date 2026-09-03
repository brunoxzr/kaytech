import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Edit3, Trash2, Shield, Wallet } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { Panel, Button, Field, Input, Select, Modal, Badge } from '../../Components/Admin/ui';

interface U { id: number; name: string; email: string; role: string; created_at: string; }
interface Props { users: U[]; currentUserId: number; }

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', finance: 'Finanças' };

export default function Users({ users, currentUserId }: Props) {
    const [modal, setModal] = React.useState(false);
    const [editing, setEditing] = React.useState<U | null>(null);
    const form = useForm({ name: '', email: '', role: 'finance', password: '' });

    const openNew = () => { setEditing(null); form.setData({ name: '', email: '', role: 'finance', password: '' }); setModal(true); };
    const openEdit = (u: U) => { setEditing(u); form.setData({ name: u.name, email: u.email, role: u.role, password: '' }); setModal(true); };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModal(false); form.reset(); setEditing(null); };
        editing
            ? form.put(`/admin/usuarios/${editing.id}`, { onSuccess: done })
            : form.post('/admin/usuarios', { onSuccess: done });
    };

    return (
        <AdminLayout
            title="Usuários"
            subtitle="Quem acessa o painel e o que cada um pode ver"
            headerAction={<Button onClick={openNew}><Plus className="h-4 w-4" /> Novo usuário</Button>}
        >
            <Head title="Usuários — Admin KayTech" />

            <Panel className="p-0">
                <div className="overflow-x-auto">
                    <table className="ui-table">
                        <thead>
                            <tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Criado</th><th></th></tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="font-medium ui-t">
                                        {u.name}{u.id === currentUserId && <span className="ml-2 text-[11px] ui-t-faint">(você)</span>}
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <Badge tone={u.role === 'admin' ? 'default' : 'pos'}>
                                            {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                                            {ROLE_LABEL[u.role] ?? u.role}
                                        </Badge>
                                    </td>
                                    <td className="ui-t-faint">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div className="flex justify-end gap-1.5">
                                            <button onClick={() => openEdit(u)} className="rounded-md border ui-b p-1.5 ui-t-soft hover:ui-subtle">
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            {u.id !== currentUserId && (
                                                <button onClick={() => { if (confirm(`Remover ${u.name}?`)) router.delete(`/admin/usuarios/${u.id}`); }}
                                                        className="rounded-md border ui-b p-1.5 ui-neg hover:ui-subtle">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar usuário' : 'Novo usuário'}>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nome"><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="E-mail"><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <Field label="Papel">
                        <Select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                            <option value="finance">Finanças (só o painel financeiro)</option>
                            <option value="admin">Administrador (acesso total)</option>
                        </Select>
                    </Field>
                    <Field label={editing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}>
                        <Input type="password" minLength={8} required={!editing}
                               value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    </Field>
                    <Button type="submit" disabled={form.processing} className="w-full justify-center py-2.5">
                        {editing ? 'Salvar' : 'Criar usuário'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
