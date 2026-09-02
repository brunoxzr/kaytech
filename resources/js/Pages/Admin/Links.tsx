import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ImageUpload } from '../../Components/Admin/ImageUpload';
import { LinkItem, LinkGroup, LinkPageSetting } from '../../Types';

interface AdminLinksProps {
    links: LinkItem[];
    settings: Record<LinkGroup, LinkPageSetting>;
}

const GROUPS: { value: LinkGroup; label: string }[] = [
    { value: 'kaytech', label: 'KayTech' },
    { value: 'brunokay', label: 'Bruno Kay' },
];

export default function AdminLinks({ links, settings }: AdminLinksProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [activeGroup, setActiveGroup] = useState<LinkGroup>('kaytech');

    const activeSettings = settings[activeGroup];

    const {
        data: settingsData,
        setData: setSettingsData,
        put: putSettings,
        processing: savingSettings,
    } = useForm({
        background_color: activeSettings.background_color || '',
        background_image: activeSettings.background_image || '',
        profile_image: activeSettings.profile_image || '',
        display_name: activeSettings.display_name || '',
        bio: activeSettings.bio || '',
    });

    const switchGroup = (group: LinkGroup) => {
        setActiveGroup(group);
        const s = settings[group];
        setSettingsData({
            background_color: s.background_color || '',
            background_image: s.background_image || '',
            profile_image: s.profile_image || '',
            display_name: s.display_name || '',
            bio: s.bio || '',
        });
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        putSettings(`/admin/links/settings/${activeGroup}`);
    };

    const { data, setData, post, put, delete: destroy, reset } = useForm({
        group: 'kaytech' as LinkGroup,
        title: '',
        url: '',
        icon_name: '',
        order: 1,
        active: true as boolean,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLink) {
            put(`/admin/links/${editingLink.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingLink(null); }
            });
        } else {
            post('/admin/links', {
                onSuccess: () => { setModalOpen(false); reset(); }
            });
        }
    };

    const filteredLinks = links.filter((l) => l.group === activeGroup);

    return (
        <AdminLayout
            title="Linktree"
            subtitle="Gerencie os links exibidos em /links e /brunokay"
            headerAction={
                <button
                    onClick={() => { reset(); setData('group', activeGroup); setEditingLink(null); setModalOpen(true); }}
                    className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Link</span>
                </button>
            }
        >
            <Head title="Linktree — Admin KayTech" />

            <div className="flex items-center gap-2">
                {GROUPS.map((g) => (
                    <button
                        key={g.value}
                        onClick={() => switchGroup(g.value)}
                        className={`px-4 py-2 rounded-lg text-xs  uppercase tracking-wider transition ${
                            activeGroup === g.value ? ' ui-t font-medium' : 'ui-subtle ui-t-soft hover:ui-t'
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
            </div>

            <div className="ui-surface border ui-b rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-medium ui-t uppercase tracking-wider">Aparência da página</h2>
                <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs  uppercase ui-t-soft mb-1">Nome de Exibição</label>
                        <input
                            type="text"
                            value={settingsData.display_name}
                            onChange={(e) => setSettingsData('display_name', e.target.value)}
                            className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                        />
                    </div>
                    <div>
                        <label className="block text-xs  uppercase ui-t-soft mb-1">Cor de Fundo</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={settingsData.background_color || '#050505'}
                                onChange={(e) => setSettingsData('background_color', e.target.value)}
                                className="w-10 h-10 bg-transparent border ui-b rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                placeholder="#050505"
                                value={settingsData.background_color}
                                onChange={(e) => setSettingsData('background_color', e.target.value)}
                                className="flex-1 ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                            />
                        </div>
                    </div>
                    <ImageUpload
                        label="Imagem de Fundo (opcional)"
                        value={settingsData.background_image}
                        onChange={(path) => setSettingsData('background_image', path)}
                        folder="links"
                    />
                    <ImageUpload
                        label="Foto de Perfil"
                        value={settingsData.profile_image}
                        onChange={(path) => setSettingsData('profile_image', path)}
                        folder="links"
                    />
                    <div className="sm:col-span-2">
                        <label className="block text-xs  uppercase ui-t-soft mb-1">
                            {activeGroup === 'brunokay' ? 'Sobre mim' : 'Bio'}
                        </label>
                        <textarea
                            rows={5}
                            value={settingsData.bio}
                            onChange={(e) => setSettingsData('bio', e.target.value)}
                            placeholder={activeGroup === 'brunokay' ? 'Conte sobre você: experiência, o que faz, sua trajetória...' : undefined}
                            className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={savingSettings}
                            className="ui-btn ui-btn-primary disabled:opacity-50 ui-t font-medium py-2.5 px-6 rounded-xl transition text-xs uppercase "
                        >
                            Salvar Aparência
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-3">
                {filteredLinks.length === 0 && (
                    <p className="text-sm ui-t-faint">Nenhum link cadastrado neste grupo ainda.</p>
                )}
                {filteredLinks.map((link) => (
                    <div key={link.id} className="ui-surface border ui-b rounded-xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs  ui-t-faint shrink-0">{String(link.order).padStart(2, '0')}</span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium ui-t truncate">{link.title}</span>
                                    <span className={`text-[10px]  px-2 py-0.5 rounded shrink-0 ${link.active ? 'ui-subtle ui-pos' : 'ui-subtle ui-t-faint'}`}>
                                        {link.active ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                                <span className="text-xs ui-t-faint truncate block">{link.url}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => {
                                    setEditingLink(link);
                                    setData({
                                        group: link.group,
                                        title: link.title,
                                        url: link.url,
                                        icon_name: link.icon_name || '',
                                        order: link.order,
                                        active: link.active,
                                    });
                                    setModalOpen(true);
                                }}
                                className="p-2 ui-subtle hover:ui-subtle ui-t rounded-lg"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { if (confirm('Remover este link?')) destroy(`/admin/links/${link.id}`); }}
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
                                {editingLink ? 'Editar Link' : 'Novo Link'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft ">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Grupo</label>
                                <select
                                    value={data.group}
                                    onChange={(e) => setData('group', e.target.value as LinkGroup)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                >
                                    {GROUPS.map((g) => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
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
                                <label className="block text-xs  uppercase ui-t-soft mb-1">URL</label>
                                <input
                                    type="text"
                                    required
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-xs ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs  uppercase ui-t-soft mb-1">Ícone (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Globe, Mail, MessageCircle, Phone, Send, AtSign, Camera, Video, Music, Store, Briefcase"
                                    value={data.icon_name}
                                    onChange={(e) => setData('icon_name', e.target.value)}
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
                                Salvar Link
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
