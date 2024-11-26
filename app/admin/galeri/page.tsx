"use client";
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Galeri {
  id: number;
  post_id: number;
  position: number;
  status: number;
  posts: {
    judul: string;
  };
  foto: {
    id: number;
    file: string;
    judul: string;
  }[];
}

export default function GaleriManager() {
  const [galeris, setGaleris] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<number>(1);
  const [postId, setPostId] = useState('');

  useEffect(() => {
    fetchGaleris();
  }, []);

  const fetchGaleris = async () => {
    try {
      const { data, error } = await supabase
        .from('galery')
        .select(`
          id,
          post_id,
          position,
          status,
          posts!post_id (
            id,
            judul
          ),
          foto!galery_id (
            id,
            file,
            judul
          )
        `)
        .order('position', { ascending: true });

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      // Transform data dengan type safety
      const transformedData = (data || []).map(item => ({
        id: item.id,
        post_id: item.post_id,
        position: item.position,
        status: item.status,
        posts: {
          judul: item.posts?.judul || '',
        },
        foto: item.foto || []
      }));

      setGaleris(transformedData);
    } catch (err: any) {
      console.error('Error fetching galleries:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (galeri: Galeri) => {
    setEditingId(galeri.id);
    setPosition(galeri.position.toString());
    setStatus(galeri.status);
    setPostId(galeri.post_id.toString());
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('galery')
        .update({
          position: parseInt(position),
          status,
          post_id: parseInt(postId)
        })
        .eq('id', editingId);

      if (error) throw error;

      resetForm();
      fetchGaleris();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('galery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchGaleris();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setPosition('');
    setStatus(1);
    setPostId('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Manajemen Galeri</h1>

      {/* Form */}
      <form onSubmit={editingId ? handleUpdate : undefined} className="mb-8 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Position
          </label>
          <input
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(parseInt(e.target.value))}
            className="w-full bg-zinc-900 rounded-lg p-2 text-white"
          >
            <option value={1}>Aktif</option>
            <option value={0}>Nonaktif</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : editingId ? 'Update' : 'Tambah'} Galeri
        </button>
      </form>

      {/* List Galeri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galeris.map((galeri) => (
          <div key={galeri.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            {galeri.foto?.[0]?.file && (
              <div className="relative h-48">
                <Image
                  src={galeri.foto[0].file}
                  alt={galeri.foto[0].judul}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-white mb-2">{galeri.posts?.judul}</h3>
              <p className="text-gray-400 text-sm mb-2">Position: {galeri.position}</p>
              <p className="text-gray-400 text-sm mb-4">
                Status: {galeri.status === 1 ? 'Aktif' : 'Nonaktif'}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(galeri)}
                  className="text-blue-500 hover:text-blue-400 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(galeri.id)}
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