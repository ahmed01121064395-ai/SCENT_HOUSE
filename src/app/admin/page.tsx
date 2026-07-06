'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';
import { formatLongDate, formatWeekdayShortDate, formatPriceVal } from '@/lib/formatters';

interface DashboardStats {
  newOrders: number;
  monthlySales: number;
  todayVisitors: number;
  topLikedProducts: (Product & { likes: number })[];
  topSellingProducts: (Product & { salesCount: number })[];
  weeklyChartData: { label: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // 1. Fetch products (source of thumbnails & metadata)
        const { data: productsData, error: pErr } = await supabase
          .from('products')
          .select('*');
        const products: Product[] = productsData || [];

        // 2. Fetch all orders for calculations
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, created_at, grandTotal, status')
          .order('created_at', { ascending: false });
        const orders = ordersData || [];

        // 3. Calculate new orders count
        const newOrders = orders.filter(o => o.status === 'جديد').length;

        // 4. Calculate monthly sales
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlySales = orders
          .filter(o => new Date(o.created_at) >= startOfMonth && o.status !== 'ملغي')
          .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

        // 5. Fetch today's visitors count
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const { count: todayVisitors, error: vErr } = await supabase
          .from('site_visits')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfToday.toISOString());

        // 6. Fetch most liked products (top 5)
        const { data: likesData } = await supabase
          .from('product_likes')
          .select('product_id');
        const likeCounts: Record<number, number> = {};
        likesData?.forEach(l => {
          likeCounts[l.product_id] = (likeCounts[l.product_id] || 0) + 1;
        });

