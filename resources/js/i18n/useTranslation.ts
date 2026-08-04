import { usePage } from '@inertiajs/react';
import { SharedProps, Locale } from '../Types';

export function useTranslation() {
    const { props } = usePage<{ locale: Locale; translations: Record<string, any> }>();
    const locale = props.locale || 'pt-BR';
    const translations = props.translations || {};

    const t = (path: string, fallback?: string): string => {
        const parts = path.split('.');
        let current: any = translations;

        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return fallback || path;
            }
        }

        if (typeof current === 'string') {
            return current;
        }

        return fallback || path;
    };

    return { t, locale, translations };
}
