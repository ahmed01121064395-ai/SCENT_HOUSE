'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface VisitorsStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  dailyChartData: { label: string; count: number }[];
}

export default function AdminVisitors() {
  const [stats, setStats] = useState<VisitorsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVisitorsStats() {
      try {
        setLoading(true);

        const now = new Date();
        
        // 1. Fetch visits for the last 30 days to compute stats
        const startOf30DaysAgo = new Date();
        startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);
        startOf30DaysAgo.setHours(0, 0, 0, 0);

        const { data: visitsData, error: vErr } = await supabase
          .from('site_visits')
          .select('created_at')
          .gte('created_at', startOf30DaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (vErr) throw vErr;
        const visits = visitsData || [];

        // 2. Aggregate Today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayCount = visits.filter(v => new Date(v.created_at) >= startOfToday).length;

        // 3. Aggregate This Week (Last 7 days)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);
        const weekCount = visits.filter(v => new Date(v.created_at) >= startOfWeek).length;

        // 4. Aggregate This Month (Last 30 days)
        const monthCount = visits.length;

        // 5. Aggregate Daily visits for the last 14 days
        const dailyChartData = Array.from({ length: 14 }).map((_, i) => {
          const day = new Date();
          day.setDate(day.getDate() - i);
          day.setHours(0, 0, 0, 0);
          return day;
        }).reverse().map(day => {
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);

          const count = visits.filter(v => {
            const vDate = new Date(v.created_at);
            return vDate >= day && vDate < nextDay;
          }).length;

          // Label format: e.g., '5/7' or 'الأحد 5'
          const label = day.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' });
          return { label, count };
        });

        setStats({
          todayCount,
          weekCount,
          monthCount,
          dailyChartData
        });
      } catch (err) {
        console.error('Error fetching visitor statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVisitorsStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-8 bg-gray-900 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
          <div className="h-32 bg-gray-900 rounded-2xl"></div>
        </div>
        <div className="h-80 bg-gray-900 rounded-2xl"></div>
      </div>
    );
  }

  const maxChartCount = Math.max(...stats.dailyChartData.map(d => d.count), 1);

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2">
          <i className="fa-solid fa-users"></i> إحصائيات زوار المتجر
        </h1>
        <p className="text-xs text-gray-400 mt-1">تقارير حركة المرور اليومية، الأسبوعية والشهرية لـ Scent House</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's count */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">زوار اليوم</p>
          <h3 className="text-3xl font-extrabold mt-2 font-english text-[#D4AF37]">{stats.todayCount}</h3>
          <p className="text-[10px] text-gray-500 mt-4">إجمالي الزيارات الفردية الموثقة اليوم</p>
        </div>

        {/* Weekly count */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">زوار هذا الأسبوع</p>
          <h3 className="text-3xl font-extrabold mt-2 font-english text-gray-200">{stats.weekCount}</h3>
          <p className="text-[10px] text-gray-500 mt-4">الزيارات التراكمية في آخر 7 أيام</p>
        </div>

        {/* Monthly count */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">زوار هذا الشهر</p>
          <h3 className="text-3xl font-extrabold mt-2 font-english text-gray-200">{stats.monthCount}</h3>
          <p className="text-[10px] text-gray-500 mt-4">الزيارات التراكمية في آخر 30 يوماً</p>
        </div>

      </div>

      {/* Daily Visitors 14-days Chart Card */}
      <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-[#D4AF37]"></i> مخطط حركة الزوار اليومية (آخر 14 يوماً)
          </h2>
          <span className="text-[10px] text-gray-500 font-bold">بعدد الزيارات</span>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-72 flex items-end justify-around pt-6 px-1 md:px-4 relative">
          
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] border-b border-gray-700 py-6">
            <div className="border-t border-white w-full"></div>
            <div className="border-t border-white w-full"></div>
            <div className="border-t border-white w-full"></div>
            <div className="border-t border-white w-full"></div>
          </div>

          {stats.dailyChartData.map((d, index) => {
            const heightPercent = (d.count / maxChartCount) * 80; // keep max bar at 80% height
            return (
              <div key={index} className="flex flex-col items-center group w-[6%] relative z-10">
                
                {/* Tooltip */}
                <div className="absolute -top-10 bg-black border border-[#D4AF37]/40 text-[#D4AF37] px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                  {d.count} زائر
                </div>

                {/* Bar */}
                <div 
                  className="w-3 md:w-5 rounded-t bg-gradient-to-t from-[#AA7C11]/70 to-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300 relative overflow-hidden"
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-white/20"></div>
                </div>

                {/* Label */}
                <span className="text-[9px] md:text-[10px] text-gray-500 font-bold mt-3 font-english text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Notice Info Footer */}
        <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-800 flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-[#D4AF37] text-sm mt-0.5"></i>
          <p className="text-xs text-gray-400 leading-relaxed text-right">
            لوحة تحكم الزوار تسجل فقط البصمات الزمنية لكل جلسة دخول جديدة على المتجر بدون جمع أي بيانات شخصية (مثل الأسماء أو أرقام الهواتف أو عناوين الـ IP) حرصاً على خصوصية عملاء الدار.
          </p>
        </div>
      </div>

    </div>
  );
}
