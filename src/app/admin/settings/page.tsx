'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminSettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

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
    </div>
  );
}
