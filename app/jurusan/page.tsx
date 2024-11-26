"use client";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { motion } from "framer-motion";

export default function Jurusan() {
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

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Program Keahlian
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Pilih masa depanmu dengan program keahlian unggulan yang sesuai dengan minat dan bakatmu
          </motion.p>
        </div>
      </section>

      {/* Jurusan Cards */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {jurusans.map((jurusan, index) => (
              <motion.div
                key={jurusan.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-zinc-900 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Icon dan Gambar Container */}
                    <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
                      {/* Icon */}
                      <div className={`relative w-16 h-16 rounded-xl overflow-hidden ${jurusan.warna} flex items-center justify-center flex-shrink-0`}>
                        {jurusan.id === 1 && (
                          <svg className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                          </svg>
                        )}
                        {jurusan.id === 2 && (
                          <svg className="w-14 h-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        )}
                        {jurusan.id === 3 && (
                          <svg className="w-14 h-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        )}
                        {jurusan.id === 4 && (
                          <svg className="w-14 h-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="flex-1 space-y-6">
                      {/* Header */}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {jurusan.nama}
                        </h3>
                        <p className="text-lg text-gray-400">
                          {jurusan.singkatan}
                        </p>
                      </div>

                      {/* Deskripsi */}
                      <p className="text-gray-300 leading-relaxed">
                        {jurusan.deskripsi}
                      </p>

                      {/* Kompetensi */}
                      <div className="bg-black/30 rounded-xl p-6">
                        <h4 className="font-semibold text-white mb-4">
                          Kompetensi yang dipelajari:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {jurusan.kompetensi.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                jurusan.id === 1 ? 'bg-blue-400' :
                                jurusan.id === 2 ? 'bg-purple-400' :
                                jurusan.id === 3 ? 'bg-orange-400' :
                                'bg-red-400'
                              }`} />
                              <span className="text-gray-300">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
