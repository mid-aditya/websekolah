"use client";
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabase-storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Foto {
  id: number;
  file: string;
  judul: string;
  galery_id: number;
}

export default function FotoManager() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [judul, setJudul] = useState('');
  const [galeryId, setGaleryId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFotos();
  }, []);

  const fetchFotos = async () => {
    try {
      const { data, error } = await supabase
        .from('foto')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      setFotos(data || []);
    } catch (err: any) {
      console.error('Error fetching photos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJudul('');
    setGaleryId('');
    setSelectedFile(null);
    setEditingId(null);
    if (document.getElementById('fileInput') instanceof HTMLInputElement) {
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !judul || !galeryId) return;

    try {
      setLoading(true);
      const imageUrl = await uploadImage(selectedFile);

      const { error } = await supabase
        .from('foto')
        .insert([{
          file: imageUrl,
          judul,
          galery_id: parseInt(galeryId)
        }]);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      resetForm();
      fetchFotos();
    } catch (err: any) {
      console.error('Error creating photo:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (foto: Foto) => {
    setEditingId(foto.id);
    setJudul(foto.judul);
    setGaleryId(foto.galery_id.toString());
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      setLoading(true);

      const updateData: Partial<Foto> = {
        judul,
        galery_id: parseInt(galeryId)
      };

      if (selectedFile) {
        const imageUrl = await uploadImage(selectedFile);
        updateData.file = imageUrl;
      }

      const { error } = await supabase
        .from('foto')
        .update(updateData)
        .eq('id', editingId);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      resetForm();
      fetchFotos();
    } catch (err: any) {
      console.error('Error updating photo:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('foto')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      fetchFotos();
    } catch (err: any) {
      console.error('Error deleting photo:', err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Manajemen Foto</h1>

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
            Galeri ID
          </label>
          <input
            type="number"
            value={galeryId}
            onChange={(e) => setGaleryId(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foto
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : editingId ? 'Update' : 'Tambah'} Foto
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="ml-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Batal
          </button>
        )}
      </form>

      {/* Grid Foto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fotos.map((foto) => (
          <div key={foto.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={foto.file}
                alt={foto.judul}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-white mb-2">{foto.judul}</h3>
              <button
                onClick={() => handleDelete(foto.id)}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Hapus
              </button>
              <button
                onClick={() => handleEdit(foto)}
                className="text-blue-500 hover:text-blue-400 mr-4"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 