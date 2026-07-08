'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);

  // 1. Guard route client-side
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      const isLoginPage = pathname === '/admin/login';
      
      if (!session) {
        setAuthenticated(false);
        if (!isLoginPage) {
          router.replace('/admin/login');
        }
      } else {
        setAuthenticated(true);
        if (isLoginPage) {
          router.replace('/admin');
        }
      }
    }
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoginPage = pathname === '/admin/login';
      if (!session) {
        setAuthenticated(false);
        if (!isLoginPage) {
          router.replace('/admin/login');
        }
      } else {
        setAuthenticated(true);
        if (isLoginPage) {
          router.replace('/admin');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // 2. Fetch new orders count periodically for the navigation badge
  useEffect(() => {
    if (authenticated === false || pathname === '/admin/login') return;

    async function fetchNewOrdersCount() {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'جديد');

        if (!error && count !== null) {
          setNewOrdersCount(count);
        }
      } catch (err) {
        console.error('Error fetching new orders badge:', err);
      }
    }

    fetchNewOrdersCount();

    // Poll every 20 seconds to keep dashboard updated
    const interval = setInterval(fetchNewOrdersCount, 20000);
    return () => clearInterval(interval);
  }, [authenticated, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  const isLoginPage = pathname === '/admin/login';

  // Show loading indicator while resolving session status
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#D4AF37]">
        <div className="text-center space-y-4">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl"></i>
          <p className="text-sm font-semibold tracking-wider">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // If we are on the login page, render children directly without dashboard borders
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Active state checker for menu
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex flex-col md:flex-row items-center gap-1 md:gap-3 py-2 px-3 md:py-3.5 md:px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
        : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-cairo">
      
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex md:w-64 bg-[#121212] border-l border-[#D4AF37] border-opacity-10 flex-col justify-between p-6 select-none shrink-0">
        <div className="space-y-8">
          
          {/* Header Brand */}
          <div className="flex items-center gap-3 border-b border-gray-900 pb-5">
            <span className="text-xl font-bold tracking-widest text-[#D4AF37] font-luxury">SCENT HOUSE</span>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold">إدارة</span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2 flex flex-col">
            <Link href="/admin" className={getLinkClass('/admin')}>
              <i className="fa-solid fa-gauge text-base"></i>
              <span>لوحة التحكم</span>
            </Link>

            <Link href="/admin/products" className={getLinkClass('/admin/products')}>
              <i className="fa-solid fa-box-open text-base"></i>
              <span>إدارة المنتجات</span>
            </Link>

            <Link href="/admin/orders" className={getLinkClass('/admin/orders')}>
              <div className="relative flex items-center gap-3 w-full">
                <i className="fa-solid fa-receipt text-base"></i>
                <span className="flex-1 text-right">طلبات الشراء</span>
                {newOrdersCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-extrabold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full animate-bounce english-num">
                    {newOrdersCount}
                  </span>
                )}
              </div>
            </Link>

            <Link href="/admin/visitors" className={getLinkClass('/admin/visitors')}>
              <i className="fa-solid fa-users text-base"></i>
              <span>إحصائيات الزوار</span>
            </Link>

            <Link href="/admin/content" className={getLinkClass('/admin/content')}>
              <i className="fa-solid fa-pen-to-square text-base"></i>
              <span>إدارة المحتوى</span>
            </Link>

            <Link href="/admin/settings" className={getLinkClass('/admin/settings')}>
              <i className="fa-solid fa-gears text-base"></i>
              <span>إعدادات الحساب</span>
            </Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-900 pt-5 space-y-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">
              م
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">المدير العام</p>
              <p className="text-[10px] text-gray-500">admin@scenthouse.com</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-900/30 transition-all duration-300 cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (Navigation & Info) ── */}
      <header className="md:hidden bg-[#121212] border-b border-[#D4AF37] border-opacity-10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 select-none">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-wider text-[#D4AF37] font-luxury">SCENT HOUSE</span>
          <span className="bg-amber-500/10 text-amber-500 text-[8px] px-1.5 py-0.5 rounded-full font-bold">إدارة</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-red-400 text-sm flex items-center gap-1.5 font-bold hover:text-red-300"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="text-xs">خروج</span>
        </button>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#D4AF37] border-opacity-10 px-2 py-2 flex justify-around items-center z-40 shadow-2xl backdrop-blur-md">
        <Link href="/admin" className={getLinkClass('/admin')}>
          <i className="fa-solid fa-gauge text-sm"></i>
          <span className="text-[10px] mt-0.5">الرئيسية</span>
        </Link>

        <Link href="/admin/products" className={getLinkClass('/admin/products')}>
          <i className="fa-solid fa-box-open text-sm"></i>
          <span className="text-[10px] mt-0.5">المنتجات</span>
        </Link>

        <Link href="/admin/orders" className={getLinkClass('/admin/orders')}>
          <div className="relative flex flex-col items-center">
            <i className="fa-solid fa-receipt text-sm"></i>
            <span className="text-[10px] mt-0.5">الطلبات</span>
            {newOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-red-600 text-white text-[8px] font-extrabold h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full animate-bounce english-num">
                {newOrdersCount}
              </span>
            )}
          </div>
        </Link>

        <Link href="/admin/visitors" className={getLinkClass('/admin/visitors')}>
          <i className="fa-solid fa-users text-sm"></i>
          <span className="text-[10px] mt-0.5">الزوار</span>
        </Link>

        <Link href="/admin/content" className={getLinkClass('/admin/content')}>
          <i className="fa-solid fa-pen-to-square text-sm"></i>
          <span className="text-[10px] mt-0.5">المحتوى</span>
        </Link>

        <Link href="/admin/settings" className={getLinkClass('/admin/settings')}>
          <i className="fa-solid fa-gears text-sm"></i>
          <span className="text-[10px] mt-0.5">الإعدادات</span>
        </Link>
      </nav>
    </div>
  );
}
