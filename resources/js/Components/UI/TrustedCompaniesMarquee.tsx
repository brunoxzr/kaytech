import React from 'react';
import { TrustedCompany } from '../../Types';
import { useTranslation } from '../../i18n';
import { useReducedMotion } from '../../Hooks/useReducedMotion';

interface TrustedCompaniesMarqueeProps {
    companies: TrustedCompany[];
}

export const TrustedCompaniesMarquee: React.FC<TrustedCompaniesMarqueeProps> = ({ companies }) => {
    const { t } = useTranslation();
    const prefersReducedMotion = useReducedMotion();

    const displayCompanies = companies.length > 0 ? companies : [
        { name: 'CEEP', logo: '/images/companies/logoCeep.png' },
        { name: 'Espaço Assahi', logo: '/images/companies/assahi.png' },
        { name: 'Minoru', logo: '/images/companies/minoru.png' },
        { name: 'Billy Bob', logo: '/images/companies/billybob.png' },
    ];

    // Multiply list for continuous loop
    const marqueeItems = [...displayCompanies, ...displayCompanies, ...displayCompanies, ...displayCompanies];

    return (
        <section className="relative overflow-hidden border-y border-white/10 py-16">
            <div className="mx-auto mb-10 max-w-5xl px-6 text-center">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
                    …/ {t('home.trusted_companies_title', 'Empresas que confiam na KayTech')}
                </span>
            </div>

            {/* Infinite Marquee Container with Side Masks */}
            <div className="relative w-full overflow-hidden">
                {/* Side Fade Gradient Masks */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0d0d0d] to-transparent sm:w-48" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0d0d0d] to-transparent sm:w-48" />

                {prefersReducedMotion ? (
                    <div className="flex flex-wrap items-center justify-center gap-14 px-4">
                        {displayCompanies.map((c, i) => (
                            <div key={i} className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition opacity-70 hover:opacity-100">
                                <img src={c.logo} alt={c.name} className="max-h-16 w-auto object-contain" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex w-max space-x-16 animate-marquee hover:[animation-play-state:paused] items-center">
                        {marqueeItems.map((c, idx) => (
                            <a
                                key={idx}
                                href={c.url || '#'}
                                target={c.url ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 group"
                            >
                                <img
                                    src={c.logo}
                                    alt={c.name}
                                    className="h-14 sm:h-16 w-auto object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                                />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Animation CSS for Marquee */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 35s linear infinite;
                }
            `}</style>
        </section>
    );
};
