import React from 'react';
import { Head } from '@inertiajs/react';
import { LinkItem, LinkPageSetting } from '../Types';
import { LinkList } from '../Components/Links/LinkList';

interface BrunoKayProps {
    links: LinkItem[];
    settings: LinkPageSetting;
}

export default function BrunoKay({ links, settings }: BrunoKayProps) {
    const backgroundStyle: React.CSSProperties = settings.background_image
        ? {
              backgroundImage: `url(${settings.background_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : { backgroundColor: settings.background_color || '#050505' };

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center px-6 py-16 text-white" style={backgroundStyle}>
            <Head title={`${settings.display_name || 'Bruno Kay'} — Perfil`} />

            {settings.background_image && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            )}

            <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">
                <a href="/" className="text-xs font-mono text-white/50 hover:text-white transition">
                    ← kaytech.com
                </a>

                <div className="flex flex-col items-center space-y-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 bg-black/40 flex items-center justify-center">
                        <img
                            src={settings.profile_image || '/images/founder/bruno.jpg'}
                            alt={settings.display_name || 'Bruno Kay'}
                            className="w-full h-full object-cover object-top"
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            {settings.display_name || 'Bruno Kay'}
                        </h1>
                        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
                            Fundador da KayTech Solutions
                        </p>
                        {settings.bio && (
                            <p className="text-sm text-white/60 max-w-sm pt-2">{settings.bio}</p>
                        )}
                    </div>
                </div>

                <LinkList links={links} />
            </div>
        </div>
    );
}
