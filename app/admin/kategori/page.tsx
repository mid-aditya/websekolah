"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Kategori {
  id: number;
  judul: string;
}

export default function KategoriManager() {
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [judul, setJudul] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchKategoris();
  }, []);

  const fetchKategoris = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setKategoris(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('kategori')
          .update({ judul })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kategori')
          .insert([{ judul }]);

        if (error) throw error;
      }

      setJudul('');
      setEditingId(null);
      fetchKategoris();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (kategori: Kategori) => {
    setJudul(kategori.judul);
    setEditingId(kategori.id);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('kategori')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchKategoris();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Kategori</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Judul Kategori
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {editingId ? 'Update' : 'Tambah'} Kategori
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setJudul('');
                setEditingId(null);
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Judul</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kategoris.map((kategori) => (
              <tr key={kategori.id} className="border-b border-gray-800">
                <td className="py-3 px-4">{kategori.id}</td>
                <td className="py-3 px-4">{kategori.judul}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(kategori)}
                    className="text-blue-500 hover:text-blue-400 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(kategori.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 