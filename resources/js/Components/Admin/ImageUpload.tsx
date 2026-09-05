import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2, ClipboardPaste } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (path: string) => void;
    folder: 'companies' | 'projects' | 'products' | 'links';
    required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, folder, required }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [pasteHint, setPasteHint] = useState(false);

    const handleFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith('image/')) {
                setError('O arquivo precisa ser uma imagem.');
                return;
            }
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            try {
                const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
                const res = await fetch('/admin/upload', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                        Accept: 'application/json',
                    },
                    body: formData,
                    credentials: 'same-origin',
                });

                if (!res.ok) {
                    throw new Error('Falha no upload');
                }

                const data = await res.json();
                onChange(data.path);
            } catch {
                setError('Não foi possível enviar a imagem. Tente novamente.');
            } finally {
                setUploading(false);
            }
        },
        [folder, onChange],
    );

    const fileFromClipboard = (items: DataTransferItemList | null): File | null => {
        if (!items) return null;
        for (const item of Array.from(items)) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) return f;
            }
        }
        return null;
    };

    const onPaste = (e: React.ClipboardEvent) => {
        const file = fileFromClipboard(e.clipboardData?.items ?? null);
        if (file) {
            e.preventDefault();
            handleFile(file);
        }
    };

    // Enquanto o campo está vazio, Ctrl+V em qualquer lugar da tela envia a imagem
    // (a menos que o foco esteja num input de texto/textarea).
    useEffect(() => {
        if (value) return;
        const onDocPaste = (e: ClipboardEvent) => {
            const el = document.activeElement;
            const tag = el?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement)?.isContentEditable) return;
            const file = fileFromClipboard(e.clipboardData?.items ?? null);
            if (file) {
                e.preventDefault();
                handleFile(file);
            }
        };
        document.addEventListener('paste', onDocPaste);
        return () => document.removeEventListener('paste', onDocPaste);
    }, [value, handleFile]);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            {label ? (
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = '';
                }}
            />

            {value ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 h-32 group">
                    <img src={value} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                            title="Trocar imagem"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
                            title="Remover imagem"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    ref={dropRef}
                    tabIndex={0}
                    onPaste={onPaste}
                    onFocus={() => setPasteHint(true)}
                    onBlur={() => setPasteHint(false)}
                    onClick={() => { dropRef.current?.focus(); inputRef.current?.click(); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`w-full min-h-32 rounded-xl border border-dashed transition flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer outline-none px-3 py-4 ${
                        dragOver
                            ? 'border-white/40 bg-white/10'
                            : pasteHint
                              ? 'border-white/30 bg-white/5'
                              : 'border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-white/25'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            <span className="text-xs text-center">
                                Clique, arraste ou <strong className="text-gray-300">cole (Ctrl+V)</strong> uma imagem
                            </span>
                            {pasteHint && (
                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <ClipboardPaste className="w-3 h-3" /> pronto para colar
                                </span>
                            )}
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};
