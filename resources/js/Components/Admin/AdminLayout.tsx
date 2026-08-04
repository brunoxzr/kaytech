import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderGit2,
    Building2,
    MessageSquare,
    Settings,
    LogOut,
    Package,
    Link2,
    Scissors,
    ChevronLeft,
    ChevronRight,
    Search,
    Sun,
    Moon,
} from 'lucide-react';
import { AdminThemeProvider, useAdminTheme } from '../../Contexts/AdminThemeContext';
import { ThemeCustomizerPanel } from './ThemeCustomizerPanel';
import { NavLink } from './NavLink';

interface AdminLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
}

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/projetos', label: 'Projetos', icon: FolderGit2 },
    { href: '/admin/produtos', label: 'Produtos KayTech', icon: Package },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/admin/links', label: 'Linktree', icon: Link2 },
    { href: '/admin/encurtador', label: 'Encurtador', icon: Scissors },
    { href: '/admin/contatos', label: 'Leads / Contatos', icon: MessageSquare },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ title, subtitle, children, headerAction }) => {
    const { url } = usePage();
    const { sidebarCollapsed, toggleSidebar, darkMode, toggleTheme, customizer } = useAdminTheme();
    const [search, setSearch] = useState('');

    const filteredItems = NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase().trim())
    );

    const contentWidthClass = customizer.contentWidth === 'compact' ? 'mx-auto max-w-6xl' : 'w-full';

    return (
        <div className="min-h-screen bg-[#050505] text-white flex admin-ui-radius-soft">
            {/* Sidebar */}
            <aside
                id="admin-sidebar"
                className={`bg-[#0a0a0f] border-r border-white/10 flex-col justify-between hidden md:flex fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
                    sidebarCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                <div>
                    <div className={`flex items-center h-[72px] border-b border-white/10 transition-all ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3 min-w-0">
                                <img src="/images/logo-kaytech.png" alt="KayTech Logo" className="h-8 object-contain shrink-0" />
                                <span className="font-bold text-white tracking-wider text-sm truncate">Painel KayTech</span>
                            </div>
                        )}
                        {sidebarCollapsed && (
                            <img src="/images/logo-kaytech.png" alt="KayTech Logo" className="h-8 object-contain" />
                        )}
                    </div>

                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex items-center justify-center w-full py-2 text-gray-500 hover:text-white border-b border-white/10 transition"
                        title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    {!sidebarCollapsed && (
                        <div className="px-4 pt-4">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar módulo"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                    )}

                    <nav className="p-4 space-y-1">
                        {filteredItems.map((item) => {
                            const isActive = item.href === '/admin' ? url === '/admin' : url.startsWith(item.href);
                            return (
                                <NavLink
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    icon={item.icon}
                                    active={isActive}
                                    collapsed={sidebarCollapsed}
                                />
                            );
                        })}
                        {filteredItems.length === 0 && !sidebarCollapsed && (
                            <p className="px-4 py-3 text-xs text-gray-600 border border-dashed border-white/10 rounded-lg text-center">
                                Nenhum módulo encontrado.
                            </p>
                        )}
                    </nav>
                </div>

                <div className={`p-4 border-t border-white/10 space-y-2 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <button
                        onClick={toggleTheme}
                        title={darkMode ? 'Modo claro' : 'Modo escuro'}
                        className={`flex items-center gap-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-xs font-mono transition ${
                            sidebarCollapsed ? 'justify-center p-2.5 w-full' : 'px-4 py-2.5 w-full'
                        }`}
                    >
                        {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
                        {!sidebarCollapsed && <span>{darkMode ? 'Modo claro' : 'Modo escuro'}</span>}
                    </button>

                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        title="Sair do Painel"
                        className={`flex items-center gap-3 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-mono transition ${
                            sidebarCollapsed ? 'justify-center p-2.5 w-full' : 'px-4 py-2.5 w-full'
                        }`}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>Sair do Painel</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main
                id="admin-main-content"
                className={`flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
            >
                <div className={contentWidthClass}>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
                            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                        {headerAction}
                    </div>

                    <div className="space-y-8">{children}</div>
                </div>
            </main>

            <ThemeCustomizerPanel />
        </div>
    );
};

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => (
    <AdminThemeProvider>
        <AdminLayoutInner {...props} />
    </AdminThemeProvider>
);
