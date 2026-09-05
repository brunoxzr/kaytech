import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MapPin, Phone, AtSign, Globe, Download, UserPlus, Loader2, ExternalLink } from 'lucide-react';
import { AdminLayout } from '../../Components/Admin/AdminLayout';
import { Panel, Button, Field, Input, Select, Badge } from '../../Components/Admin/ui';

interface Lead {
    nome: string; telefone: string; whatsapp: string; endereco: string;
    instagram: string; facebook: string; site: string;
    tem_site: 'sim' | 'rede_social' | 'nao';
    avaliacoes: number; nota: number | null; categoria: string;
    maps_url: string; resumo: string;
}
interface Source { title: string | null; uri: string }
interface Props { niches: string[]; existingNames: string[]; states: string[] }

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
const onlyDigits = (s: string) => s.replace(/\D/g, '');
const waLink = (n: string) => `https://wa.me/${onlyDigits(n).length <= 11 ? '55' : ''}${onlyDigits(n)}`;

const SITE_BADGE: Record<Lead['tem_site'], { label: string; tone: 'pos' | 'neg' | 'default' }> = {
    nao: { label: 'sem site', tone: 'pos' },
    rede_social: { label: 'só rede social', tone: 'default' },
    sim: { label: 'tem site', tone: 'neg' },
};

