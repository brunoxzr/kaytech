import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (path: string) => void;
    folder: 'companies' | 'projects' | 'products' | 'links';
    required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, folder, required }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
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
    };

    return (
        <div>
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>

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
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-white/25 transition flex flex-col items-center justify-center gap-2 text-gray-500 disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            <span className="text-xs">Clique para enviar uma imagem</span>
                        </>
                    )}
                </button>
            )}

            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};
