import React from 'react';
import { motion } from 'framer-motion';
import { KaytechProduct } from '../../Types';
import { ArrowUpRight } from 'lucide-react';

interface ProductsSectionProps {
    products: KaytechProduct[];
}

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
    if (products.length === 0) return null;

    return (
        <section id="produtos" className="bg-[#050505] py-24 sm:py-32 border-b border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-16 space-y-4"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                        PRODUTOS KAYTECH
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        Produtos próprios que carregam nossa marca.
                    </h2>
                </motion.div>

                <div className="space-y-24 sm:space-y-32">
                    {products.map((product, idx) => {
                        const reversed = idx % 2 === 1;
                        return (
                            <motion.article
                                key={product.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}
                                variants={fadeUp}
                                transition={{ duration: 0.7 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
                            >
                                <div className={`lg:col-span-7 relative group ${reversed ? 'lg:order-2' : 'lg:order-1'}`}>
                                    <div className="relative h-72 sm:h-[26rem] rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                                        <img
                                            src={product.cover}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                        />
                                    </div>
                                </div>

                                <div className={`lg:col-span-5 space-y-5 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
                                    {product.tagline && (
                                        <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                                            {product.tagline}
                                        </span>
                                    )}

                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                        {product.name}
                                    </h3>

                                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                                        {product.description}
                                    </p>

                                    {product.access_url && (
                                        <a
                                            href={`/produtos/${product.slug}`}
                                            className="group/link inline-flex items-center gap-3 bg-white text-black font-semibold text-sm px-7 py-4 rounded-full transition-transform duration-300 hover:scale-[1.03]"
                                        >
                                            <span>Conhecer produto</span>
                                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                        </a>
                                    )}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};
