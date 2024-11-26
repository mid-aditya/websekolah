"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Post {
  id: number;
  judul: string;
  kategori_id: number;
  isi: string;
  petugas_id: number;
  status: string;
  created_at: string;
  kategori: {
    judul: string;
  }
}

interface Kategori {
  id: number;
  judul: string;
}

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [isi, setIsi] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetchPosts();
    fetchKategoris();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          kategori (
            judul
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoris = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori')
        .select('*')
        .order('judul', { ascending: true });

      if (error) throw error;
      setKategoris(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const petugasId = 1; // Get this from auth context in real app

      if (editingId) {
        const { error } = await supabase
          .from('posts')
          .update({
            judul,
            kategori_id: parseInt(kategoriId),
            isi,
            status,
            petugas_id: petugasId
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([{
            judul,
            kategori_id: parseInt(kategoriId),
            isi,
            status,
            petugas_id: petugasId
          }]);

        if (error) throw error;
      }

      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setJudul(post.judul);
    setKategoriId(post.kategori_id.toString());
    setIsi(post.isi);
    setStatus(post.status);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setKategoriId('');
    setIsi('');
    setStatus('draft');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Posts</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Judul
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kategori
          </label>
          <select
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2"
            required
          >
            <option value="">Pilih Kategori</option>
            {kategoris.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.judul}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Isi
          </label>
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2 min-h-[200px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-zinc-900 rounded-lg p-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {editingId ? 'Update' : 'Tambah'} Post
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
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
              <th className="py-3 px-4">Judul</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-800">
                <td className="py-3 px-4">{post.judul}</td>
                <td className="py-3 px-4">{post.kategori?.judul}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded ${
                    post.status === 'published' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-500 hover:text-blue-400 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
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