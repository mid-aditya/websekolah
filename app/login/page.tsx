"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const { data, error } = await supabase
        .from('petugas')
        .select()
        .eq('username', username)
        .eq('password', password)
        .single();

      if (data) {
        document.cookie = `admin=${JSON.stringify(data)}; path=/; max-age=86400`;
        toast.success('Login berhasil!');
        router.push('/admin');
      } else {
        toast.error('Username atau password salah');
      }
    } catch (error) {
      toast.error('Gagal masuk. Silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');  // Arahkan ke halaman utama
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">SMKN 4 Bogor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white text-white"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg focus:outline-none focus:border-white text-white"
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>

            {/* Button to go to the home page */}
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full mt-4 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Go to Home
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
