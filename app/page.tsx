"use client";
import Image from "next/image";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { getVisitorIp, recordVisit, recordExit, getVisitorStats } from "@/lib/visitorStats";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Comment {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

interface Agenda {
  id: number;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  likes_count: number;
  is_liked?: boolean;
  comments?: Comment[];
  post?: {
    galery?: {
      foto?: {
        file: string;
      }[];
    }[];
  };
}

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  keterangan: string;
  likes_count: number;
  is_liked?: boolean;
  comments?: Comment[];
  post?: {
    galery?: {
      foto?: {
        file: string;
      }[];
    }[];
  };
}

interface Foto {
  id: number;
  file: string;
  judul: string;
  galery: {
    post: {
      kategori: {
        judul: string;
      }
    }
  }
}

// Add new interface for selected items
interface SelectedItem {
  type: 'agenda' | 'informasi';
  data: Agenda | Informasi;
}

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [informasis, setInformasis] = useState<Informasi[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);

  // Add new state for selected item
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Tambahkan state untuk komentar
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tambahkan state untuk menyimpan nama komentator
  const [commentatorName, setCommentatorName] = useState<string>("");

  // Tambahkan state untuk edit komentar
  const [editingComment, setEditingComment] = useState<{
    id: number;
    content: string;
    user_name: string;
  } | null>(null);

  // Tambahkan state untuk statistik
  const [visitorStats, setVisitorStats] = useState({
    todayVisitors: 0,
    averageDuration: 0,
    activeVisitors: 0,
    weeklyData: { days: [], counts: [] }
  });

  useEffect(() => {
    fetchAgendaAndInformasi();
    fetchFotos();
    recordVisit('home');
    fetchVisitorStats();
    
    return () => {
      getVisitorIp().then(ip => {
        if (ip) recordExit(ip);
      });
    };
  }, []);

  const fetchAgendaAndInformasi = async () => {
    try {
      // Fetch Agenda
      const { data: agendaData, error: agendaError } = await supabase
        .from('agenda')
        .select(`
          *,
          likes_count,
          comments:agenda_comments(
            id,
            user_name,
            content,
            created_at
          ),
          post:post_id (
            galery (
              foto (
                file
              )
            )
          )
        `)
        .eq('status', 'aktif')
        .order('tanggal', { ascending: true })
        .limit(3);

      console.log('Agenda Data:', agendaData);
      console.log('Agenda Error:', agendaError);

      if (agendaError) throw agendaError;
      setAgendas(agendaData || []);

      // Fetch Informasi
      const { data: informasiData, error: informasiError } = await supabase
        .from('informasi')
        .select(`
          *,
          likes_count,
          comments:informasi_comments(
            id,
            user_name,
            content,
            created_at
          ),
          post:post_id (
            galery (
              foto (
                file
              )
            )
          )
        `)
        .eq('status', 'aktif')
        .order('tanggal', { ascending: false })
        .limit(3);

      console.log('Informasi Data:', informasiData);
      console.log('Informasi Error:', informasiError);

      if (informasiError) throw informasiError;
      setInformasis(informasiData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchFotos = async () => {
    try {
      const { data, error } = await supabase
        .from('foto')
        .select(`
          id,
          file,
          judul,
          galery:galery_id (
            post:post_id (
              kategori:kategori_id (
                judul
              )
            )
          )
        `)
        .eq('galery.status', 1)
        .limit(4);

      console.log('Foto Data:', data);
      console.log('Foto Error:', error);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      // Transform data dengan type safety
      const transformedData: Foto[] = (data || []).map(item => ({
        id: item.id,
        file: item.file,
        judul: item.judul,
        galery: {
          post: {
            kategori: {
              judul: item.galery?.post?.kategori?.judul || ''
            }
          }
        }
      }));

      setFotos(transformedData);
      
    } catch (err: any) {
      console.error('Error fetching photos:', err.message);
    }
  };

  const jurusans = [
    {
      id: 1,
      nama: "Pengembangan Perangkat Lunak dan Gim",
      singkatan: "PPLG",
      image: "/pplg.png",
      deskripsi: "Program keahlian yang fokus pada pengembangan aplikasi, web, mobile, dan game. Siswa akan mempelajari berbagai bahasa pemrograman dan teknologi terkini.",
      kompetensi: [
        "Pemrograman Web Frontend & Backend",
        "Mobile App Development",
        "Game Development",
        "Database Management",
        "UI/UX Design"
      ],
      warna: "from-blue-500/20 to-cyan-500/20"
    },
    {
      id: 2,
      nama: "Teknik Jaringan Komputer dan Telekomunikasi",
      singkatan: "TJKT",
      image: "/tjkt.png",
      deskripsi: "Program keahlian yang mempelajari tentang jaringan komputer, administrasi server, dan sistem telekomunikasi modern.",
      kompetensi: [
        "Instalasi dan Konfigurasi Jaringan",
        "Administrasi Server",
        "Keamanan Jaringan",
        "Cloud Computing",
        "Sistem Telekomunikasi"
      ],
      warna: "from-purple-500/20 to-pink-500/20"
    },
    {
      id: 3,
      nama: "Teknik Otomotif",
      singkatan: "TO",
      image: "/to.png",
      deskripsi: "Program keahlian yang mempelajari tentang perawatan dan perbaikan kendaraan bermotor dengan teknologi terkini.",
      kompetensi: [
        "Perawatan Mesin Kendaraan",
        "Sistem Kelistrikan Otomotif",
        "Teknologi Motor Listrik",
        "Diagnosa Kerusakan",
        "Sistem Kontrol Elektronik"
      ],
      warna: "from-orange-500/20 to-red-500/20"
    },
    {
      id: 4,
      nama: "Teknik Pengelasan",
      singkatan: "TP",
      image: "/tp.jpeg",
      deskripsi: "Program keahlian yang mempelajari berbagai teknik pengelasan modern dan fabrikasi logam sesuai standar industri.",
      kompetensi: [
        "Las SMAW",
        "Las MIG/MAG",
        "Las TIG",
        "Fabrikasi Logam",
        "Keselamatan Kerja"
      ],
      warna: "from-red-500/20 to-yellow-500/20"
    }
  ];

  // Add close handler
  const handleClose = () => {
    setSelectedItem(null);
  };

  // Tambahkan fungsi untuk mendapatkan IP address
  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return null;
    }
  };

  // Update fungsi handleLike
  const handleLike = async (type: 'agenda' | 'informasi', id: number) => {
    try {
      const ip = await getIpAddress();
      if (!ip) {
        console.error('Could not get IP address');
        return;
      }

      const likesTable = type === 'agenda' ? 'agenda_likes' : 'informasi_likes';
      const mainTable = type === 'agenda' ? 'agenda' : 'informasi';
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from(likesTable)
        .select()
        .eq(`${type}_id`, id)
        .eq('ip_address', ip)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from(likesTable)
          .delete()
          .eq(`${type}_id`, id)
          .eq('ip_address', ip);

        // Decrement likes count
        await supabase.rpc('decrement_likes', { 
          table_name: mainTable,
          row_id: id
        });

        // Update local state
        if (selectedItem && selectedItem.type === type && selectedItem.data.id === id) {
          setSelectedItem({
            ...selectedItem,
            data: {
              ...selectedItem.data,
              likes_count: Math.max(0, selectedItem.data.likes_count - 1),
              is_liked: false
            }
          });

          // Update lists state
          if (type === 'agenda') {
            setAgendas(prev => prev.map(agenda => 
              agenda.id === id 
                ? { ...agenda, likes_count: Math.max(0, agenda.likes_count - 1), is_liked: false }
                : agenda
            ));
          } else {
            setInformasis(prev => prev.map(info => 
              info.id === id 
                ? { ...info, likes_count: Math.max(0, info.likes_count - 1), is_liked: false }
                : info
            ));
          }
        }
      } else {
        // Like
        await supabase
          .from(likesTable)
          .insert({
            [`${type}_id`]: id,
            ip_address: ip
          });

        // Increment likes count
        await supabase.rpc('increment_likes', { 
          table_name: mainTable,
          row_id: id
        });

        // Update local state
        if (selectedItem && selectedItem.type === type && selectedItem.data.id === id) {
          setSelectedItem({
            ...selectedItem,
            data: {
              ...selectedItem.data,
              likes_count: selectedItem.data.likes_count + 1,
              is_liked: true
            }
          });

          // Update lists state
          if (type === 'agenda') {
            setAgendas(prev => prev.map(agenda => 
              agenda.id === id 
                ? { ...agenda, likes_count: agenda.likes_count + 1, is_liked: true }
                : agenda
            ));
          } else {
            setInformasis(prev => prev.map(info => 
              info.id === id 
                ? { ...info, likes_count: info.likes_count + 1, is_liked: true }
                : info
            ));
          }
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Tambahkan fungsi untuk menangani komentar
  const handleComment = async (type: 'agenda' | 'informasi', id: number) => {
    if (!newComment.trim()) return;
    if (!commentatorName.trim()) {
      alert('Mohon isi nama Anda');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const table = type === 'agenda' ? 'agenda_comments' : 'informasi_comments';
      
      const newCommentData = {
        [`${type}_id`]: id,
        content: newComment,
        user_name: commentatorName
      };
      
      const { data: comment, error: insertError } = await supabase
        .from(table)
        .insert(newCommentData)
        .select(`
          id,
          user_name,
          content,
          created_at
        `)
        .single();

      if (insertError) throw insertError;

      // Transform comment untuk UI
      const transformedComment: Comment = {
        id: comment.id,
        user_name: comment.user_name,
        content: comment.content,
        created_at: comment.created_at,
      };

      // Update local state
      if (selectedItem && selectedItem.type === type && selectedItem.data.id === id) {
        setSelectedItem({
          ...selectedItem,
          data: {
            ...selectedItem.data,
            comments: [...(selectedItem.data.comments || []), transformedComment]
          }
        });

        // Update the lists state as well
        if (type === 'agenda') {
          setAgendas(agendas.map(agenda => 
            agenda.id === id 
              ? { ...agenda, comments: [...(agenda.comments || []), transformedComment] }
              : agenda
          ));
        } else {
          setInformasis(informasis.map(info => 
            info.id === id 
              ? { ...info, comments: [...(info.comments || []), transformedComment] }
              : info
          ));
        }
      }

      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Terjadi kesalahan saat memposting komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tambahkan fungsi untuk menghapus komentar
  const handleDeleteComment = async (type: 'agenda' | 'informasi', commentId: number) => {
    try {
      const table = type === 'agenda' ? 'agenda_comments' : 'informasi_comments';
      
      // Delete comment from database
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', commentId); // Gunakan eq daripada match

      if (error) {
        console.error('Error deleting comment:', error);
        return;
      }

      // Update local state
      if (selectedItem) {
        const updatedComments = selectedItem.data.comments?.filter(
          comment => comment.id !== commentId
        ) || [];

        setSelectedItem({
          ...selectedItem,
          data: {
            ...selectedItem.data,
            comments: updatedComments
          }
        });

        // Update the lists state as well
        if (type === 'agenda') {
          setAgendas(prev => prev.map(agenda => 
            agenda.id === selectedItem.data.id 
              ? { ...agenda, comments: updatedComments }
              : agenda
          ));
        } else {
          setInformasis(prev => prev.map(info => 
            info.id === selectedItem.data.id 
              ? { ...info, comments: updatedComments }
              : info
          ));
        }

        // Refresh data setelah menghapus komentar
        fetchAgendaAndInformasi();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Update fungsi handleEditComment
  const handleEditComment = async (type: 'agenda' | 'informasi', commentId: number, newContent: string) => {
    try {
      if (!newContent.trim()) {
        console.error('Content cannot be empty');
        return;
      }

      const table = type === 'agenda' ? 'agenda_comments' : 'informasi_comments';
      
      // Update comment in database
      const { data: updatedComment, error } = await supabase
        .from(table)
        .update({ 
          content: newContent,
          // Add updated_at timestamp
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      if (!updatedComment) {
        throw new Error('No comment was updated');
      }

      // Update local state
      if (selectedItem) {
        const updatedComments = selectedItem.data.comments?.map(comment =>
          comment.id === commentId
            ? { 
                ...comment, 
                content: newContent,
                updated_at: new Date().toISOString()
              }
            : comment
        ) || [];

        setSelectedItem({
          ...selectedItem,
          data: {
            ...selectedItem.data,
            comments: updatedComments
          }
        });

        // Update the lists state as well
        if (type === 'agenda') {
          setAgendas(prev => prev.map(agenda => 
            agenda.id === selectedItem.data.id 
              ? { ...agenda, comments: updatedComments }
              : agenda
          ));
        } else {
          setInformasis(prev => prev.map(info => 
            info.id === selectedItem.data.id 
              ? { ...info, comments: updatedComments }
              : info
          ));
        }

        // Refresh data to ensure consistency
        await fetchAgendaAndInformasi();
      }

      // Reset editing state
      setEditingComment(null);

    } catch (error) {
      console.error('Error updating comment:', error instanceof Error ? error.message : 'Unknown error');
      // Optionally show error to user
      alert('Gagal memperbarui komentar. Silakan coba lagi.');
    }
  };

  // Fungsi untuk mengambil statistik
  const fetchVisitorStats = async () => {
    const stats = await getVisitorStats();
    if (stats) {
      setVisitorStats(stats);
    }
  };

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-white">
      <Navbar />
      
      {/* Hero Section Full Screen */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <Image
          className="object-cover brightness-[0.9] scale-105 animate-slow-zoom"
          src="/r-tkj.jpg"
          alt="SMKN 4 Bogor"
          fill
          priority
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 flex items-center justify-center"
        >
          <div className="text-center text-white max-w-4xl px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              SMK Negeri 4 Bogor
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 text-gray-200"
            >
              Unggul dalam Prestasi, Berkarakter, dan Berwawasan Lingkungan
            </motion.p>
            <motion.a 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              href="#explore"
              className="inline-block border border-white/30 hover:bg-white hover:text-black transition-all duration-300 rounded-full px-8 py-3 text-lg backdrop-blur-sm"
            >
              Jelajahi
            </motion.a>
          </div>
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Sambutan Kepala Sekolah */}
      <section id="explore" className="py-24 px-4 md:px-8 bg-white">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center"
        >
          <motion.div 
            variants={fadeIn}
            className="w-full md:w-1/3"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                className="object-cover hover:scale-105 transition-transform duration-700"
                src="/kepala-sekolah.jpg"
                alt="Kepala SMKN 4 Bogor"
                fill
              />
            </div>
          </motion.div>
          <motion.div 
            variants={fadeIn}
            className="w-full md:w-2/3"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Sambutan Kepala Sekolah</h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              Selamat datang di website resmi SMKN 4 Bogor. Sebagai lembaga pendidikan kejuruan,
              kami berkomitmen untuk menghasilkan lulusan yang kompeten, berkarakter, dan siap
              menghadapi tantangan dunia kerja modern.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Dengan dukungan fasilitas modern dan tenaga pengajar profesional, kami terus berinovasi 
              dalam memberikan pendidikan berkualitas bagi generasi penerus bangsa.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Program Keahlian */}
      <section className="py-24 px-4 md:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-white"
          >
            Program Keahlian
          </motion.h2>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {jurusans.map((jurusan, index) => (
              <motion.div
                key={jurusan.id}
                variants={fadeIn}
                className="bg-zinc-900 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="p-8">
                  <div className="flex flex-col gap-6">
                    {/* Icon dan Gambar Container */}
                    <div className="flex gap-4 items-center">
                      {/* Icon */}
                      <div className={`relative w-16 h-16 rounded-xl overflow-hidden ${jurusan.warna} flex items-center justify-center flex-shrink-0`}>
                        {jurusan.id === 1 && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                          </svg>
                        )}
                        {jurusan.id === 2 && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        )}
                        {jurusan.id === 3 && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        )}
                        {jurusan.id === 4 && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                      {/* Gambar */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={jurusan.image}
                          alt={jurusan.nama}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Konten */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{jurusan.nama}</h3>
                        <p className="text-gray-400 text-sm">{jurusan.deskripsi}</p>
                      </div>
                      <Link 
                        href="/jurusan"
                        className="inline-flex items-center text-white hover:gap-2 transition-all duration-300"
                      >
                        <span>Pelajari Lebih Lanjut</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agenda dan Informasi */}
      <section className="py-24 px-4 md:px-8 bg-[#f8f8f8]">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* Agenda */}
          <motion.div variants={fadeIn} className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agenda
            </h2>
            <div className="space-y-6">
              {agendas.map((agenda) => (
                <div 
                  key={agenda.id} 
                  className="group relative bg-white border border-gray-100 hover:border-blue-500 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedItem({ type: 'agenda', data: agenda })}
                >
                  <div className="flex gap-4">
                    {/* Foto Agenda dengan overlay gradient */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      {agenda.post?.galery?.[0]?.foto?.[0]?.file ? (
                        <>
                          <Image
                            src={agenda.post.galery[0].foto[0].file}
                            alt={agenda.judul}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Konten Agenda */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {new Date(agenda.tanggal).toLocaleDateString('id-ID', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {agenda.waktu && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                            {agenda.waktu}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {agenda.judul}
                      </h3>
                      {agenda.lokasi && (
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {agenda.lokasi}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1 group/like">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike('agenda', agenda.id);
                            }}
                            className="hover:text-red-500 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill={agenda.is_liked ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </button>
                          <span className="group-hover/like:text-red-500 transition-colors">
                            {agenda.likes_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>{agenda.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Informasi */}
          <motion.div variants={fadeIn} className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informasi
            </h2>
            <div className="space-y-6">
              {informasis.map((info) => (
                <div 
                  key={info.id} 
                  className="group relative bg-white border border-gray-100 hover:border-indigo-500 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedItem({ type: 'informasi', data: info })}
                >
                  <div className="flex gap-4">
                    {/* Foto Informasi dengan overlay gradient */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      {info.post?.galery?.[0]?.foto?.[0]?.file ? (
                        <>
                          <Image
                            src={info.post.galery[0].foto[0].file}
                            alt={info.judul}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Konten Informasi */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-sm ${
                          info.keterangan === 'penting' ? 'bg-red-500/20 text-red-500' :
                          info.keterangan === 'pengumuman' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {info.keterangan}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(info.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {info.judul}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{info.isi}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1 group/like">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike('informasi', info.id);
                            }}
                            className="hover:text-red-500 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill={info.is_liked ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </button>
                          <span className="group-hover/like:text-red-500 transition-colors">
                            {info.likes_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>{info.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Galeri */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-gray-900"
          >
            Galeri Kegiatan
          </motion.h2>
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {fotos.map((foto, index) => (
              <motion.div
                key={foto.id}
                variants={fadeIn}
                className="relative aspect-square group overflow-hidden rounded-xl"
              >
                <Image
                  src={foto.file}
                  alt={foto.judul}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white/90 mb-2">
                      {foto.galery?.post?.kategori?.judul}
                    </span>
                    <h3 className="text-white font-bold text-xl">
                      {foto.judul}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-8">
            <Link 
              href="/galeri"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Lihat Semua Galeri
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik Pengunjung */}
      <section className="py-24 px-4 md:px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16"
          >
            Statistik Pengunjung Website
          </motion.h2>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Total Pengunjung */}
            <motion.div
              variants={fadeIn}
              className="text-center"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2">{visitorStats.todayVisitors}</div>
                <div className="text-gray-300">Total Pengunjung</div>
                <div className="text-sm text-green-400 mt-2">
                  +12% dari bulan lalu
                </div>
              </div>
            </motion.div>

            {/* Rata-rata Durasi */}
            <motion.div
              variants={fadeIn}
              className="text-center"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {Math.floor(visitorStats.averageDuration / 60)}:{(visitorStats.averageDuration % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-gray-300">Rata-rata Durasi</div>
                <div className="text-sm text-green-400 mt-2">
                  +2 menit dari minggu lalu
                </div>
              </div>
            </motion.div>

            {/* Pengunjung Aktif */}
            <motion.div
              variants={fadeIn}
              className="text-center"
            >
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2">{visitorStats.activeVisitors}</div>
                <div className="text-gray-300">Pengunjung Aktif</div>
                <div className="text-sm text-green-400 mt-2">
                  23 sedang membaca
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mitra Industri */}
      <section className="py-24 px-4 md:px-8 bg-blue-900 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-16 text-gray-900"
          >
            Mitra Industri
          </motion.h2>
          
          {/* Infinite Scroll Container */}
          <div className="relative">
            <div className="flex gap-8 animate-scroll">
              {/* First set of logos */}
              <div className="flex gap-8 min-w-max">
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/bonet.png"
                    alt="Partner 1"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/honda.svg"
                    alt="Partner 2"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/komatsu.svg"
                    alt="Partner 3"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/iconnet.png"
                    alt="Partner 4"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Duplicate set for seamless scrolling */}
              <div className="flex gap-8 min-w-max">
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/bonet.png"
                    alt="Partner 1"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/honda.svg"
                    alt="Partner 2"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/komatsu.svg"
                    alt="Partner 3"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="w-[200px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <Image
                    src="/iconnet.png"
                    alt="Partner 4"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />

      {/* Modal for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedItem.type === 'agenda' ? 'Agenda' : 'Informasi'}
                </h3>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Like dan Komentar Section */}
              <div className="border-t mt-6 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleLike(selectedItem.type, selectedItem.data.id)}
                    className={`flex items-center gap-2 ${
                      selectedItem.data.is_liked ? 'text-red-500' : 'text-gray-500'
                    } hover:text-red-500 transition-colors`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={selectedItem.data.is_liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{selectedItem.data.likes_count} Suka</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    {selectedItem.data.comments?.length || 0} Komentar
                  </div>
                </div>

                {/* Komentar Section */}
                <div className="space-y-4">
                  {/* Daftar Komentar */}
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {selectedItem.data.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {comment.user_name ? comment.user_name[0]?.toUpperCase() : '?'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3 relative group">
                            <div className="font-medium text-sm text-gray-900 mb-1">
                              {comment.user_name}
                            </div>
                            
                            {editingComment?.id === comment.id ? (
                              // Edit mode
                              <div className="space-y-2">
                                <textarea
                                  value={editingComment.content}
                                  onChange={(e) => setEditingComment({
                                    ...editingComment,
                                    content: e.target.value
                                  })}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={() => handleEditComment(
                                      selectedItem.type,
                                      comment.id,
                                      editingComment.content
                                    )}
                                    disabled={!editingComment.content.trim()}
                                    className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
                                  >
                                    Simpan
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <>
                                <p className="text-sm text-gray-600">{comment.content}</p>
                                
                                {/* Action buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingComment({
                                        id: comment.id,
                                        content: comment.content,
                                        user_name: comment.user_name
                                      });
                                    }}
                                    className="p-1 rounded-full bg-white shadow-sm hover:bg-blue-50"
                                  >
                                    <svg 
                                      className="w-4 h-4 text-blue-500" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteComment(selectedItem.type, comment.id);
                                    }}
                                    className="p-1 rounded-full bg-white shadow-sm hover:bg-red-50"
                                  >
                                    <svg 
                                      className="w-4 h-4 text-red-500" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form Komentar */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={commentatorName}
                      onChange={(e) => setCommentatorName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Tulis komentar..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleComment(selectedItem.type, selectedItem.data.id)}
                        disabled={isSubmitting || !newComment.trim() || !commentatorName.trim()}
                        className={`px-4 py-2 rounded-lg ${
                          isSubmitting || !newComment.trim() || !commentatorName.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white transition-colors`}
                      >
                        {isSubmitting ? 'Mengirim...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              {selectedItem.type === 'agenda' ? (
                <div className="space-y-4">
                  {/* Foto Agenda */}
                  {selectedItem.data.post?.galery?.[0]?.foto?.[0]?.file && (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                      <Image
                        src={selectedItem.data.post.galery[0].foto[0].file}
                        alt={selectedItem.data.judul}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Agenda Details */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900">{selectedItem.data.judul}</h4>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(selectedItem.data.tanggal).toLocaleDateString('id-ID', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                      {selectedItem.data.waktu && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selectedItem.data.waktu}</span>
                        </div>
                      )}
                    </div>
                    {selectedItem.data.lokasi && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{selectedItem.data.lokasi}</span>
                      </div>
                    )}
                    <p className="text-gray-600">{selectedItem.data.deskripsi}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Foto Informasi */}
                  {selectedItem.data.post?.galery?.[0]?.foto?.[0]?.file && (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                      <Image
                        src={selectedItem.data.post.galery[0].foto[0].file}
                        alt={selectedItem.data.judul}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Informasi Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedItem.data.keterangan === 'penting' ? 'bg-red-500/20 text-red-500' :
                        selectedItem.data.keterangan === 'pengumuman' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {selectedItem.data.keterangan}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedItem.data.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedItem.data.judul}</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedItem.data.isi}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
