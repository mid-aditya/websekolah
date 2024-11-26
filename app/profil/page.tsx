"use client";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { motion } from "framer-motion";

export default function Profil() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      {/* Tentang Sekolah */}
      <section className="pt-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative mb-20"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-1 bg-gray-700"></div>
            <h1 className="text-5xl md:text-6xl font-bold text-center bg-clip-text text-white">
              Profil Sekolah
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gray-800/60 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] rounded-xl overflow-hidden group">
                <Image
                  src="/lapangan.jpg"
                  alt="SMKN 4 Bogor"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-gray-700 text-white rounded-full text-sm">
                  Established 2008
                </div>
                <p className="text-lg leading-relaxed text-gray-300">
                  SMKN 4 Bogor merupakan sekolah kejuruan berbasis Teknologi Informasi dan Komunikasi. 
                  Sekolah ini didirikan dan dirintis pada tahun 2008 kemudian dibuka pada tahun 2009 yang 
                  saat ini terakreditasi A.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-gray-700 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-3xl font-bold text-white">12.724</div>
                    <div className="text-gray-400">m² Luas Area</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-3xl font-bold text-white">76</div>
                    <div className="text-gray-400">Staff & Pengajar</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-gray-800/60 p-8 rounded-2xl backdrop-blur-lg border border-gray-700 hover:bg-gray-700/60 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent text-white">
                  Visi
                </h2>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg italic">
                "Terwujudnya SMK Pusat Keunggulan melalui terciptanya pelajar pancasila yang berbasis teknologi, 
                berwawasan lingkungan dan berkewirausahaan."
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-gray-800/60 p-8 rounded-2xl backdrop-blur-lg border border-gray-700 hover:bg-gray-700/60 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent text-white">
                  Misi
                </h2>
              </div>
              <ul className="space-y-4 text-gray-300">
                {[
                  "Mewujudkan karakter pelajar pancasila beriman dan bertaqwa",
                  "Mengembangkan pembelajaran berbasis teknologi",
                  "Mengembangkan sekolah berwawasan Adiwiyata",
                  "Mengembangkan kemandirian dan daya saing"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Kepala Sekolah */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gray-800/60 backdrop-blur-lg p-8 rounded-2xl border border-gray-700"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gray-700 rounded-full text-white font-bold">
              Kepala Sekolah
            </div>
            
            <div className="flex flex-col md:flex-row gap-12 items-center mt-8">
              <div className="w-full md:w-1/3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                  <Image
                    src="/kepala-sekolah.jpg"
                    alt="Kepala Sekolah"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-6">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent text-white">
                  Drs. Mulya Murprihartono, M.Si.
                </h2>
                <div className="inline-block px-4 py-2 bg-gray-700 text-white rounded-full text-sm">
                  Kepala Sekolah Ke-3, Juli 2020 - sekarang
                </div>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Sejak satu tahun lalu SMKN 4 Kota Bogor dipimpin oleh seseorang yang membawa warna baru, 
                    tahun pertama sejak dilantik, tepatnya pada tanggal 10 Juli 2020, inovasi dan kebijakan-kebijakan 
                    baru pun mulai dirancang.
                  </p>
                  <p>
                    Bukan tanpa kesulitan, penuh tantangan tapi beliau meyakinkan untuk selalu optimis pada harapan 
                    dengan bersinergi mewujudkan visi misi SMKN 4 Bogor ditengah kesulitan pandemi ini.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
