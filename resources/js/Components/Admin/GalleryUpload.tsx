import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

interface GalleryUploadProps {
    label: string;
    value: string[];
    onChange: (paths: string[]) => void;
    folder?: 'companies' | 'projects' | 'products' | 'links';
}

export const GalleryUpload: React.FC<GalleryUploadProps> = ({ label, value, onChange, folder = 'projects' }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadOne = async (file: File): Promise<string | null> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        const res = await fetch('/admin/upload', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
            body: fd,
            credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('upload');
        const data = await res.json();
        return data.path as string;
    };

    const handleFiles = async (files: FileList) => {
        setUploading(true);
        setError(null);
        try {
            const paths: string[] = [];
            for (const file of Array.from(files)) {
                const p = await uploadOne(file);
                if (p) paths.push(p);
            }
            onChange([...value, ...paths]);
        } catch {
            setError('Falha ao enviar uma ou mais imagens.');
        } finally {
            setUploading(false);
        }
    };

    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    const swap = (i: number, j: number) => {
        if (j < 0 || j >= value.length) return;
        const next = [...value];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };

    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide ui-t-faint">{label}</label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
            />

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {value.map((src, i) => (
                    <div key={src + i} className="group relative aspect-4/3 overflow-hidden rounded-lg border ui-b bg-black/20">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/55 opacity-0 transition group-hover:opacity-100">
                            <button type="button" onClick={() => swap(i, i - 1)} className="rounded bg-white/15 p-1 text-white" title="Mover para trás">
                                <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => swap(i, i + 1)} className="rounded bg-white/15 p-1 text-white" title="Mover para frente">
                                <ArrowRight className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => remove(i)} className="rounded bg-red-500/25 p-1 text-red-200" title="Remover">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white/80">{i + 1}</span>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex aspect-4/3 flex-col items-center justify-center gap-1 rounded-lg border border-dashed ui-b-strong text-[11px] ui-t-faint transition hover:ui-subtle disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /><span>Adicionar</span></>}
                </button>
            </div>

            {error && <p className="mt-1 text-[11px] ui-neg">{error}</p>}
        </div>
    );
};
