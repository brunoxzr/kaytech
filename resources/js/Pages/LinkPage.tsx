import React from 'react';
import { Head } from '@inertiajs/react';
import { LinkItem, LinkPageSetting } from '../Types';
import { LinkPageView } from '../Components/Links/LinkPageView';

interface LinkPageProps {
    links: LinkItem[];
    settings: LinkPageSetting;
}

export default function LinkPage({ links, settings }: LinkPageProps) {
    return (
        <>
            <Head title={`${settings.display_name || 'KayTech'} — Links`} />
            <LinkPageView settings={settings} links={links} />
        </>
    );
}
