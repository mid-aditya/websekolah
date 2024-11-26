import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fungsi untuk mendapatkan IP pengunjung
export const getVisitorIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return null;
  }
};

// Fungsi untuk mencatat kunjungan baru
export const recordVisit = async (page: string) => {
  try {
    const ip = await getVisitorIp();
    if (!ip) return;

    const { data, error } = await supabase
      .from('visitor_stats')
      .insert({
        ip_address: ip,
        page_visited: page
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording visit:', error);
  }
};

// Fungsi untuk mencatat waktu keluar
export const recordExit = async (ip: string) => {
  try {
    const { data: visit } = await supabase
      .from('visitor_stats')
      .select()
      .eq('ip_address', ip)
      .is('exit_time', null)
      .order('visit_time', { ascending: false })
      .limit(1)
      .single();

    if (visit) {
      const exitTime = new Date();
      const duration = Math.floor((exitTime.getTime() - new Date(visit.visit_time).getTime()) / 1000);

      await supabase
        .from('visitor_stats')
        .update({
          exit_time: exitTime.toISOString(),
          duration: duration
        })
        .eq('id', visit.id);
    }
  } catch (error) {
    console.error('Error recording exit:', error);
  }
};

// Fungsi untuk mendapatkan statistik pengunjung
export const getVisitorStats = async () => {
  try {
    // Total pengunjung hari ini
    const today = new Date().toISOString().split('T')[0];
    const { count: todayVisitors } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact' })
      .eq('visit_date', today);

    // Rata-rata durasi kunjungan (dalam detik)
    const { data: durationData } = await supabase
      .from('visitor_stats')
      .select('duration')
      .not('duration', 'is', null)
      .limit(100);

    const averageDuration = durationData?.reduce((acc, curr) => acc + (curr.duration || 0), 0) / (durationData?.length || 1);

    // Pengunjung aktif (dalam 5 menit terakhir)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeVisitors } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact' })
      .gt('visit_time', fiveMinutesAgo)
      .is('exit_time', null);

    // Data untuk grafik mingguan
    const weeklyData = await getWeeklyStats();

    return {
      todayVisitors: todayVisitors || 0,
      averageDuration: Math.round(averageDuration || 0),
      activeVisitors: activeVisitors || 0,
      weeklyData
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan statistik mingguan
const getWeeklyStats = async () => {
  const days = [];
  const counts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const { count } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact' })
      .eq('visit_date', dateStr);
    
    days.push(['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()]);
    counts.push(count || 0);
  }

  return { days, counts };
}; 