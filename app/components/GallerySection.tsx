"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
const CATEGORIES = ["All", "Nature", "Tech", "Architecture", "People"];
const generateImages = (category: string, page: number) => {
    return Array.from({ length: 9 }).map((_, i) => ({
        id: `${category}-${page}-${i}-${Date.now()}`,
        url: `https://placehold.co/600x400?text=${category}+${page * 9 + i + 1}`,
        title: `${category} Image ${page * 9 + i + 1}`,
    }));
};
export default function GallerySection() {
    const [filter, setFilter] = useState("All");
    const [images, setImages] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const fetchImages = async (selectedCategory: string, selectedPage: number, reset = false) => {
        setLoading(true);
        const delay = Math.floor(Math.random() * 2000) + 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        const newImages = generateImages(selectedCategory, selectedPage);
        if (reset) {
            setImages(newImages);
        } else {
            setImages(prev => [...prev, ...newImages]);
        }
        setLoading(false);
    };
    useEffect(() => {
        setPage(1);
        fetchImages(filter, 1, true);
    }, [filter]);
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 100
                && !loading
            ) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchImages(filter, nextPage, false);
                    return nextPage;
                });
            }
        };
        window.addEventListener("scroll", handleScroll);
    }, []);
    return (
        <section className="min-h-screen py-20 px-4 bg-zinc-900">
            <h2 className="text-4xl font-bold text-center mb-10 text-white">Infinite Confusion Gallery</h2>
            <div className="flex justify-center gap-4 mb-10 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full transition-colors ${filter === cat
                                ? "bg-purple-600 text-white"
                                : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {images.map((img) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative group"
                    >
                        <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold">{img.title}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
            {loading && (
                <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            )}
        </section>
    );
}
