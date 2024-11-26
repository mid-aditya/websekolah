"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface Stats {
  totalPosts: number;
  totalFotos: number;
  totalAgendas: number;
  totalInformasis: number;
}

interface RecentActivity {
  id: number;
  type: 'foto' | 'agenda' | 'informasi';
  title: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalFotos: 0,
    totalAgendas: 0,
    totalInformasis: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const [posts, fotos, agendas, informasis] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('foto').select('id', { count: 'exact' }),
        supabase.from('agenda').select('id', { count: 'exact' }),
        supabase.from('informasi').select('id', { count: 'exact' })
      ]);

      setStats({
        totalPosts: posts.count || 0,
        totalFotos: fotos.count || 0,
        totalAgendas: agendas.count || 0,
        totalInformasis: informasis.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: fotos } = await supabase
        .from('foto')
        .select('id, judul, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: agendas } = await supabase
        .from('agenda')
        .select('id, judul, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: informasis } = await supabase
        .from('informasi')
        .select('id, judul, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = [
        ...(fotos?.map(f => ({ id: f.id, type: 'foto' as const, title: f.judul, timestamp: f.created_at })) || []),
        ...(agendas?.map(a => ({ id: a.id, type: 'agenda' as const, title: a.judul, timestamp: a.created_at })) || []),
        ...(informasis?.map(i => ({ id: i.id, type: 'informasi' as const, title: i.judul, timestamp: i.created_at })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Overview statistik website</p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Foto</p>
              <p className="text-2xl font-bold text-white">{stats.totalFotos}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Agenda</p>
              <p className="text-2xl font-bold text-white">{stats.totalAgendas}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Informasi</p>
              <p className="text-2xl font-bold text-white">{stats.totalInformasis}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={`${activity.type}-${activity.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
            >
              <div className={`p-3 rounded-xl ${
                activity.type === 'foto' ? 'bg-blue-500/20 text-blue-400' :
                activity.type === 'agenda' ? 'bg-green-500/20 text-green-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {activity.type === 'foto' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : activity.type === 'agenda' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.title}</p>
                <p className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 