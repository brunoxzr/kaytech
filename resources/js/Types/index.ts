export type Locale = 'pt-BR' | 'en' | 'es';

export interface LocaleOption {
    code: Locale;
    label: string;
    shortLabel: string;
}

export type TrustedCompany = {
    id?: number;
    name: string;
    logo: string;
    url?: string;
    order?: number;
};

export type ProjectTranslation = {
    locale: Locale;
    title: string;
    category: string;
    summary: string;
    challenge?: string;
    solution?: string;
    slug: string;
    translation_status?: 'draft' | 'machine_translated' | 'reviewed' | 'published';
};

export type Project = {
    id?: number;
    slug: string;
    title: string;
    category: string;
    summary: string;
    challenge?: string;
    solution?: string;
    technologies: string[];
    cover: string;
    gallery?: string[];
    projectUrl?: string;
    extraLinks?: { label: string; url: string }[];
    featured: boolean;
    showOnBrunoProfile?: boolean;
    order: number;
    translations?: Record<Locale, ProjectTranslation>;
};

export type CareerMilestone = {
    id: number;
    year: string;
    title: string;
    description: string;
    technologies?: string[] | null;
    icon_name?: string | null;
    order: number;
};

export type ServiceTranslation = {
    locale: Locale;
    title: string;
    description: string;
};

export type Service = {
    id: string;
    number: string;
    title: string;
    description: string;
    iconName?: string;
    translations?: Record<Locale, ServiceTranslation>;
};

export type ContactLead = {
    id: number;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    project_type: string;
    budget_range?: string;
    message: string;
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'archived';
    created_at: string;
    updated_at?: string;
};

export type LinkGroup = 'kaytech' | 'brunokay';

export type LinkItem = {
    id: number;
    group: LinkGroup;
    title: string;
    url: string;
    icon_name?: string | null;
    icon_image?: string | null;
    order: number;
    active: boolean;
};

export type LinkPageSetting = {
    id?: number;
    group: LinkGroup;
    background_color?: string | null;
    background_image?: string | null;
    background_blur?: number | null;
    background_dim?: number | null;
    profile_image?: string | null;
    display_name?: string | null;
    role_tagline?: string | null;
    hero_title?: string | null;
    hero_description?: string | null;
    bio?: string | null;
    stat_1_value?: string | null;
    stat_1_label?: string | null;
    stat_2_value?: string | null;
    stat_2_label?: string | null;
    stat_3_value?: string | null;
    stat_3_label?: string | null;
    whatsapp_url?: string | null;
    contact_email?: string | null;
};

export type Achievement = {
    id: number;
    title: string;
    description: string;
    order: number;
};

export type Testimonial = {
    id: number;
    author_name: string;
    author_role: string;
    quote: string;
    photo?: string | null;
    order: number;
};

export type KaytechProduct = {
    id: number;
    name: string;
    slug: string;
    tagline?: string | null;
    description: string;
    cover: string;
    access_url?: string | null;
    background_color?: string | null;
    background_image?: string | null;
    order: number;
    active: boolean;
};

export type ShortLink = {
    id: number;
    slug: string;
    destination_url: string;
    clicks: number;
    created_at: string;
};

export type SiteSetting = {
    whatsapp_url: string;
    contact_email: string;
    hero_title?: string;
    hero_description?: string;
    [key: string]: any;
};

export type SharedProps = {
    locale: Locale;
    supportedLocales: Record<Locale, string>;
    translations: Record<string, any>;
    whatsappUrl: string;
    contactEmail: string;
    flash?: {
        success?: string;
        error?: string;
    };
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
};
