"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabase-storage';
import Image from 'next/image';

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  keterangan: 'penting' | 'biasa' | 'pengumuman';
  status: string;
  post_id: number;
  post?: {
    galery?: {
      foto?: {
        file: string;
      }[];
    }[];
  };
}

export default function InformasiManager() {
  const [informasis, setInformasis] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState<'penting' | 'biasa' | 'pengumuman'>('biasa');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInformasis();
  }, []);

  const fetchInformasis = async () => {
    try {
      const { data, error } = await supabase
        .from('informasi')
        .select(`
          *,
          post:post_id (
            galery (
              foto (
                file
              )
            )
          )
        `)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      setInformasis(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const petugasId = 1; // Get from auth context in real app

      // Create post first
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{
          judul,
          kategori_id: 4, // ID kategori 'Informasi'
          isi,
          petugas_id: petugasId,
          status: 'aktif'
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Create informasi
      const { error: informasiError } = await supabase
        .from('informasi')
        .insert([{
          judul,
          isi,
          tanggal,
          keterangan,
          petugas_id: petugasId,
          post_id: postData.id,
          status: 'aktif'
        }]);

      if (informasiError) throw informasiError;

      // If there's a file, create gallery and upload photo
      if (selectedFile) {
        // Create gallery
        const { data: galleryData, error: galleryError } = await supabase
          .from('galery')
          .insert([{
            post_id: postData.id,
            position: 1,
            status: 1
          }])
          .select()
          .single();

        if (galleryError) throw galleryError;

        // Upload image and get URL
        const imageUrl = await uploadImage(selectedFile);

        // Create foto
        const { error: fotoError } = await supabase
          .from('foto')
          .insert([{
            galery_id: galleryData.id,
            file: imageUrl,
            judul: `Foto ${judul}`
          }]);

        if (fotoError) throw fotoError;
      }

      resetForm();
      fetchInformasis();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (info: Informasi) => {
    try {
      // Delete informasi will automatically delete related post due to cascade
      const { error } = await supabase
        .from('informasi')
        .delete()
        .eq('id', info.id);

      if (error) throw error;
      fetchInformasis();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setJudul('');
    setIsi('');
    setTanggal('');
    setKeterangan('biasa');
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleEdit = (info: Informasi) => {
    setEditingId(info.id);
    setJudul(info.judul);
    setIsi(info.isi);
    setTanggal(info.tanggal);
    setKeterangan(info.keterangan);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setLoading(true);

      // Update informasi
      const { error: informasiError } = await supabase
        .from('informasi')
        .update({
          judul,
          isi,
          tanggal,
          keterangan,
          status: 'aktif'
        })
        .eq('id', editingId);

      if (informasiError) throw informasiError;

      // Jika ada file baru
      if (selectedFile) {
        // Get post_id dari informasi
        const { data: informasiData } = await supabase
          .from('informasi')
          .select('post_id')
          .eq('id', editingId)
          .single();

        if (informasiData?.post_id) {
          // Get galery_id dari post
          const { data: galeryData } = await supabase
            .from('galery')
            .select('id')
            .eq('post_id', informasiData.post_id)
            .single();

          if (galeryData) {
            // Upload image baru
            const imageUrl = await uploadImage(selectedFile);

            // Update atau insert foto baru
            const { error: fotoError } = await supabase
              .from('foto')
              .upsert({
                galery_id: galeryData.id,
                file: imageUrl,
                judul: `Foto ${judul}`
              });

            if (fotoError) throw fotoError;
          }
        }
      }

      resetForm();
      fetchInformasis();
    } catch (error) {
      console.error('Error updating informasi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Manajemen Informasi</h1>

      {/* Form */}
      <form onSubmit={editingId ? handleUpdate : handleSubmit} className="mb-8 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Judul
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Isi
          </label>
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white min-h-[200px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Keterangan
          </label>
          <select
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value as 'penting' | 'biasa' | 'pengumuman')}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
            required
          >
            <option value="biasa">Biasa</option>
            <option value="penting">Penting</option>
            <option value="pengumuman">Pengumuman</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foto
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
          />
        </div>

        <button
          type="submit"
          onClick={editingId ? handleUpdate : handleSubmit}
          disabled={loading}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : editingId ? 'Update' : 'Tambah'} Informasi
        </button>
      </form>

      {/* List Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {informasis.map((info) => (
          <div key={info.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            {info.post?.galery?.[0]?.foto?.[0]?.file && (
              <div className="relative h-48">
                <Image
                  src={info.post.galery[0].foto[0].file}
                  alt={info.judul}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <span className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                info.keterangan === 'penting' ? 'bg-red-500/20 text-red-500' :
                info.keterangan === 'pengumuman' ? 'bg-blue-500/20 text-blue-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                {info.keterangan}
              </span>
              <h3 className="font-bold text-white mb-2">{info.judul}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {new Date(info.tanggal).toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{info.isi}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(info)}
                  className="text-blue-500 hover:text-blue-400 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(info)}
                  className="text-red-500 hover:text-red-400"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 