export default function Prospector({ niches, existingNames, states }: Props) {
    const known = React.useMemo(() => new Set(existingNames), [existingNames]);
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [niche, setNiche] = React.useState(niches[0] ?? '');
    const [limit, setLimit] = React.useState(15);
    const [loading, setLoading] = React.useState(false);
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [sources, setSources] = React.useState<Source[]>([]);
    const [note, setNote] = React.useState<string | null>(null);
    const [onlyNoSite, setOnlyNoSite] = React.useState(true);
    const [minReviews, setMinReviews] = React.useState(10);
    const [saved, setSaved] = React.useState<Set<string>>(new Set());

    const run = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!city.trim() && !state) || loading) return;
        setLoading(true);
        setNote(null);
        try {
            const res = await fetch('/admin/prospeccao/buscar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ city, state, niche, limit }),
            });
            const data = await res.json();
            setLeads(data.leads ?? []);
            setSources(data.sources ?? []);
            setNote(data.note ?? null);
            setSaved(new Set());
        } catch {
            setNote('Falha de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const shown = leads.filter((l) =>
        (!onlyNoSite || l.tem_site !== 'sim') &&
        (minReviews === 0 || (l.avaliacoes ?? 0) >= minReviews),
    );

    const saveClient = (l: Lead) => {
        router.post('/admin/prospeccao/salvar', { ...l, niche, city: city || state }, {
            preserveScroll: true,
            onSuccess: () => setSaved((s) => new Set(s).add(l.nome)),
        });
    };

    const exportCsv = () => {
        const head = ['Nome', 'Categoria', 'Telefone', 'Endereço', 'Instagram', 'Site', 'Situação', 'Avaliações', 'Nota', 'Maps'];
        const rows = shown.map((l) => [
            l.nome, l.categoria, l.telefone, l.endereco, l.instagram, l.site,
            SITE_BADGE[l.tem_site].label, l.avaliacoes, l.nota ?? '', l.maps_url,
        ]);
        const csvBody = [head, ...rows]
            .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const url = URL.createObjectURL(new Blob(['﻿' + csvBody], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${niche}-${city || state}.csv`.toLowerCase().replace(/\s+/g, '-');
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout title="Prospecção" subtitle="Encontre empresas do nicho por cidade ou estado inteiro — foco em quem não tem site">
            <Head title="Prospecção — Admin KayTech" />

            <Panel>
                <form onSubmit={run} className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                    <Field label="Cidade" className="sm:col-span-3">
                        <Input placeholder="Londrina (vazio = estado todo)" value={city} onChange={(e) => setCity(e.target.value)} />
                    </Field>
                    <Field label="Estado" className="sm:col-span-2">
                        <Select value={state} onChange={(e) => setState(e.target.value)}>
                            <option value="">—</option>
                            {states.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>
                    <Field label="Nicho" className="sm:col-span-3">
                        <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                            {niches.map((n) => <option key={n} value={n}>{n}</option>)}
                            <option value={niche && !niches.includes(niche) ? niche : '__custom'}>Outro…</option>
                        </Select>
                    </Field>
                    <Field label="Máx." className="sm:col-span-2">
                        <Select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                            {[10, 15, 20, 25, 40, 60].map((n) => <option key={n} value={n}>{n}</option>)}
                        </Select>
                    </Field>
                    <div className="sm:col-span-2">
                        <Button type="submit" disabled={loading} className="w-full justify-center py-2.5">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Buscar</>}
                        </Button>
                    </div>
                </form>
                {niche === '__custom' && (
                    <Input className="mt-3" autoFocus placeholder="Digite o nicho" onChange={(e) => setNiche(e.target.value)} />
                )}
                <p className="mt-3 text-[12px] ui-t-faint">
                    Dados reais do Google Maps (via Apify). Ordenados por: sem site primeiro, depois mais avaliados.
                </p>
            </Panel>

            {loading && (
                <Panel><p className="py-8 text-center text-[13px] ui-t-faint">Buscando no Google Maps… (pode levar 1-2 min)</p></Panel>
            )}

            {!loading && note && (
                <Panel><p className="py-6 text-center text-[13px] ui-t-faint">{note}</p></Panel>
            )}

            {!loading && leads.length > 0 && (
                <>
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-[13px] ui-t-soft">
                            <input type="checkbox" checked={onlyNoSite} onChange={(e) => setOnlyNoSite(e.target.checked)}
                                   className="rounded ui-b-strong ui-subtle" />
                            Esconder quem já tem site
                        </label>
                        <label className="flex items-center gap-2 text-[13px] ui-t-soft">
                            Mín. avaliações
                            <select value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))}
                                    className="rounded-lg border ui-b-strong bg-transparent px-2 py-1 text-[12px]">
                                {[0, 5, 10, 20, 50].map((n) => <option key={n} value={n}>{n === 0 ? 'todas' : n}</option>)}
                            </select>
                        </label>
                        <span className="text-[12px] ui-t-faint">{shown.length} de {leads.length}</span>
                        <Button variant="ghost" onClick={exportCsv} className="ml-auto"><Download className="h-4 w-4" /> CSV</Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {shown.map((l, i) => {
                            const b = SITE_BADGE[l.tem_site];
                            return (
                                <Panel key={i} className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[14px] font-semibold ui-t">{l.nome}</p>
                                            <p className="mt-0.5 text-[12px] ui-t-faint">
                                                {l.categoria}
                                                {(l.avaliacoes > 0 || l.nota) && (
                                                    <> · ★ {l.nota ?? '—'} ({l.avaliacoes} aval.)</>
                                                )}
                                            </p>
                                        </div>
                                        <Badge tone={b.tone}>{b.label}</Badge>
                                    </div>

                                    <div className="space-y-1 text-[12px] ui-t-soft">
                                        {l.endereco && <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 ui-t-faint" />{l.endereco}</p>}
                                        {l.telefone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 ui-t-faint" />{l.telefone}</p>}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {(l.whatsapp || l.telefone) && (
                                            <a href={waLink(l.whatsapp || l.telefone)} target="_blank" rel="noopener noreferrer"
                                               className="ui-badge hover:ui-subtle">WhatsApp</a>
                                        )}
                                        {l.instagram && (
                                            <a href={l.instagram} target="_blank" rel="noopener noreferrer" className="ui-badge hover:ui-subtle">
                                                <AtSign className="h-3 w-3" /> Instagram
                                            </a>
                                        )}
                                        {!l.instagram && (
                                            <a href={`https://www.google.com/search?q=${encodeURIComponent(l.nome + ' ' + city + ' instagram')}`}
                                               target="_blank" rel="noopener noreferrer" className="ui-badge hover:ui-subtle">
                                                <Search className="h-3 w-3" /> achar Instagram
                                            </a>
                                        )}
                                        {l.site && (
                                            <a href={l.site.startsWith('http') ? l.site : `https://${l.site}`} target="_blank" rel="noopener noreferrer"
                                               className="ui-badge hover:ui-subtle"><Globe className="h-3 w-3" /> site</a>
                                        )}
                                        <a href={l.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(l.nome + " " + city)}`}
                                           target="_blank" rel="noopener noreferrer" className="ui-badge hover:ui-subtle">
                                            <ExternalLink className="h-3 w-3" /> Maps
                                        </a>
                                    </div>

                                    <div className="mt-auto pt-1">
                                        {saved.has(l.nome) || known.has(l.nome.toLowerCase()) ? (
                                            <span className="text-[12px] ui-pos">✓ já no pipeline</span>
                                        ) : (
                                            <button onClick={() => saveClient(l)}
                                                    className="flex items-center gap-1.5 text-[12px] ui-t-soft hover:ui-t">
                                                <UserPlus className="h-3.5 w-3.5" /> Adicionar ao pipeline
                                            </button>
                                        )}
                                    </div>
                                </Panel>
                            );
                        })}
                    </div>

                    {sources.length > 0 && (
                        <Panel>
                            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide ui-t-faint">Fontes consultadas</p>
                            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                                {sources.slice(0, 12).map((s, i) => (
                                    <li key={i}>
                                        <a href={s.uri} target="_blank" rel="noopener noreferrer" className="ui-t-soft hover:ui-t">
                                            {s.title || s.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    )}
                </>
            )}
        </AdminLayout>
    );
}
