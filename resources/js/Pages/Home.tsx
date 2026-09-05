import React from 'react';
import { motion } from 'framer-motion';
import { TrustedCompany, Project, Service, SiteSetting, KaytechProduct } from '../Types';
import { SeoHead } from '../Components/UI/SeoHead';
import { Navbar } from '../Components/Layout/Navbar';
import { TypographicHero } from '../Components/Hero/TypographicHero';
import { TrustedCompaniesMarquee } from '../Components/UI/TrustedCompaniesMarquee';
import { Footer } from '../Components/Layout/Footer';
import { SectionHeading, OrbitLines, ArrowCircle, Chip, rise } from '../Components/Editorial/primitives';
import { useTranslation } from '../i18n';

interface HomeProps {
    trustedCompanies: TrustedCompany[];
    projects: Project[];
    services: Service[];
    products: KaytechProduct[];
    siteSettings: SiteSetting;
}

const Section: React.FC<{ id?: string; orbit?: 'left' | 'right' | null; children: React.ReactNode }> = ({
    id, orbit = null, children,
}) => (
    <section id={id} className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
        {orbit && <OrbitLines side={orbit} />}
        {children}
    </section>
);


export default function Home({ trustedCompanies, projects, services, products, siteSettings }: HomeProps) {
    const { t } = useTranslation();
    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const [showAllProjects, setShowAllProjects] = React.useState(false);
    // `projects` já vem ordenado por `order` (asc) do controller → [0] é o primeiro cadastrado.
    const visibleProjects = showAllProjects ? projects : projects.slice(0, 1);

    const diagnosis = [
        ['Tarefas manuais', 'Processos repetitivos que poderiam virar sistema, automação ou painel.'],
        ['Dados espalhados', 'Planilhas, conversas e arquivos soltos dificultando decisões rápidas.'],
        ['Fluxo sem padrão', 'Cada pessoa executa de um jeito e o negócio perde previsibilidade.'],
        ['Decisão no escuro', 'Sem dashboards, fica difícil enxergar desempenho, gargalos e oportunidades.'],
    ];

    const steps = [
        ['Diagnóstico', 'Entendemos o cenário, o processo e as ferramentas para achar onde está o gargalo.'],
        ['Proposta', 'O problema vira escopo claro, com fases e prioridades.'],
        ['Desenvolvimento', 'Construção com entregas visíveis, responsividade e foco no uso real.'],
        ['Evolução', 'Melhorias contínuas, suporte e ajustes conforme o negócio roda.'],
    ];

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white antialiased">
            <SeoHead />
            <Navbar visible />

            <main>
                <TypographicHero />

                <TrustedCompaniesMarquee companies={trustedCompanies} />

                {/* ---------- SOBRE ---------- */}
                <Section id="sobre" orbit="left">
                    <SectionHeading n="00" title="Sobre a KayTech" />
                    <div className="mt-6 grid gap-10 sm:grid-cols-12">
                        <p className="text-xl leading-relaxed text-white/75 sm:col-span-7">
                            Software sob medida para <span className="say">operações reais</span> — dos cadastros ao
                            dashboard. Menos achismo, menos trabalho manual, mais previsibilidade.
                        </p>
                        <div className="space-y-5 text-sm sm:col-span-5">
                            <div>
                                <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Stack</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Laravel', 'PHP', 'React', 'TypeScript', 'PostgreSQL', 'Python', 'Docker'].map((x) => <Chip key={x}>{x}</Chip>)}
                                </div>
                            </div>
                            <div>
                                <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Entregáveis</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Sistemas web', 'Dashboards', 'Automações', 'Integrações API'].map((x) => <Chip key={x}>{x}</Chip>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ---------- DIAGNÓSTICO ---------- */}
                <Section id="diagnostico" orbit="right">
                    <SectionHeading n="01" title="Diagnóstico" />
                    <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/60">
                        Quando o operacional vira gargalo, a empresa <span className="say">para de escalar</span>.
                        Antes de escrever código, a gente entende o fluxo real.
                    </p>
                    <div className="border-t border-white/10">
                        {diagnosis.map(([title, desc], i) => (
                            <motion.div key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                                variants={rise} transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 gap-1 border-b border-white/10 py-5 sm:grid-cols-12 sm:gap-6">
                                <span className="font-mono text-sm text-white/30 sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                                <span className="font-mono text-sm font-medium text-white sm:col-span-4">{title}</span>
                                <span className="text-sm text-white/50 sm:col-span-7">{desc}</span>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* ---------- SERVIÇOS ---------- */}
                {services.length > 0 && (
                    <Section id="servicos" orbit="left">
                        <SectionHeading n="02" title="O que fazemos" />
                        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                            {services.map((s) => (
                                <motion.div key={s.id}
                                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                                    variants={rise} transition={{ duration: 0.4 }}
                                    className="border-t border-white/10 pt-4">
                                    <span className="font-mono text-xs text-white/30">{s.number}</span>
                                    <h3 className="mt-1 font-mono text-base font-medium text-white">{s.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-white/50">{s.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ---------- PROCESSO ---------- */}
                <Section id="processo" orbit="right">
                    <SectionHeading n="03" title="Como trabalhamos" />
                    <div className="border-t border-white/10">
                        {steps.map(([title, desc], i) => (
                            <motion.div key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                                variants={rise} transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 gap-1 border-b border-white/10 py-5 sm:grid-cols-12 sm:gap-6">
                                <span className="font-mono text-sm text-white/30 sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                                <span className="font-mono text-sm font-medium text-white sm:col-span-3">{title}</span>
                                <span className="text-sm text-white/50 sm:col-span-8">{desc}</span>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                {/* ---------- PROJETOS ---------- */}
                {projects.length > 0 && (
                    <Section id="projetos" orbit="left">
                        <SectionHeading n="04" title="Projetos" />
                        <div className="space-y-16">
                            {visibleProjects.map((p, i) => (
                                <motion.article key={p.slug}
                                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
                                    variants={rise} transition={{ duration: 0.5 }}
                                    className="group grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
                                    <a href={`/pt-BR/projetos/${p.slug}`}
                                       className={`relative sm:col-span-7 ${i % 2 ? 'sm:order-2' : ''}`}>
                                        <div className="aspect-16/10 w-full overflow-hidden border border-white/10 bg-black">
                                            <img src={p.cover} alt={p.title}
                                                 className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0" />
                                        </div>
                                        <ArrowCircle className="absolute bottom-3 right-3 bg-[#0d0d0d]/70 backdrop-blur" />
                                    </a>
                                    <div className={`space-y-3 sm:col-span-5 ${i % 2 ? 'sm:order-1' : ''}`}>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
                                            {String(i + 1).padStart(2, '0')} · {p.category}
                                        </span>
                                        <h3 className="font-mono text-2xl font-medium tracking-tight">{p.title}</h3>
                                        <p className="text-sm leading-relaxed text-white/55">{p.summary}</p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {p.technologies.slice(0, 5).map((x) => <Chip key={x}>{x}</Chip>)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 pt-2 text-sm">
                                            <a href={`/pt-BR/projetos/${p.slug}`}
                                               className="border-b border-white/30 pb-0.5 text-white/80 transition hover:border-white hover:text-white">
                                                Ver case →
                                            </a>
                                            {p.projectUrl && (
                                                <a href={p.projectUrl} target="_blank" rel="noopener noreferrer"
                                                   className="text-white/40 transition hover:text-white">Visitar sistema</a>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {projects.length > 1 && !showAllProjects && (
                            <button
                                onClick={() => setShowAllProjects(true)}
                                className="mt-14 flex items-center gap-3 border-b-2 border-white pb-1 font-mono text-sm font-semibold text-white"
                            >
                                Ver mais projetos
                                <span className="font-mono text-white/40">
                                    (+{projects.length - 1})
                                </span>
                            </button>
                        )}
                    </Section>
                )}

                {/* ---------- PRODUTOS ---------- */}
                {products.length > 0 && (
                    <Section id="produtos" orbit="right">
                        <SectionHeading n="05" title="Produtos próprios" />
                        <div className="grid gap-6 sm:grid-cols-2">
                            {products.map((prod) => (
                                <a key={prod.slug} href={`/produtos/${prod.slug}`}
                                   className="group flex items-start justify-between gap-4 border border-white/10 p-6 transition hover:border-white/30">
                                    <div>
                                        <h3 className="font-mono text-lg font-medium text-white">{prod.name}</h3>
                                        {prod.tagline && <p className="mt-1 text-sm text-white/50">{prod.tagline}</p>}
                                    </div>
                                    <ArrowCircle />
                                </a>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ---------- QUEM ESTÁ POR TRÁS ---------- */}
                <Section id="fundador" orbit="left">
                    <SectionHeading n="06" title="Quem está por trás" />
                    <div className="grid gap-10 sm:grid-cols-12 sm:items-start">
                        <div className="sm:col-span-4">
                            <div className="aspect-4/5 w-full overflow-hidden border border-white/10 bg-black">
                                <img src="/images/founder/bruno.jpg" alt="Bruno Yudi Kay"
                                     className="h-full w-full object-cover grayscale contrast-110" />
                            </div>
                        </div>
                        <div className="space-y-6 sm:col-span-8">
                            <div>
                                <h3 className="font-mono text-2xl font-extrabold tracking-tight text-white">Bruno Yudi Kay</h3>
                                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
                                    Fundador · Desenvolvedor full-stack
                                </p>
                            </div>
                            <p className="text-lg leading-relaxed text-white/70">
                                A KayTech é <span className="say">uma pessoa só na frente do código</span> — eu.
                                Faço full-stack há mais de 4 anos, com Laravel e React no dia a dia e Python para
                                projetos de IA e visão computacional. Cada projeto passa pela minha mão do banco ao deploy.
                            </p>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Back-end</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Laravel', 'PHP', 'PostgreSQL', 'Redis', 'Docker'].map((x) => <Chip key={x}>{x}</Chip>)}
                                    </div>
                                </div>
                                <div>
                                    <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Front-end & IA</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['React', 'TypeScript', 'Inertia', 'Python', 'OpenCV'].map((x) => <Chip key={x}>{x}</Chip>)}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-white/10 pt-5">
                                <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">Compromisso</span>
                                <p className="text-sm leading-relaxed text-white/55">
                                    Falo direto com você — sem intermediário, sem terceirizar. Entregas visíveis a cada etapa,
                                    prazo combinado e suporte depois do lançamento. Se eu não puder fazer bem, eu digo.
                                </p>
                            </div>
                            <a href="/brunokay/portfolio"
                               className="inline-block border-b-2 border-white pb-1 font-mono text-sm font-medium text-white">
                                Ver meu portfólio completo →
                            </a>
                        </div>
                    </div>
                </Section>

                {/* ---------- CONTATO ---------- */}
                <Section id="contato" orbit="right">
                    <SectionHeading n="07" title="Vamos conversar" />
                    <h2 className="mt-6 max-w-2xl font-mono text-3xl font-extrabold leading-[1.05] tracking-tighter text-white sm:text-5xl">
                        Sua operação merece <span className="say font-normal">software de verdade</span>.
                    </h2>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/55">
                        Conta o desafio. Resposta inicial em até 24 horas.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-6 font-mono text-sm">
                        {siteSettings.whatsapp_url && (
                            <a href={siteSettings.whatsapp_url} target="_blank" rel="noopener noreferrer"
                               className="border-b-2 border-white pb-1 font-medium text-white">WhatsApp</a>
                        )}
                        {siteSettings.contact_email && (
                            <a href={`mailto:${siteSettings.contact_email}`}
                               className="border-b border-white/30 pb-1 text-white/70 transition hover:border-white hover:text-white">
                                {siteSettings.contact_email}
                            </a>
                        )}
                        <button onClick={() => scrollTo('inicio')} className="text-white/40 transition hover:text-white">
                            Voltar ao topo ↑
                        </button>
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
