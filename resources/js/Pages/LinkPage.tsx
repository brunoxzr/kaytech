import React from 'react';
import { Head } from '@inertiajs/react';
import { LinkItem, LinkPageSetting } from '../Types';
import { LinkList } from '../Components/Links/LinkList';

interface LinkPageProps {
    links: LinkItem[];
    settings: LinkPageSetting;
}

/** Converte #rrggbb -> "r, g, b" para usar em rgba(). */
function hexToRgb(hex?: string | null): string {
    const fallback = '5, 5, 5';
    if (!hex) return fallback;
    const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return fallback;
    return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
}

export default function LinkPage({ links, settings }: LinkPageProps) {
    const themeRgb = hexToRgb(settings.background_color);
    const hasImage = Boolean(settings.background_image);

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden text-white"
            style={{ backgroundColor: settings.background_color || '#050505' }}
        >
            <Head title={`${settings.display_name || 'KayTech'} — Links`} />

            {/* Fundo: imagem borrada + escurecida, tingida pela cor do tema */}
            {hasImage && (
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute inset-0 scale-110 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${settings.background_image})`,
                            filter: 'blur(28px) brightness(0.35) saturate(1.1)',
                        }}
                    />
                    {/* camada de cor do tema por cima da imagem */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(180deg, rgba(${themeRgb},0.55) 0%, rgba(${themeRgb},0.82) 55%, rgba(${themeRgb},0.96) 100%)`,
                        }}
                    />
                    {/* vinheta */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(120% 80% at 50% 0%, transparent 0%, rgba(0,0,0,0.35) 100%)',
                        }}
                    />
                </div>
            )}

            <div className="relative z-10 flex min-h-screen flex-col items-center px-6 py-16">
                <div className="flex w-full max-w-md flex-1 flex-col items-center">
                    <a
                        href="/"
                        className="mb-12 font-mono text-xs text-white/45 transition hover:text-white/90"
                    >
                        ← kaytech.com
                    </a>

                    <div className="flex flex-col items-center">
                        <div className="rounded-full p-0.5 ring-1 ring-white/15 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]">
                            <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black/40">
                                <img
                                    src={settings.profile_image || '/images/logo-kaytech.png'}
                                    alt={settings.display_name || 'KayTech'}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        <h1 className="mt-5 text-center font-mono text-lg font-semibold tracking-tight">
                            {settings.display_name || 'KayTech Solutions'}
                        </h1>

                        {settings.bio && (
                            <p className="mt-2 max-w-xs text-center text-[13px] font-light leading-relaxed text-white/60">
                                {settings.bio}
                            </p>
                        )}
                    </div>

                    <div className="mt-10 w-full">
                        <LinkList links={links} />
                    </div>
                </div>

                <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
                    KayTech
                </p>
            </div>
        </div>
    );
}
