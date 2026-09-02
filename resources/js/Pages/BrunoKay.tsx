import React from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { LinkItem, LinkPageSetting, CareerMilestone, Project, Achievement, Testimonial } from '../Types';
import { LinkList } from '../Components/Links/LinkList';
import { BrunoContact } from '../Components/Bruno/BrunoContact';
import { SectionHeading, OrbitLines, ArrowCircle, Chip } from '../Components/Editorial/primitives';
import { useSiteTheme } from '../Hooks/useSiteTheme';
import { ProspectBot } from '../Components/Chat/ProspectBot';

const LOCALES: { code: string; label: string }[] = [
    { code: 'pt-BR', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
];
const currentLocale = () =>
    (typeof document !== 'undefined' && document.cookie.match(/kaytech_locale=([^;]+)/)?.[1]) || 'pt-BR';
const setLocale = (code: string) => {
    document.cookie = `kaytech_locale=${code}; path=/; max-age=31536000`;
    window.location.reload();
};

interface BrunoKayProps {
    links: LinkItem[];
    settings: LinkPageSetting;
    milestones: CareerMilestone[];
    projects: Project[];
    achievements: Achievement[];
    testimonials: Testimonial[];
}

const rise = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function BrunoKay({ links, settings, milestones, projects, achievements, testimonials }: BrunoKayProps) {
    const { theme, toggle: toggleTheme } = useSiteTheme();
    const loc = currentLocale();
    const name = settings.display_name || 'Bruno Yudi Kay';
    const heroTitle = settings.hero_title || 'Full-stack';
    const heroTitle2 = 'Developer';
    const role = settings.role_tagline || 'Full-stack • IA • Visão Computacional';
    const photo = settings.profile_image || '/images/founder/bruno.jpg';

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const nav = [
        { label: 'Sobre', id: 'sobre' },
        { label: 'Trabalho', id: 'trabalho' },
        { label: 'Projetos', id: 'projetos' },
        { label: 'Contato', id: 'contato' },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0d0d0d] font-mono text-white antialiased">
            <Head title={`${name} — Full-stack Developer`} />

            {/* ---------- NAV — enxuta ---------- */}
            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0d0d0d]/85 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
                    <a href="/" className="font-mono text-[13px] font-semibold tracking-tight text-white">
                        bruno<span className="text-white/35">.kay</span>
                    </a>
                    <div className="flex items-center gap-6">
                        <nav className="hidden gap-7 sm:flex">
                            {nav.map((n) => (
                                <button key={n.id} onClick={() => scrollTo(n.id)}
                                        className="font-mono text-[13px] text-white/45 transition hover:text-white">
                                    {n.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                            {LOCALES.map((l) => (
                                <button key={l.code} onClick={() => setLocale(l.code)}
                                        className={`px-1 transition ${loc === l.code ? 'text-white' : 'text-white/35 hover:text-white'}`}>
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleTheme} aria-label="Alternar tema" className="text-white/45 transition hover:text-white">
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ---------- HERO ---------- */}
            <section className="relative overflow-hidden px-6 pt-36 pb-16 sm:pt-44">
                <OrbitLines side="right" />
                <div className="mx-auto max-w-5xl">
                    <motion.div initial="hidden" animate="visible" variants={rise} transition={{ duration: 0.7 }}>
                        <div className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
                            <span className="text-lg leading-none text-white/25">…</span>
                            <span>{name}</span>
                            <span className="h-px flex-1 bg-white/10" />
                            <span className="text-white/30">{role}</span>
                            <span className="text-lg leading-none text-white/25">…</span>
                        </div>

                        <div className="grid gap-10 sm:grid-cols-12 sm:items-end">
                            <div className="sm:col-span-7">
                                <h1 className="font-mono text-[2.75rem] font-extrabold leading-[0.9] tracking-tighter text-white sm:text-7xl lg:text-8xl">
                                    {heroTitle}
                                    <br />
                                    <span className="ml-[8%] inline-block">{heroTitle2}</span>
                                </h1>
                                <p className="mt-8 max-w-md text-lg leading-relaxed text-white/60">
                                    {settings.hero_description ? (
                                        <span dangerouslySetInnerHTML={{ __html: settings.hero_description }} />
                                    ) : (
                                        <>Construo sistemas web completos, do banco à interface — <span className="say">código que dura</span>.</>
                                    )}
                                </p>
                                <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-sm">
                                    <button onClick={() => scrollTo('contato')}
                                            className="border-b-2 border-white pb-1 font-semibold text-white">
                                        Entrar em contato
                                    </button>
                                    <button onClick={() => scrollTo('projetos')}
                                            className="text-white/45 transition hover:text-white">
                                        Ver projetos →
                                    </button>
                                </div>
                            </div>

                            {/* Foto — retrato grande P&B */}
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.15 }}
                                className="sm:col-span-5"
                            >
                                <div className="aspect-4/5 w-full overflow-hidden border border-white/10 bg-black">
                                    <img src={photo} alt={name}
                                         className="h-full w-full object-cover object-center grayscale contrast-110" />
                                </div>
                            </motion.div>
                        </div>

                        {(settings.stat_1_value || settings.stat_2_value || settings.stat_3_value) && (
                            <div className="mt-12 flex flex-wrap gap-x-12 gap-y-3 border-t border-white/10 pt-6 font-mono text-sm">
                                {[
                                    [settings.stat_1_value, settings.stat_1_label],
                                    [settings.stat_2_value, settings.stat_2_label],
                                    [settings.stat_3_value, settings.stat_3_label],
                                ].map(([v, l], i) => v && (
                                    <span key={i} className="text-white/40">
                                        <strong className="text-lg font-extrabold text-white">{v}</strong> {l}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ---------- SOBRE ---------- */}
            <section id="sobre" className="mx-auto max-w-5xl px-6 py-20">
                <SectionHeading n="01" title="Sobre" />
                <div className="mt-6 grid gap-10 sm:grid-cols-12">
                    <p className="text-lg leading-relaxed text-white/70 sm:col-span-7">
                        {settings.bio ||
                            `Olá, sou ${name}. Desenvolvedor full-stack com foco em Laravel, React e sistemas sob medida. Também trabalho com IA e visão computacional.`}
                    </p>
                    <div className="space-y-4 text-sm text-white/40 sm:col-span-5">
                        <div>
                            <span className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-white/25">Stack</span>
                            TypeScript / React / Laravel / PHP / PostgreSQL / Python / Docker
                        </div>
                        <div>
                            <span className="mb-1 block text-[11px] uppercase tracking-[0.2em] text-white/25">Foco</span>
                            {role}
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- TRABALHO (timeline achatada, estilo tabela da referência) ---------- */}
            {milestones.length > 0 && (
                <section id="trabalho" className="mx-auto max-w-5xl px-6 py-20">
                    <SectionHeading n="02" title="Trajetória" />
                    <div className="border-t border-white/10">
                        {milestones.map((m) => (
                            <motion.div
                                key={m.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={rise}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 gap-1 border-b border-white/10 py-5 sm:grid-cols-12 sm:gap-6"
                            >
                                <span className="text-sm text-white/35 sm:col-span-2">{m.year}</span>
                                <span className="text-sm font-semibold text-white sm:col-span-3">{m.title}</span>
                                <span className="text-sm text-white/45 sm:col-span-7">{m.description}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ---------- CERTIFICAÇÕES ---------- */}
            {achievements.length > 0 && (
                <section className="mx-auto max-w-5xl px-6 py-20">
                    <SectionHeading n="03" title="Certificações" />
                    <div className="mt-6 divide-y divide-white/10 border-t border-white/10">
                        {achievements.map((a) => (
                            <div key={a.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8">
                                <h3 className="text-sm font-semibold text-white sm:w-64 sm:shrink-0">{a.title}</h3>
                                <p className="text-sm leading-relaxed text-white/45">{a.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ---------- PROJETOS ---------- */}
            {projects.length > 0 && (
                <section id="projetos" className="mx-auto max-w-5xl px-6 py-20">
                    <SectionHeading n="04" title="Projetos" />
                    <div className="space-y-16">
                        {projects.map((p, i) => (
                            <motion.article
                                key={p.slug}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                                variants={rise}
                                transition={{ duration: 0.5 }}
                                className="group grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center"
                            >
                                <div className={`sm:col-span-7 ${i % 2 ? 'sm:order-2' : ''}`}>
                                    <div className="aspect-16/10 w-full overflow-hidden border border-white/10 bg-black">
                                        <img src={p.cover} alt={p.title}
                                             className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0" />
                                    </div>
                                </div>
                                <div className={`space-y-3 sm:col-span-5 ${i % 2 ? 'sm:order-1' : ''}`}>
                                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">
                                        {String(i + 1).padStart(2, '0')} · {p.category}
                                    </span>
                                    <h3 className="text-2xl font-medium tracking-tight">{p.title}</h3>
                                    <p className="text-sm leading-relaxed text-white/45">{p.summary}</p>
                                    <p className="text-[11px] text-white/30">{p.technologies.slice(0, 5).join(' / ')}</p>
                                    {p.projectUrl && (
                                        <a href={p.projectUrl} target="_blank" rel="noopener noreferrer"
                                           className="inline-block border-b border-white/25 pb-0.5 text-sm text-white/80 transition hover:border-white hover:text-white">
                                            Visitar sistema →
                                        </a>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>
            )}

            {/* ---------- DEPOIMENTOS ---------- */}
            {testimonials.length > 0 && (
                <section className="mx-auto max-w-5xl px-6 py-20">
                    <SectionHeading n="05" title="Depoimentos" />
                    <div className="mt-8 space-y-10">
                        {testimonials.map((t) => (
                            <blockquote key={t.id} className="border-l border-white/15 pl-6">
                                <p className="text-lg leading-relaxed text-white/75">"{t.quote}"</p>
                                <footer className="mt-3 flex items-center gap-3 text-sm text-white/40">
                                    {t.photo && <img src={t.photo} alt={t.author_name} className="h-8 w-8 rounded-full object-cover grayscale" />}
                                    <span><strong className="font-semibold text-white">{t.author_name}</strong> — {t.author_role}</span>
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </section>
            )}

            {/* ---------- CONTATO ---------- */}
            <BrunoContact settings={settings} />

            {/* ---------- LINKS ---------- */}
            {links.length > 0 && (
                <section className="mx-auto max-w-md px-6 py-20">
                    <div className="mb-6"><SectionHeading n="06" title="Redes" /></div>
                    <LinkList links={links} />
                </section>
            )}

            {/* ---------- FOOTER ---------- */}
            <footer className="border-t border-white/10 px-6 py-10">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-white/30">
                    <span className="font-medium text-white/60">{name}</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition hover:text-white">
                        Voltar ao topo ↑
                    </button>
                    <span>© {new Date().getFullYear()}</span>
                </div>
            </footer>

            <ProspectBot />
        </div>
    );
}
