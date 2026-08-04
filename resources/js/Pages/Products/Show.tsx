import React from 'react';
import { KaytechProduct } from '../../Types';
import { SeoHead } from '../../Components/UI/SeoHead';
import { Navbar } from '../../Components/Layout/Navbar';
import { Footer } from '../../Components/Layout/Footer';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface ShowProductProps {
    product: KaytechProduct;
}

export default function ShowProduct({ product }: ShowProductProps) {
    const backgroundStyle: React.CSSProperties = product.background_image
        ? {
              backgroundImage: `url(${product.background_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
          }
        : { backgroundColor: product.background_color || '#050505' };

    return (
        <div
            className="min-h-screen text-white selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden"
            style={backgroundStyle}
        >
            <SeoHead
                title={`${product.name} — Produtos KayTech`}
                description={product.tagline || product.description}
                ogImage={product.cover}
            />

            {product.background_image && (
                <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
            )}

            <Navbar visible={true} />

            <main className="pt-32 pb-24 relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                    <a
                        href="/pt-BR#produtos"
                        className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-purple-400 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar para produtos</span>
                    </a>

                    <div className="space-y-6 max-w-3xl">
                        {product.tagline && (
                            <span className="text-xs font-mono uppercase tracking-widest text-purple-400 block">
                                {product.tagline}
                            </span>
                        )}

                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
                            {product.name}
                        </h1>

                        <p className="text-lg text-gray-400 leading-relaxed">
                            {product.description}
                        </p>

                        {product.access_url && (
                            <a
                                href={product.access_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 bg-white text-black font-semibold text-sm px-7 py-4 rounded-full transition-transform duration-300 hover:scale-[1.03]"
                            >
                                <span>Acessar {product.name}</span>
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        )}
                    </div>

                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                        <img
                            src={product.cover}
                            alt={product.name}
                            className="w-full h-auto max-h-[600px] object-cover"
                        />
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
