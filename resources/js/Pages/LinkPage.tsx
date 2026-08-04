import React from 'react';
import { Head } from '@inertiajs/react';
import { LinkItem, LinkPageSetting } from '../Types';
import { LinkList } from '../Components/Links/LinkList';

interface LinkPageProps {
    links: LinkItem[];
    settings: LinkPageSetting;
}

export default function LinkPage({ links, settings }: LinkPageProps) {
    const backgroundStyle: React.CSSProperties = settings.background_image
        ? {
              backgroundImage: `url(${settings.background_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : { backgroundColor: settings.background_color || '#050505' };

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center px-6 py-16 text-white" style={backgroundStyle}>
            <Head title="Links — KayTech Solutions" />

            {settings.background_image && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            )}

            <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">
                <a href="/" className="text-xs font-mono text-white/50 hover:text-white transition">
                    ← kaytech.com
                </a>

                <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-white/20 bg-black/40 flex items-center justify-center">
                        <img
                            src={settings.profile_image || '/images/logo-kaytech.png'}
                            alt={settings.display_name || 'KayTech'}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <h1 className="text-xl font-extrabold tracking-tight">
                            {settings.display_name || 'KayTech Solutions'}
                        </h1>
                        {settings.bio && (
                            <p className="text-sm text-white/60 max-w-xs">{settings.bio}</p>
                        )}
                    </div>
                </div>

                <LinkList links={links} />
            </div>
        </div>
    );
}
