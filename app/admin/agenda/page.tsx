"use client";
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabase-storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Agenda {
  id: number;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
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

export default function AgendaManager() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda')
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
      setAgendas(data || []);
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
          kategori_id: 3, // ID kategori 'Agenda'
          isi: deskripsi,
          petugas_id: petugasId,
          status: 'aktif'
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Create agenda
      const { error: agendaError } = await supabase
        .from('agenda')
        .insert([{
          judul,
          tanggal,
          waktu,
          lokasi,
          deskripsi,
          petugas_id: petugasId,
          post_id: postData.id,
          status: 'aktif'
        }]);

      if (agendaError) throw agendaError;

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
      fetchAgendas();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agenda: Agenda) => {
    try {
      // Delete agenda will automatically delete related post due to cascade
      const { error } = await supabase
        .from('agenda')
        .delete()
        .eq('id', agenda.id);

      if (error) throw error;
      fetchAgendas();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setJudul('');
    setTanggal('');
    setWaktu('');
    setLokasi('');
    setDeskripsi('');
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleEdit = (agenda: Agenda) => {
    setEditingId(agenda.id);
    setJudul(agenda.judul);
    setTanggal(agenda.tanggal);
    setWaktu(agenda.waktu || '');
    setLokasi(agenda.lokasi || '');
    setDeskripsi(agenda.deskripsi);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setLoading(true);

      // Update agenda
      const { error: agendaError } = await supabase
        .from('agenda')
        .update({
          judul,
          tanggal,
          waktu,
          lokasi,
          deskripsi,
          status: 'aktif'
        })
        .eq('id', editingId);

      if (agendaError) throw agendaError;

      // Jika ada file baru
      if (selectedFile) {
        // Get post_id dari agenda
        const { data: agendaData } = await supabase
          .from('agenda')
          .select('post_id')
          .eq('id', editingId)
          .single();

        if (agendaData?.post_id) {
          // Get galery_id dari post
          const { data: galeryData } = await supabase
            .from('galery')
            .select('id')
            .eq('post_id', agendaData.post_id)
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
      fetchAgendas();
    } catch (error) {
      console.error('Error updating agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Manajemen Agenda</h1>

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
            Waktu
          </label>
          <input
            type="time"
            value={waktu}
            onChange={(e) => setWaktu(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lokasi
          </label>
          <input
            type="text"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deskripsi
          </label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white min-h-[100px]"
            required
          />
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
          {loading ? 'Loading...' : editingId ? 'Update' : 'Tambah'} Agenda
        </button>
      </form>

      {/* List Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agendas.map((agenda) => (
          <div key={agenda.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            {agenda.post?.galery?.[0]?.foto?.[0]?.file && (
              <div className="relative h-48">
                <Image
                  src={agenda.post.galery[0].foto[0].file}
                  alt={agenda.judul}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-white mb-2">{agenda.judul}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {new Date(agenda.tanggal).toLocaleDateString()} {agenda.waktu}
              </p>
              <p className="text-gray-400 text-sm mb-4">{agenda.lokasi}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(agenda)}
                  className="text-blue-500 hover:text-blue-400 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(agenda)}
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