        const topLikedProducts = [...products]
          .map(p => ({ ...p, likes: likeCounts[p.id] || 0 }))
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 5);

        // 7. Fetch best-selling products (top 3) from order_items
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select('productId, quantity');
        const itemSales: Record<number, number> = {};
        orderItemsData?.forEach(item => {
          itemSales[item.productId] = (itemSales[item.productId] || 0) + item.quantity;
        });

        const topSellingProducts = [...products]
          .map(p => ({ ...p, salesCount: itemSales[p.id] || 0 }))
          .sort((a, b) => b.salesCount - a.salesCount)
          .filter(p => p.salesCount > 0)
          .slice(0, 3);

        // 8. Generate last 7 days chart data
        const weeklyChartData = Array.from({ length: 7 }).map((_, i) => {
          const day = new Date();
          day.setDate(day.getDate() - i);
          day.setHours(0, 0, 0, 0);
          return day;
        }).reverse().map(day => {
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);

          const count = orders.filter(o => {
            const oDate = new Date(o.created_at);
            return oDate >= day && oDate < nextDay;
          }).length;

          const label = formatWeekdayShortDate(day);
          return { label, count };
        });

        setStats({
          newOrders,
          monthlySales,
          todayVisitors: todayVisitors || 0,
          topLikedProducts,
          topSellingProducts,
          weeklyChartData
        });
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-900 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-gray-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Find max count in chart to scale SVG bar heights dynamically
  const maxChartCount = Math.max(...stats.weeklyChartData.map(d => d.count), 1);

  return (
    <div className="space-y-8 select-none">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37]">أهلاً بك في لوحة تحكم سنت هاوس 👋</h1>
          <p className="text-xs text-gray-400 mt-1">نظرة عامة على مبيعات الدار وإحصائيات الزوار لهذا اليوم</p>
        </div>
        <div className="text-xs bg-[#121212] border border-gray-800 rounded-xl py-2.5 px-4 font-bold text-gray-400 self-start md:self-auto">
          <i className="fa-regular fa-clock ml-2 text-[#D4AF37]"></i>
          <span>التاريخ الحالي: </span>
          <span className="text-white font-english font-semibold">
            {formatLongDate(new Date())}
          </span>
        </div>
      </div>

      {/* Quick Shortcuts Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 bg-[#121212] border border-gray-800 p-3 md:p-4 rounded-2xl">
        <Link href="/admin/orders" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-gray-800 hover:border-[#D4AF37]/30 transition-all duration-300 group">
          <i className="fa-solid fa-receipt text-lg md:text-xl text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] md:text-xs font-bold text-gray-300">الطلبات</span>
        </Link>
        <Link href="/admin/products" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-gray-800 hover:border-[#D4AF37]/30 transition-all duration-300 group">
          <i className="fa-solid fa-box-open text-lg md:text-xl text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] md:text-xs font-bold text-gray-300">المنتجات</span>
        </Link>
        <Link href="/admin/visitors" className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-gray-800 hover:border-[#D4AF37]/30 transition-all duration-300 group">
          <i className="fa-solid fa-users text-lg md:text-xl text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] md:text-xs font-bold text-gray-300">التحليلات</span>
        </Link>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI: New Orders */}
        <div className={`border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
          stats.newOrders > 0 
            ? 'bg-amber-950/20 border-yellow-600/30 shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
            : 'bg-[#121212] border-gray-800'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">عدد الطلبات الجديدة</p>
              <h3 className="text-3xl font-extrabold mt-2 font-english">{stats.newOrders}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-sm ${
              stats.newOrders > 0 
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] animate-pulse' 
                : 'bg-gray-800/40 text-gray-400 border-gray-800'
            }`}>
              <i className="fa-solid fa-bell"></i>
            </div>
          </div>
          {stats.newOrders > 0 && (
            <div className="text-[10px] font-bold text-amber-500 mt-4 flex items-center gap-1.5 animate-bounce">
              <i className="fa-solid fa-circle text-[6px]"></i>
              <span>يوجد طلبات جديدة بانتظار التجهيز حالياً</span>
            </div>
          )}
        </div>

        {/* KPI: Sales This Month */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">مبيعات هذا الشهر</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-3xl font-extrabold font-english text-[#D4AF37]">{formatPriceVal(stats.monthlySales)}</h3>
                <span className="text-[10px] font-bold text-gray-500">جنيه</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center text-sm">
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-4">الإيرادات المحققة منذ بداية الشهر الحالي</p>
        </div>

        {/* KPI: Today's Visitors */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">زوار الموقع اليوم</p>
              <h3 className="text-3xl font-extrabold mt-2 font-english">{stats.todayVisitors}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-sm">
              <i className="fa-solid fa-eye"></i>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-4">إجمالي الزيارات الفردية الموثقة للمتجر اليوم</p>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Charts Box */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-chart-bar text-[#D4AF37]"></i> مؤشر المبيعات (آخر 7 أيام)
            </h2>
            <span className="text-[10px] text-gray-500 font-bold">بالطلب اليومي</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full h-64 flex items-end justify-around pt-6 px-2 md:px-6 relative select-none">
            
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] border-b border-gray-700 py-6">
              <div className="border-t border-white w-full"></div>
              <div className="border-t border-white w-full"></div>
              <div className="border-t border-white w-full"></div>
              <div className="border-t border-white w-full"></div>
            </div>

            {stats.weeklyChartData.map((d, index) => {
              const heightPercent = (d.count / maxChartCount) * 80; // keep max bar at 80% height for padding
              return (
                <div key={index} className="flex flex-col items-center group w-1/8 relative z-10">
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 bg-black border border-[#D4AF37]/40 text-[#D4AF37] px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                    {d.count} طلبات
                  </div>

                  {/* Bar */}
                  <div 
                    className="w-8 md:w-10 rounded-t-lg bg-gradient-to-t from-[#AA7C11]/80 to-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }} // minimum height of 4% for style
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20"></div>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] text-gray-400 font-bold mt-3 font-english text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Rank/Info Widgets */}
        <div className="space-y-6">
          
          {/* Top 3 Selling Products */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-crown text-[#D4AF37]"></i> الأكثر مبيعاً (أعلى 3)
            </h2>

            <div className="space-y-4">
              {stats.topSellingProducts.length === 0 ? (
                <div className="text-center text-xs text-gray-600 py-6">لم يتم تسجيل مبيعات منتجات بعد</div>
              ) : (
                stats.topSellingProducts.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-3 bg-[#1A1A1A] p-2.5 rounded-xl border border-gray-800">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-xs font-black text-[#D4AF37] shrink-0 font-english">
                      {index + 1}
                    </div>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-200 truncate">{p.name.split(' - ')[0]}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{p.categoryNameAr}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#D4AF37] font-english">{p.salesCount}</span>
                      <span className="text-[8px] text-gray-500 font-bold block">مباع</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top 5 Wishlisted/Liked Products */}
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-heart text-[#D4AF37]"></i> الأكثر تفضيلاً (أعلى 5)
            </h2>

            <div className="space-y-3.5">
              {stats.topLikedProducts.filter(p => p.likes > 0).length === 0 ? (
                <div className="text-center text-xs text-gray-600 py-6">لا توجد إعجابات مسجلة بالwishlist</div>
              ) : (
                stats.topLikedProducts.filter(p => p.likes > 0).map((p, index) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-200 truncate">{p.name.split(' - ')[0]}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#D4AF37] font-english text-xs font-black shrink-0 bg-[#D4AF37]/5 px-2.5 py-1 rounded-full border border-[#D4AF37]/10">
                      <i className="fa-solid fa-heart text-[10px] text-red-500"></i>
                      <span>{p.likes}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
