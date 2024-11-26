"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import Image from "next/image";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { motion } from "framer-motion";

interface GalleryItem {
  id: number;
  file: string;
  judul: string;
  galery: {
    id: number;
    post_id: number;
    status: number;
    post: {
      id: number;
      judul: string;
      kategori: {
        id: number;
        judul: string;
      }
    }
  }
}

interface SupabaseGalleryResponse {
  id: number;
  file: string;
  judul: string;
  galery_id: number;
  galery: {
    id: number;
    post_id: number;
    status: number;
    post: {
      id: number;
      judul: string;
      kategori_id: number;
      kategori: {
        id: number;
        judul: string;
      }
    }
  }
}

export default function Galeri() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('foto')
        .select(`
          id,
          file,
          judul,
          galery_id,
          galery:galery_id (
            id,
            post_id,
            status,
            post:post_id (
              id,
              judul,
              kategori_id,
              kategori:kategori_id (
                id,
                judul
              )
            )
          )
        `)
        .eq('galery.status', 1);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      // Transform data dengan type safety
      const validData = (data as SupabaseGalleryResponse[]).filter(
        item => item && item.galery && item.galery.post && item.galery.post.kategori
      );

      const transformedData: GalleryItem[] = validData.map(item => ({
        id: item.id,
        file: item.file,
        judul: item.judul,
        galery: {
          id: item.galery.id,
          post_id: item.galery.post_id,
          status: item.galery.status,
          post: {
            id: item.galery.post.id,
            judul: item.galery.post.judul,
            kategori: {
              id: item.galery.post.kategori.id,
              judul: item.galery.post.kategori.judul
            }
          }
        }
      }));

      setGalleries(transformedData);
      
    } catch (err: any) {
      console.error('Error fetching galleries:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dapatkan kategori unik dari data
  const categories = ['Semua', ...new Set(galleries.map(item => 
    item.galery?.post?.kategori?.judul
  ).filter(Boolean))];

  const filteredGalleries = selectedCategory === 'Semua' 
    ? galleries 
    : galleries.filter(item => 
        item.galery?.post?.kategori?.judul === selectedCategory
      );

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative mb-20"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-1 bg-gray-700"></div>
            <h1 className="text-5xl md:text-6xl font-bold text-center text-white">
              Galeri
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredGalleries.map((item, index) => (
              <motion.div
                key={item.id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                className="group relative aspect-square overflow-hidden rounded-xl"
                onClick={() => setSelectedImage(item)}
              >
                <Image
                  src={item.file}
                  alt={item.judul}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white/90 mb-2">
                      {item.galery?.post?.kategori?.judul}
                    </span>
                    <h3 className="text-white font-bold text-xl">
                      {item.judul}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full aspect-[4/3] rounded-xl overflow-hidden">
            <Image
              src={selectedImage.file}
              alt={selectedImage.judul}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white/90 mb-2">
                {selectedImage.galery.post.kategori.judul}
              </span>
              <h3 className="text-white font-bold text-2xl">
                {selectedImage.judul}
              </h3>
            </div>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
