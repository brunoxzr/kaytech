import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { SharedProps } from '../../Types';

interface SeoHeadProps {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    ogImage?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
    title = 'KayTech Solutions — Tecnologia que Gera Resultado Real',
    description = 'Sistemas, sites premium e automações sob medida para organizar processos, dados e atendimento em um só lugar.',
    canonicalUrl,
    ogImage = '/images/logo-kaytech.png',
}) => {
    const { props } = usePage<SharedProps>();
    const locale = props.locale || 'pt-BR';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kaytech.com.br';

    const pathWithoutLocale = typeof window !== 'undefined' 
        ? window.location.pathname.replace(/^\/(pt-BR|en|es)/, '') 
        : '';

    const ptUrl = `${origin}/pt-BR${pathWithoutLocale}`;
    const enUrl = `${origin}/en${pathWithoutLocale}`;
    const esUrl = `${origin}/es${pathWithoutLocale}`;

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content="index, follow" />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${origin}${ogImage}`} />
            <meta property="og:url" content={canonicalUrl || currentUrl} />
            <meta property="og:site_name" content="KayTech Solutions" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${origin}${ogImage}`} />

            {/* Hreflang Tags for International SEO */}
            <link rel="alternate" hrefLang="pt-BR" href={ptUrl} />
            <link rel="alternate" hrefLang="en" href={enUrl} />
            <link rel="alternate" hrefLang="es" href={esUrl} />
            <link rel="alternate" hrefLang="x-default" href={ptUrl} />

            {/* Canonical Link */}
            <link rel="canonical" href={canonicalUrl || currentUrl} />

            {/* Schema.org Organization */}
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'KayTech Solutions',
                    url: origin,
                    logo: `${origin}/images/logo-kaytech.png`,
                    founder: {
                        '@type': 'Person',
                        name: 'Bruno Kay',
                        jobTitle: 'Fundador & Engenheiro de Software',
                    },
                    sameAs: ['https://github.com/brunoxzr'],
                })}
            </script>
        </Head>
    );
};
