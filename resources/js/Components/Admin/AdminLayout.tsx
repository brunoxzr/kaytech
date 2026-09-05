import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, FolderGit2, Building2, MessageSquare, Settings, LogOut,
    Package, Link2, Scissors, Milestone, Wallet, ArrowLeftRight, Repeat,
    PiggyBank, Tags, Menu, X, Moon, Sun, PanelLeftClose, PanelLeft, Users, Radar,
    MessagesSquare, Send,
} from 'lucide-react';
import { AdminThemeProvider, useAdminTheme } from '../../Contexts/AdminThemeContext';
import { ChatWidget } from '../Chat/ChatWidget';

interface AdminLayoutProps {
    title: React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
}

interface NavItem {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    section?: string;
    exact?: boolean;
    financeAllowed?: boolean; // visível também para usuários 'finance'
}

const NAV_ITEMS: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },

    { href: '/admin/clientes', label: 'Clientes', icon: Users, section: 'CRM' },
    { href: '/admin/prospeccao', label: 'Prospecção', icon: Radar, section: 'CRM' },
    { href: '/admin/whatsapp', label: 'Mensagens', icon: MessagesSquare, section: 'CRM' },
    { href: '/admin/whatsapp/disparo', label: 'Enviar mensagens', icon: Send, section: 'CRM' },

    { href: '/admin/financas', label: 'Visão geral', icon: Wallet, section: 'Finanças', exact: true, financeAllowed: true },
    { href: '/admin/financas/lancamentos', label: 'Lançamentos', icon: ArrowLeftRight, section: 'Finanças', financeAllowed: true },
    { href: '/admin/financas/config', label: 'Config', icon: Tags, section: 'Finanças', financeAllowed: true },

    { href: '/admin/projetos', label: 'Projetos', icon: FolderGit2, section: 'Site' },
    { href: '/admin/produtos', label: 'Produtos', icon: Package, section: 'Site' },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2, section: 'Site' },
    { href: '/admin/links', label: 'Linktree', icon: Link2, section: 'Site' },
    { href: '/admin/carreira', label: 'Trajetória', icon: Milestone, section: 'Site' },
    { href: '/admin/encurtador', label: 'Encurtador', icon: Scissors, section: 'Site' },
    { href: '/admin/contatos', label: 'Leads', icon: MessageSquare, section: 'Site' },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users, section: 'Site' },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings, section: 'Site' },
];

const NavList: React.FC<{ collapsed: boolean; path: string; role: string }> = ({ collapsed, path, role }) => {
    const items = role === 'finance' ? NAV_ITEMS.filter((i) => i.financeAllowed) : NAV_ITEMS;
    return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item, i) => {
            const isActive = item.exact ? path === item.href : path.startsWith(item.href);
            const Icon = item.icon;
            const showSection = !collapsed && item.section && item.section !== items[i - 1]?.section;
            return (
                <React.Fragment key={item.href}>
                    {showSection && (
                        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider ui-t-faint">
                            {item.section}
                        </p>
                    )}
                    <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${
                            isActive ? 'ui-subtle ui-t font-medium' : 'ui-t-soft hover:ui-subtle'
                        } ${collapsed ? 'justify-center' : ''}`}
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                </React.Fragment>
            );
        })}
    </nav>
    );
};

const jarvisGreeting = () => {
    const h = new Date().getHours();
    const period =
        h < 6 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const extra =
        h < 6 ? ' Trabalhando até essa hora, imagino que valha a pena.'
        : h < 12 ? ' Tudo pronto por aqui.'
        : h < 18 ? ' Às ordens.'
        : ' O dia rendeu, presumo.';
    return `${period}, senhor.${extra} Quantos milhões vamos fazer hoje?`;
};

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ title, subtitle, children, headerAction }) => {
    const { url, props } = usePage<{ auth?: { user?: { role?: string } | null } }>();
    const role = props.auth?.user?.role ?? 'admin';
    const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useAdminTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const path = url.split('?')[0];

    useEffect(() => { setMobileOpen(false); }, [url]);

    const collapsed = sidebarCollapsed && !mobileOpen;

    return (
        <div className="ui-root ui-canvas min-h-screen">
            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                id="admin-sidebar"
                className={`ui-surface fixed inset-y-0 left-0 z-40 flex flex-col border-r ui-b transition-transform duration-200
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                    ${collapsed ? 'is-collapsed w-64 md:w-15' : 'w-64'}`}
            >
                <div className={`flex h-14 items-center border-b ui-b ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
                    <a href="/admin" className="flex items-center gap-2.5 min-w-0">
                        <img src="/images/logo-kaytech.png" alt="KayTech" className="admin-logo h-7 w-auto shrink-0 object-contain" />
                        {!collapsed && <span className="truncate text-[13px] font-semibold ui-t">KayTech<span className="ui-t-faint"> · admin</span></span>}
                    </a>
                    <button
                        onClick={toggleSidebar}
                        className="hidden shrink-0 ui-t-faint transition hover:ui-t md:block"
                        aria-label="Recolher menu"
                    >
                        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setMobileOpen(false)} className="shrink-0 ui-t-faint md:hidden" aria-label="Fechar menu">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <NavList collapsed={collapsed} path={path} role={role} />

                <div className={`border-t ui-b p-3 ${collapsed ? 'space-y-1' : 'space-y-0.5'}`}>
                    <button
                        onClick={toggleTheme}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] ui-t-soft transition hover:ui-subtle ${collapsed ? 'justify-center' : ''}`}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
                        {!collapsed && <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
                    </button>
                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] ui-neg transition hover:ui-subtle ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-4 w-4" strokeWidth={1.75} />
                        {!collapsed && <span>Sair</span>}
                    </Link>
                </div>
            </aside>

            {/* Conteúdo */}
            <main
                id="admin-main-content"
                className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'is-collapsed' : ''}`}
            >
                {/* topbar mobile */}
                <div className="flex items-center gap-3 border-b ui-b px-4 py-3 md:hidden">
                    <button onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="ui-t-soft">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-[13px] font-semibold ui-t">KayTech · admin</span>
                </div>

                <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight ui-t">{title}</h1>
                            {subtitle && <p className="mt-1 text-[13px] ui-t-faint">{subtitle}</p>}
                        </div>
                        {headerAction}
                    </div>
                    <div className="space-y-6">{children}</div>
                </div>
            </main>

            <ChatWidget
                endpoint="/admin/jarvis"
                title="Jarvis"
                intro={jarvisGreeting()}
                placeholder="Pergunte ou peça uma ação…"
                theme="ui"
            />
        </div>
    );
};

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => (
    <AdminThemeProvider>
        <AdminLayoutInner {...props} />
    </AdminThemeProvider>
);
