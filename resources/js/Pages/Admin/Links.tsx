import React, { useMemo, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit3, GripVertical, ExternalLink, Eye } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ImageUpload } from '../../Components/Admin/ImageUpload';
import { LinkPageView } from '../../Components/Links/LinkPageView';
import { LinkItem, LinkGroup, LinkPageSetting } from '../../Types';

interface AdminLinksProps {
    links: LinkItem[];
    settings: Record<LinkGroup, LinkPageSetting>;
}

const GROUPS: { value: LinkGroup; label: string; url: string }[] = [
    { value: 'kaytech', label: 'KayTech', url: '/links' },
    { value: 'brunokay', label: 'Bruno Kay', url: '/brunokay' },
];

export default function AdminLinks({ links, settings }: AdminLinksProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [activeGroup, setActiveGroup] = useState<LinkGroup>('brunokay');
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);

    const activeSettings = settings[activeGroup];

    const {
        data: sd,
        setData: setSd,
        put: putSettings,
        processing: savingSettings,
        isDirty: settingsDirty,
    } = useForm({
        background_color: activeSettings.background_color || '#0d0d0d',
        background_image: activeSettings.background_image || '',
        background_blur: activeSettings.background_blur ?? 28,
        background_dim: activeSettings.background_dim ?? 70,
        profile_image: activeSettings.profile_image || '',
        display_name: activeSettings.display_name || '',
        bio: activeSettings.bio || '',
    });

    const switchGroup = (group: LinkGroup) => {
        setActiveGroup(group);
        const s = settings[group];
        setSd({
            background_color: s.background_color || '#0d0d0d',
            background_image: s.background_image || '',
            background_blur: s.background_blur ?? 28,
            background_dim: s.background_dim ?? 70,
            profile_image: s.profile_image || '',
            display_name: s.display_name || '',
            bio: s.bio || '',
        });
    };

    const saveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        putSettings(`/admin/links/settings/${activeGroup}`, { preserveScroll: true });
    };

    const { data, setData, post, put, delete: destroy, reset } = useForm({
        group: activeGroup as LinkGroup,
        title: '',
        url: '',
        icon_name: '',
        order: 1,
        active: true as boolean,
    });

    const filteredLinks = useMemo(
        () => links.filter((l) => l.group === activeGroup).sort((a, b) => a.order - b.order),
        [links, activeGroup],
    );

    const openNew = () => {
        reset();
        setData({ group: activeGroup, title: '', url: '', icon_name: '', order: filteredLinks.length + 1, active: true });
        setEditingLink(null);
        setModalOpen(true);
    };

    const openEdit = (link: LinkItem) => {
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
    };

    const saveLink = (e: React.FormEvent) => {
        e.preventDefault();
        const done = () => { setModalOpen(false); reset(); setEditingLink(null); };
        if (editingLink) put(`/admin/links/${editingLink.id}`, { onSuccess: done, preserveScroll: true });
        else post('/admin/links', { onSuccess: done, preserveScroll: true });
    };

    const toggleActive = (link: LinkItem) => {
        router.put(
            `/admin/links/${link.id}`,
            {
                group: link.group,
                title: link.title,
                url: link.url,
                icon_name: link.icon_name || '',
                order: link.order,
                active: !link.active,
            },
            { preserveScroll: true },
        );
    };

    // objeto para o preview (mescla settings salvos com o rascunho do form)
    const previewSettings: LinkPageSetting = {
        ...activeSettings,
        background_color: sd.background_color,
        background_image: sd.background_image || null,
        background_blur: sd.background_blur,
        background_dim: sd.background_dim,
        profile_image: sd.profile_image || null,
        display_name: sd.display_name,
        bio: sd.bio,
    };
    const previewLinks = filteredLinks.filter((l) => l.active);

    const currentUrl = GROUPS.find((g) => g.value === activeGroup)!.url;

    return (
        <AdminLayout
            title="Linktree"
            subtitle="Monte a página de links. O preview ao lado atualiza em tempo real."
            headerAction={
                <div className="flex items-center gap-2">
                    <a
                        href={currentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ui-btn ui-btn-ghost ui-t text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" /> Abrir página
                    </a>
                    <button onClick={openNew} className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo link
                    </button>
                </div>
            }
        >
            <Head title="Linktree — Admin KayTech" />

            {/* seletor de grupo */}
            <div className="flex items-center gap-2">
                {GROUPS.map((g) => (
                    <button
                        key={g.value}
                        onClick={() => switchGroup(g.value)}
                        className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition ${
                            activeGroup === g.value ? 'ui-btn-primary ui-t font-semibold' : 'ui-subtle ui-t-soft hover:ui-t'
                        }`}
                    >
                        {g.label}
                    </button>
                ))}
                <button
                    onClick={() => setShowPreviewMobile((v) => !v)}
                    className="ml-auto lg:hidden ui-subtle ui-t-soft text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                    <Eye className="w-3.5 h-3.5" /> {showPreviewMobile ? 'Ocultar' : 'Ver'} preview
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                {/* ---------- COLUNA ESQUERDA: edição ---------- */}
                <div className="space-y-6 min-w-0">
                    {/* Perfil */}
                    <section className="ui-surface border ui-b rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-semibold ui-t">Perfil</h2>
                        <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-start">
                            <div className="w-28">
                                <ImageUpload
                                    label="Foto"
                                    value={sd.profile_image}
                                    onChange={(p) => setSd('profile_image', p)}
                                    folder="links"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase ui-t-soft mb-1">Nome de exibição</label>
                                    <input
                                        type="text"
                                        value={sd.display_name}
                                        onChange={(e) => setSd('display_name', e.target.value)}
                                        placeholder="Bruno Yudi Kay"
                                        className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-sm ui-t"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase ui-t-soft mb-1">
                                        {activeGroup === 'brunokay' ? 'Sobre mim' : 'Bio'}
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={sd.bio}
                                        onChange={(e) => setSd('bio', e.target.value)}
                                        placeholder="Uma frase curta sobre você ou a marca."
                                        className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-sm ui-t resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fundo */}
                    <section className="ui-surface border ui-b rounded-2xl p-6 space-y-5">
                        <h2 className="text-sm font-semibold ui-t">Fundo</h2>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <ImageUpload
                                label="Imagem de fundo (opcional)"
                                value={sd.background_image}
                                onChange={(p) => setSd('background_image', p)}
                                folder="links"
                            />
                            <div>
                                <label className="block text-xs uppercase ui-t-soft mb-1">Cor do tema</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={/^#[0-9a-f]{6}$/i.test(sd.background_color) ? sd.background_color : '#0d0d0d'}
                                        onChange={(e) => setSd('background_color', e.target.value)}
                                        className="w-10 h-10 bg-transparent border ui-b rounded-lg cursor-pointer shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={sd.background_color}
                                        onChange={(e) => setSd('background_color', e.target.value)}
                                        className="flex-1 ui-subtle border ui-b rounded-xl px-4 py-2.5 text-sm ui-t"
                                    />
                                </div>
                                <p className="text-[11px] ui-t-faint mt-1.5">
                                    Tinge a imagem e é a cor sólida quando não há imagem.
                                </p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="flex justify-between text-xs uppercase ui-t-soft mb-2">
                                    <span>Desfoque</span>
                                    <span className="ui-t-faint normal-case">{sd.background_blur}px</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={60}
                                    value={sd.background_blur}
                                    onChange={(e) => setSd('background_blur', Number(e.target.value))}
                                    disabled={!sd.background_image}
                                    className="w-full accent-[var(--ui-text)] disabled:opacity-40"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-xs uppercase ui-t-soft mb-2">
                                    <span>Escurecer</span>
                                    <span className="ui-t-faint normal-case">{sd.background_dim}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={sd.background_dim}
                                    onChange={(e) => setSd('background_dim', Number(e.target.value))}
                                    disabled={!sd.background_image}
                                    className="w-full accent-[var(--ui-text)] disabled:opacity-40"
                                />
                            </div>
                        </div>

                        <form onSubmit={saveSettings}>
                            <button
                                type="submit"
                                disabled={savingSettings || !settingsDirty}
                                className="ui-btn ui-btn-primary disabled:opacity-40 ui-t font-semibold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider"
                            >
                                {settingsDirty ? 'Salvar aparência' : 'Tudo salvo'}
                            </button>
                        </form>
                    </section>

                    {/* Links */}
                    <section className="ui-surface border ui-b rounded-2xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold ui-t">Links ({filteredLinks.length})</h2>
                            <button onClick={openNew} className="text-xs ui-t-soft hover:ui-t flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> adicionar
                            </button>
                        </div>

                        {filteredLinks.length === 0 && (
                            <p className="text-sm ui-t-faint py-6 text-center">
                                Nenhum link ainda. Clique em “Novo link”.
                            </p>
                        )}

                        {filteredLinks.map((link) => (
                            <div key={link.id} className="ui-subtle border ui-b rounded-xl p-4 flex items-center gap-3">
                                <GripVertical className="w-4 h-4 ui-t-faint shrink-0" />
                                <span className="text-xs ui-t-faint shrink-0 w-6">{String(link.order).padStart(2, '0')}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium ui-t truncate text-sm">{link.title}</div>
                                    <div className="text-xs ui-t-faint truncate">{link.url}</div>
                                </div>
                                <button
                                    onClick={() => toggleActive(link)}
                                    className={`text-[10px] px-2 py-1 rounded shrink-0 ${link.active ? 'ui-pos ui-subtle' : 'ui-t-faint ui-subtle'}`}
                                >
                                    {link.active ? 'ATIVO' : 'OFF'}
                                </button>
                                <button onClick={() => openEdit(link)} className="p-2 ui-subtle hover:ui-t ui-t-soft rounded-lg shrink-0">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { if (confirm('Remover este link?')) destroy(`/admin/links/${link.id}`, { preserveScroll: true }); }}
                                    className="p-2 ui-subtle hover:bg-red-500/20 ui-neg rounded-lg shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </section>
                </div>

                {/* ---------- COLUNA DIREITA: preview ---------- */}
                <div className={`${showPreviewMobile ? 'block' : 'hidden'} lg:block lg:sticky lg:top-6`}>
                    <div className="ui-surface border ui-b rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs uppercase tracking-wider ui-t-soft">Preview</span>
                            <span className="text-[11px] ui-t-faint">{currentUrl}</span>
                        </div>
                        <div className="mx-auto w-[300px] rounded-[2rem] border-4 border-black bg-black overflow-hidden shadow-xl">
                            <div className="h-[560px] overflow-y-auto">
                                <LinkPageView settings={previewSettings} links={previewLinks} preview />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de link */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="ui-surface border ui-b rounded-2xl p-6 sm:p-8 max-w-md w-full">
                        <div className="flex items-center justify-between border-b ui-b pb-4 mb-5">
                            <h2 className="text-lg font-semibold ui-t">{editingLink ? 'Editar link' : 'Novo link'}</h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft hover:ui-t text-lg leading-none">✕</button>
                        </div>

                        <form onSubmit={saveLink} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase ui-t-soft mb-1">Título</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Instagram"
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-sm ui-t"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase ui-t-soft mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    placeholder="https://instagram.com/seu_user"
                                    className="w-full ui-subtle border ui-b rounded-xl px-4 py-2.5 text-sm ui-t"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs uppercase ui-t-soft mb-1">Ícone</label>
                                    <input
                                        type="text"
                                        value={data.icon_name}
                                        onChange={(e) => setData('icon_name', e.target.value)}
                                        placeholder="Instagram"
                                        className="w-full ui-subtle border ui-b rounded-xl px-3 py-2.5 text-sm ui-t"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase ui-t-soft mb-1">Ordem</label>
                                    <input
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        className="w-full ui-subtle border ui-b rounded-xl px-3 py-2.5 text-sm ui-t"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm ui-t-soft">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                    className="accent-[var(--ui-text)]"
                                />
                                Link ativo (visível na página)
                            </label>
                            <button type="submit" className="w-full ui-btn ui-btn-primary font-semibold py-3 rounded-xl text-xs uppercase tracking-wider">
                                {editingLink ? 'Salvar alterações' : 'Adicionar link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
