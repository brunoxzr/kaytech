import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { ImageUpload } from '../../Components/Admin/ImageUpload';
import { GalleryUpload } from '../../Components/Admin/GalleryUpload';

interface ProjectAdminProps {
    projects: any[];
}

export default function AdminProjects({ projects }: ProjectAdminProps) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [translating, setTranslating] = useState<boolean>(false);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        cover: '',
        gallery: [] as string[],
        technologies: ['Laravel', 'PostgreSQL', 'React'],
        project_url: '',
        featured: true,
        show_on_bruno_profile: false,
        order: 1,
        translations: {
            'pt-BR': { title: '', category: '', summary: '', challenge: '', solution: '' },
            'en': { title: '', category: '', summary: '', challenge: '', solution: '' },
            'es': { title: '', category: '', summary: '', challenge: '', solution: '' },
        },
    });

    const handleGenerateTranslations = async () => {
        const pt = data.translations['pt-BR'];
        if (!pt.title || !pt.summary) {
            alert('Por favor, preencha pelo menos o Título e o Resumo em Português antes de gerar traduções.');
            return;
        }

        setTranslating(true);
        try {
            const translateField = async (text: string, targetLocale: string) => {
                if (!text) return '';
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '' },
                    body: JSON.stringify({ text, source_locale: 'pt-BR', target_locale: targetLocale }),
                });
                const json = await res.json();
                return json.translatedText || text;
            };

            const [enTitle, enCategory, enSummary, esTitle, esCategory, esSummary] = await Promise.all([
                translateField(pt.title, 'en'),
                translateField(pt.category, 'en'),
                translateField(pt.summary, 'en'),
                translateField(pt.title, 'es'),
                translateField(pt.category, 'es'),
                translateField(pt.summary, 'es'),
            ]);

            setData('translations', {
                ...data.translations,
                'en': {
                    ...data.translations['en'],
                    title: enTitle,
                    category: enCategory,
                    summary: enSummary,
                },
                'es': {
                    ...data.translations['es'],
                    title: esTitle,
                    category: esCategory,
                    summary: esSummary,
                },
            });
            alert('Traduções para Inglês e Espanhol geradas! Por favor, revise os campos antes de salvar.');
        } catch (e) {
            alert('Erro ao conectar com o serviço de tradução.');
        } finally {
            setTranslating(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            put(`/admin/projetos/${editingProject.id}`, {
                onSuccess: () => { setModalOpen(false); reset(); setEditingProject(null); },
            });
        } else {
            post('/admin/projetos', {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        }
    };

    return (
        <AdminLayout
            title="Projetos & Cases"
            subtitle="Cadastre, edite e traduza os cases exibidos no site"
            headerAction={
                <button
                    onClick={() => { reset(); setEditingProject(null); setModalOpen(true); }}
                    className="ui-btn ui-btn-primary ui-t font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Projeto</span>
                </button>
            }
        >
            <Head title="Gerenciamento de Projetos — Admin KayTech" />

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((p) => {
                    const pt = p.translations?.['pt-BR'] || {};
                    return (
                        <div key={p.id} className="ui-surface border ui-b rounded-xl p-6 space-y-4">
                            <img src={p.cover} alt={pt.title} className="w-full h-40 object-cover rounded-xl bg-black" />
                            <h3 className="text-xl font-medium ui-t">{pt.title || 'Sem título'}</h3>
                            <p className="text-xs ui-t-soft line-clamp-2">{pt.summary}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t ui-b">
                                <span className="text-[10px]  ui-t-soft">Order: {p.order}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingProject(p);
                                            setData({
                                                cover: p.cover,
                                                gallery: p.gallery || [],
                                                technologies: p.technologies || [],
                                                project_url: p.project_url || '',
                                                featured: p.featured,
                                                show_on_bruno_profile: p.show_on_bruno_profile || false,
                                                order: p.order,
                                                translations: p.translations || data.translations,
                                            });
                                            setModalOpen(true);
                                        }}
                                        className="p-2 ui-subtle hover:ui-subtle ui-t rounded-lg"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Excluir este projeto?')) destroy(`/admin/projetos/${p.id}`); }}
                                        className="p-2 ui-subtle hover:bg-red-500/20 ui-neg rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="ui-surface border ui-b rounded-xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6">
                        <div className="flex items-center justify-between border-b ui-b pb-4">
                            <h2 className="text-xl font-medium ui-t">
                                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="ui-t-soft hover:ui-t ">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload
                                    label="Capa"
                                    value={data.cover}
                                    onChange={(path) => setData('cover', path)}
                                    folder="projects"
                                    required
                                />
                                <div>
                                    <label className="block text-xs  uppercase ui-t-soft mb-1">URL do Projeto</label>
                                    <input
                                        type="text"
                                        value={data.project_url}
                                        onChange={(e) => setData('project_url', e.target.value)}
                                        className="w-full ui-subtle border ui-b rounded-xl px-4 py-2 text-xs ui-t"
                                    />
                                </div>
                            </div>

                            <GalleryUpload
                                label="Galeria (várias telas do projeto)"
                                value={data.gallery}
                                onChange={(paths) => setData('gallery', paths)}
                                folder="projects"
                            />

                            {/* Portuguese Section */}
                            <div className="space-y-4 p-4 rounded-xl ui-surface border ui-b">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium ui-t-soft uppercase ">Conteúdo em Português (pt-BR)</span>
                                    <button
                                        type="button"
                                        onClick={handleGenerateTranslations}
                                        disabled={translating}
                                        className="px-3 py-1 border ui-b ui-t-soft hover:ui-t rounded-lg text-xs  transition flex items-center gap-1.5"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>{translating ? 'Gerando traduções...' : 'Gerar traduções (EN / ES)'}</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Título (pt-BR)"
                                        value={data.translations['pt-BR']?.title || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'pt-BR': { ...data.translations['pt-BR'], title: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Categoria (pt-BR)"
                                        value={data.translations['pt-BR']?.category || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'pt-BR': { ...data.translations['pt-BR'], category: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                </div>
                                <textarea
                                    placeholder="Resumo (pt-BR)"
                                    rows={2}
                                    value={data.translations['pt-BR']?.summary || ''}
                                    onChange={(e) => setData('translations', {
                                        ...data.translations,
                                        'pt-BR': { ...data.translations['pt-BR'], summary: e.target.value }
                                    })}
                                    className="w-full ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                />
                            </div>

                            {/* English Section */}
                            <div className="space-y-3 p-4 rounded-xl ui-surface border ui-b">
                                <span className="text-xs font-medium ui-t-soft uppercase ">English (en)</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Title (en)"
                                        value={data.translations['en']?.title || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'en': { ...data.translations['en'], title: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Category (en)"
                                        value={data.translations['en']?.category || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'en': { ...data.translations['en'], category: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                </div>
                                <textarea
                                    placeholder="Summary (en)"
                                    rows={2}
                                    value={data.translations['en']?.summary || ''}
                                    onChange={(e) => setData('translations', {
                                        ...data.translations,
                                        'en': { ...data.translations['en'], summary: e.target.value }
                                    })}
                                    className="w-full ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                />
                            </div>

                            {/* Spanish Section */}
                            <div className="space-y-3 p-4 rounded-xl ui-surface border ui-b">
                                <span className="text-xs font-medium ui-t-soft uppercase ">Español (es)</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Título (es)"
                                        value={data.translations['es']?.title || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'es': { ...data.translations['es'], title: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Categoría (es)"
                                        value={data.translations['es']?.category || ''}
                                        onChange={(e) => setData('translations', {
                                            ...data.translations,
                                            'es': { ...data.translations['es'], category: e.target.value }
                                        })}
                                        className="ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                    />
                                </div>
                                <textarea
                                    placeholder="Resumen (es)"
                                    rows={2}
                                    value={data.translations['es']?.summary || ''}
                                    onChange={(e) => setData('translations', {
                                        ...data.translations,
                                        'es': { ...data.translations['es'], summary: e.target.value }
                                    })}
                                    className="w-full ui-subtle border ui-b rounded-xl px-3 py-2 text-xs ui-t"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs ui-t-soft">
                                <input
                                    type="checkbox"
                                    checked={data.show_on_bruno_profile}
                                    onChange={(e) => setData('show_on_bruno_profile', e.target.checked)}
                                    className="accent-[var(--ui-text)]"
                                />
                                Exibir também no perfil pessoal (/brunokay)
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full ui-btn ui-btn-primary font-medium py-3.5 rounded-xl transition  text-xs uppercase "
                            >
                                Salvar Projeto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
