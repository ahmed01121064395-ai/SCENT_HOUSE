'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function AdminSettings() {
  const { theme, setTheme } = useApp();
  const [selectedTheme, setSelectedTheme] = useState<'current' | 'monochrome_gold'>(theme);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeMessage, setThemeMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ text: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'كلمتا المرور غير متطابقتين.', isError: true });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({ text: `خطأ أثناء التحديث: ${error.message}`, isError: true });
      } else {
        setMessage({ text: 'تم تحديث كلمة المرور بنجاح!', isError: false });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
      setMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2">
          <i className="fa-solid fa-gears"></i> إعدادات حساب المسؤول
        </h1>
        <p className="text-xs text-gray-400 mt-1">تحديث كلمة مرور الحساب وتفضيلات النظام الأمنية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Change Password Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-3 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-key text-[#D4AF37]"></i> تغيير كلمة المرور
          </h2>

          {message && (
            <div className={`p-4 rounded-xl text-xs md:text-sm text-center mb-6 border ${
              message.isError 
                ? 'bg-red-950/20 border-red-500/30 text-red-300' 
                : 'bg-green-950/20 border-green-500/30 text-green-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور الجديدة (6 خانات على الأقل)"
                className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-3 px-4 text-white text-sm outline-none transition-all duration-300 focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-50 text-right"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                placeholder="أعد إدخال كلمة المرور للتأكيد"
                className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-3 px-4 text-white text-sm outline-none transition-all duration-300 focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-50 text-right"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-black font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  <span>جاري التحديث...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>حفظ كلمة المرور الجديدة</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Info Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-[#D4AF37]"></i> نصائح أمنية للمسؤول
            </h2>
            <ul className="space-y-3 text-xs text-gray-400 leading-relaxed list-disc list-inside">
              <li>تأكد من استخدام كلمة مرور قوية تحتوي على رموز وأرقام وحروف كبيرة وصغيرة.</li>
              <li>لا تشارك بيانات الاعتماد الخاصة بـ "Admin" مع أي شخص غير مصرح له.</li>
              <li>يتم حفظ كلمة المرور مباشرة بشكل مشفر وآمن تماماً في قاعدة بيانات Supabase Auth.</li>
              <li>عند تغيير كلمة المرور بنجاح، سيتم تحديث صلاحيتك ولن يتطلب منك تعديل أي كود برمجي في الموقع.</li>
            </ul>
          </div>
          
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-center">
            <span className="text-[10px] font-bold text-gray-500 block mb-1">البريد الإلكتروني للإدارة</span>
            <span className="text-xs font-bold text-[#D4AF37] english-num">admin@scenthouse.com</span>
          </div>
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 max-w-4xl mt-8 select-none">
        <h2 className="text-sm font-bold text-gray-200 border-b border-gray-800 pb-3 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-palette text-[#D4AF37]"></i> مظهر الموقع للعملاء (Appearance settings)
        </h2>

        {themeMessage && (
          <div className={`p-4 rounded-xl text-xs md:text-sm text-center mb-6 border ${
            themeMessage.isError 
              ? 'bg-red-950/20 border-red-500/30 text-red-300' 
              : 'bg-green-950/20 border-green-500/30 text-green-300'
          }`}>
            {themeMessage.text}
          </div>
        )}

        <form onSubmit={async (e) => {
          e.preventDefault();
          setThemeMessage(null);
          setThemeSaving(true);
          try {
            await setTheme(selectedTheme);
            setThemeMessage({ text: 'تم تحديث مظهر الموقع بنجاح وسيظهر لجميع الزوار فوراً! 🎉', isError: false });
          } catch (err) {
            setThemeMessage({ text: 'حدث خطأ أثناء حفظ الإعدادات، يرجى تشغيل كود SQL لإنشاء الجدول.', isError: true });
          } finally {
            setThemeSaving(false);
          }
        }} className="space-y-6">
          <p className="text-xs text-gray-400">تنبيه: هذا الإعداد يغير مظهر واجهة العميل فقط. لوحة التحكم للمسؤول ستحتفظ دائماً بمظهرها الداكن والذهبي الفاخر لحماية راحة العين.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme option 1: Dark (Current) */}
            <div
              onClick={() => setSelectedTheme('current')}
              className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] transition-all duration-300 ${
                selectedTheme === 'current' 
                  ? 'border-[#D4AF37] bg-[#1A1A1A]' 
                  : 'border-gray-800 bg-[#161616] hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-200">الوضع الحالي (الداكن الفاخر)</span>
                <input
                  type="radio"
                  name="theme"
                  checked={selectedTheme === 'current'}
                  onChange={() => setSelectedTheme('current')}
                  className="accent-[#D4AF37]"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">المظهر الكلاسيكي لدار سنت هاوس بخلفية سوداء غامقة ونصوص بيضاء وتفاصيل ذهبية مذهلة.</p>
              
              {/* Swatch dots */}
              <div className="flex gap-2 mt-4">
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#0A0A0A' }} title="خلفية"></span>
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#FFFFFF' }} title="نص"></span>
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#D4AF37' }} title="ذهبي"></span>
              </div>
            </div>

            {/* Theme option 2: Monochrome Gold */}
            <div
              onClick={() => setSelectedTheme('monochrome_gold')}
              className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] transition-all duration-300 ${
                selectedTheme === 'monochrome_gold' 
                  ? 'border-[#D4AF37] bg-[#1A1A1A]' 
                  : 'border-gray-800 bg-[#161616] hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-200">أبيض وأسود وذهبي (الفاتح الراقي)</span>
                <input
                  type="radio"
                  name="theme"
                  checked={selectedTheme === 'monochrome_gold'}
                  onChange={() => setSelectedTheme('monochrome_gold')}
                  className="accent-[#D4AF37]"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">مظهر عصري مشرق بخلفية بيضاء نقية ونصوص سوداء داكنة مع بقاء اللون الذهبي الفاخر للماركة.</p>
              
              {/* Swatch dots */}
              <div className="flex gap-2 mt-4">
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#FFFFFF' }} title="خلفية"></span>
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#0A0A0A' }} title="نص"></span>
                <span className="w-4 h-4 rounded-full border border-gray-800" style={{ backgroundColor: '#D4AF37' }} title="ذهبي"></span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={themeSaving}
            className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-black font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {themeSaving ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                <span>جاري الحفظ وتطبيق المظهر...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i>
                <span>حفظ وتطبيق المظهر</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
