import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Palette } from 'lucide-react';
import { useAdminTheme, ThemeMode, ThemeSkin, ContentWidth, Direction } from '../../Contexts/AdminThemeContext';

const ACCENT_SWATCHES: { label: string; value: string }[] = [
    { label: 'Roxo', value: '#8b5cf6' },
    { label: 'Verde', value: '#0f766e' },
    { label: 'Amarelo', value: '#f59e0b' },
    { label: 'Vermelho', value: '#ef4444' },
    { label: 'Azul', value: '#0ea5e9' },
    { label: 'Preto seguro', value: '#111827' },
];

const RADIUS_OPTIONS = [
    { label: 'Menor', value: '0.5rem' },
    { label: 'Padrão', value: '0.75rem' },
    { label: 'Maior', value: '1.25rem' },
];

const FONT_SCALE_OPTIONS = [
    { label: 'Compacta', value: '0.95' },
    { label: 'Padrão', value: '1' },
    { label: 'Grande', value: '1.08' },
];

export const ThemeCustomizerPanel: React.FC = () => {
    const {
        customizer,
        customizerOpen,
        setCustomizerOpen,
        sidebarCollapsed,
        toggleSidebar,
        setThemeMode,
        setAccentColor,
        setSkin,
        setContentWidth,
        setDirection,
        setRadius,
        setFontScale,
        setHighContrast,
        setReduceMotion,
        resetCustomizer,
    } = useAdminTheme();

    return (
        <>
            <button
                onClick={() => setCustomizerOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-purple-600 hover:bg-purple-500 text-white rounded-l-xl p-3 shadow-xl transition"
                title="Personalizar tema"
            >
                <Palette className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {customizerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCustomizerOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[#0a0a0f] border-l border-white/10 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Personalizar Painel</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={resetCustomizer} title="Restaurar padrão" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCustomizerOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Accent color */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Cor principal</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {ACCENT_SWATCHES.map((s) => (
                                            <button
                                                key={s.value}
                                                title={s.label}
                                                onClick={() => setAccentColor(s.value)}
                                                className={`w-8 h-8 rounded-full transition ${
                                                    customizer.accentColor === s.value ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0f] ring-white' : ''
                                                }`}
                                                style={{ backgroundColor: s.value }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">No modo escuro, o preto vira branco para manter contraste.</p>
                                </div>

                                {/* Mode */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Modo</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setThemeMode(m)}
                                                className={`py-2 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.mode === m ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sistema'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skin */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Pele</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['default', 'bordered'] as ThemeSkin[]).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setSkin(s)}
                                                className={`py-3 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.skin === s ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {s === 'default' ? 'Padrão' : 'Com bordas'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Menu</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => sidebarCollapsed && toggleSidebar()}
                                            className={`py-3 rounded-lg text-xs font-mono uppercase transition ${
                                                !sidebarCollapsed ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            Vertical
                                        </button>
                                        <button
                                            onClick={() => !sidebarCollapsed && toggleSidebar()}
                                            className={`py-3 rounded-lg text-xs font-mono uppercase transition ${
                                                sidebarCollapsed ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            Recolhido
                                        </button>
                                    </div>
                                </div>

                                {/* Content width */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Conteúdo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['compact', 'wide'] as ContentWidth[]).map((w) => (
                                            <button
                                                key={w}
                                                onClick={() => setContentWidth(w)}
                                                className={`py-2 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.contentWidth === w ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {w === 'compact' ? 'Compacto' : 'Largo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Direction */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Direção do menu</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['ltr', 'rtl'] as Direction[]).map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDirection(d)}
                                                className={`py-2 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.direction === d ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {d === 'ltr' ? 'Esquerda' : 'Direita'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">Muda o menu de lado sem inverter os textos.</p>
                                </div>

                                {/* Radius */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Arredondamento</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RADIUS_OPTIONS.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => setRadius(r.value)}
                                                className={`py-2 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.radius === r.value ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font scale */}
                                <div>
                                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Tamanho da fonte</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {FONT_SCALE_OPTIONS.map((f) => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFontScale(f.value)}
                                                className={`py-2 rounded-lg text-xs font-mono uppercase transition ${
                                                    customizer.fontScale === f.value ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-3 pt-2 border-t border-white/10">
                                    <label className="flex items-center justify-between text-xs text-gray-300">
                                        <span>Alto contraste</span>
                                        <input
                                            type="checkbox"
                                            checked={customizer.highContrast}
                                            onChange={(e) => setHighContrast(e.target.checked)}
                                            className="accent-purple-600 w-4 h-4"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-xs text-gray-300">
                                        <span>Reduzir animações</span>
                                        <input
                                            type="checkbox"
                                            checked={customizer.reduceMotion}
                                            onChange={(e) => setReduceMotion(e.target.checked)}
                                            className="accent-purple-600 w-4 h-4"
                                        />
                                    </label>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
