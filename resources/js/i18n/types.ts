import { Locale } from '../Types';

export type TranslationDictionary = {
    navigation: Record<string, string>;
    home: Record<string, string>;
    projects: Record<string, string>;
    services: Record<string, string>;
    contact: Record<string, string>;
    [key: string]: Record<string, string>;
};

export interface LocaleOption {
    code: Locale;
    label: string;
    shortLabel: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
    { code: 'pt-BR', label: 'Português (BR)', shortLabel: 'PT' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'es', label: 'Español', shortLabel: 'ES' },
];
