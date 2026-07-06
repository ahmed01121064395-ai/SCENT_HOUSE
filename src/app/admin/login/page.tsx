'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated on mount
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/admin');
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Handle "Admin" display label. If username is "Admin" or "admin", map to "admin@scenthouse.com"
    let email = username.trim();
    if (email.toLowerCase() === 'admin') {
      email = 'admin@scenthouse.com';
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          setError('لم يتم تأكيد البريد الإلكتروني. يرجى تشغيل كود التأكيد أولاً.');
        } else if (signInError.message === 'Invalid login credentials') {
          setError('خطأ في اسم المستخدم أو كلمة المرور.');
        } else {
          setError(signInError.message);
        }
      } else {
        router.push('/admin');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ أثناء الاتصال بالخادم.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] bg-opacity-95 p-4 select-none relative overflow-hidden" style={{ backgroundImage: "linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.98)), url('/images/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Decorative Gold Glows */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#D4AF37] opacity-5 blur-[120px] top-[-50px] left-[-50px]"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#D4AF37] opacity-5 blur-[120px] bottom-[-50px] right-[-50px]"></div>

      <div className="w-full max-w-md bg-[#121212] border border-[#D4AF37] border-opacity-20 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative w-20 h-20 rounded-full border border-[#D4AF37] border-opacity-30 overflow-hidden mb-4 p-1 bg-[#0A0A0A]">
            <Image
              src="/images/LOGO.jpg"
              alt="Logo"
              fill
              className="object-cover rounded-full p-1"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold font-luxury tracking-widest text-[#D4AF37] mb-1">SCENT HOUSE</h1>
          <p className="text-gray-400 text-xs font-semibold">لوحة تحكم دار العطور الفاخرة</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950 bg-opacity-40 border border-red-500 border-opacity-30 text-red-300 rounded-lg p-3 text-sm text-center mb-6 animate-pulse">
            <i className="fa-solid fa-circle-exclamation ml-2"></i> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email / Username Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">اسم المستخدم أو البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="أدخل الاسم (Admin) أو البريد الإلكتروني"
                className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-3 px-4 text-white text-sm outline-none transition-all duration-300 pr-10 focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-50 text-right"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="absolute right-3 top-3.5 text-gray-500 text-sm">
                <i className="fa-regular fa-user"></i>
              </span>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور الخاصة بالإدارة"
                className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-3 px-4 text-white text-sm outline-none transition-all duration-300 pr-10 focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-50 text-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="absolute right-3 top-3.5 text-gray-500 text-sm">
                <i className="fa-solid fa-lock"></i>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-black font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                <span>جاري التحقق والدخول...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>تسجيل الدخول للإدارة</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Brand Note */}
        <div className="text-center mt-8 pt-6 border-t border-gray-900 text-gray-600 text-[10px]">
          &copy; 2026 دار العطور - Scent House. جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  );
}
