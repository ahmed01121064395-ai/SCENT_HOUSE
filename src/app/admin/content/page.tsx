'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/Toast';

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Announcement Bar State
  const [announcementBarText, setAnnouncementBarText] = useState('');

  // Hero Section State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroVideo1Url, setHeroVideo1Url] = useState('');
  const [heroVideo2Url, setHeroVideo2Url] = useState('');

  // Social Links State
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Contact Info State
  const [contactPhone1, setContactPhone1] = useState('');
  const [contactPhone2, setContactPhone2] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  // Category Pages Titles/Subs State
  const [menCategoryTitle, setMenCategoryTitle] = useState('');
  const [menCategorySubtitle, setMenCategorySubtitle] = useState('');
  const [womenCategoryTitle, setWomenCategoryTitle] = useState('');
  const [womenCategorySubtitle, setWomenCategorySubtitle] = useState('');
  const [giftCategoryTitle, setGiftCategoryTitle] = useState('');
  const [giftCategorySubtitle, setGiftCategorySubtitle] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        setAnnouncementBarText(data.announcement_bar_text || '');
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setHeroVideo1Url(data.hero_video_1_url || '');
        setHeroVideo2Url(data.hero_video_2_url || '');
        setFacebookUrl(data.facebook_url || '');
        setInstagramUrl(data.instagram_url || '');
        setTiktokUrl(data.tiktok_url || '');
        setContactPhone1(data.contact_phone_1 || '');
        setContactPhone2(data.contact_phone_2 || '');
        setContactAddress(data.contact_address || '');
        setWorkingHours(data.working_hours || '');
        setMenCategoryTitle(data.men_category_title || '');
        setMenCategorySubtitle(data.men_category_subtitle || '');
        setWomenCategoryTitle(data.women_category_title || '');
        setWomenCategorySubtitle(data.women_category_subtitle || '');
        setGiftCategoryTitle(data.gift_category_title || '');
        setGiftCategorySubtitle(data.gift_category_subtitle || '');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      showToast('خطأ في تحميل بيانات الإعدادات والمحتوى', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  async function handleSaveSection(sectionName: string, payload: any) {
    try {
      setSavingSection(sectionName);
      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', 1);

      if (error) throw error;
      showToast('تم حفظ التعديلات بنجاح وتحديث الموقع فوراً', 'success');
    } catch (err: any) {
      console.error(`Error saving section ${sectionName}:`, err);
      showToast(`خطأ في الحفظ: ${err.message || err}`, 'error');
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-[#D4AF37]">
        <i className="fa-solid fa-circle-notch animate-spin text-3xl"></i>
        <p className="text-xs text-gray-400 mt-3 font-cairo">جاري تحميل إعدادات المحتوى...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-cairo text-right" dir="rtl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-gray-900">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-100 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-[#D4AF37] text-lg"></i>
            إدارة محتوى المتجر (CMS)
          </h1>
          <p className="text-xs text-gray-400 mt-1">تعديل كافة النصوص الثابتة، معلومات الاتصال، روابط التواصل والعروض</p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* SECTION 1: Announcement Bar */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="text-sm md:text-base font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-bullhorn text-[#D4AF37] text-xs"></i>
              شريط الإعلانات العلوي
            </h3>
            <button
              onClick={() => handleSaveSection('announcement', { announcement_bar_text: announcementBarText })}
              disabled={savingSection === 'announcement'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-1.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {savingSection === 'announcement' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold">نص الإعلان (الظاهر في أعلى المتجر)</label>
            <input
              type="text"
              value={announcementBarText}
              onChange={(e) => setAnnouncementBarText(e.target.value)}
              className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
              placeholder="مثال: ✨ شحن سريع ومجاني لجميع طلبات العروض..."
            />
          </div>
        </div>

        {/* SECTION 2: Hero Section */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="text-sm md:text-base font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-image text-[#D4AF37] text-xs"></i>
              الواجهة الترحيبية الرئيسية (Hero Section)
            </h3>
            <button
              onClick={() => handleSaveSection('hero', {
                hero_title: heroTitle,
                hero_subtitle: heroSubtitle,
                hero_video_1_url: heroVideo1Url,
                hero_video_2_url: heroVideo2Url
              })}
              disabled={savingSection === 'hero'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-1.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {savingSection === 'hero' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">العنوان الرئيسي</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">العنوان الفرعي (شعار الترحيب)</label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">رابط الفيديو الترويجي الأول (mp4)</label>
              <input
                type="text"
                value={heroVideo1Url}
                onChange={(e) => setHeroVideo1Url(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                dir="ltr"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">رابط الفيديو الترويجي الثاني (mp4)</label>
              <input
                type="text"
                value={heroVideo2Url}
                onChange={(e) => setHeroVideo2Url(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Social Media Links */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="text-sm md:text-base font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-share-nodes text-[#D4AF37] text-xs"></i>
              روابط التواصل الاجتماعي
            </h3>
            <button
              onClick={() => handleSaveSection('socials', {
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                tiktok_url: tiktokUrl
              })}
              disabled={savingSection === 'socials'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-1.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {savingSection === 'socials' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                <i className="fa-brands fa-facebook text-[#1877F2]"></i> فيسبوك
              </label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                dir="ltr"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                <i className="fa-brands fa-instagram text-[#E1306C]"></i> إنستغرام
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                dir="ltr"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                <i className="fa-brands fa-tiktok text-gray-200"></i> تيك توك
              </label>
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Contact details */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="text-sm md:text-base font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-address-card text-[#D4AF37] text-xs"></i>
              معلومات الاتصال وأوقات العمل
            </h3>
            <button
              onClick={() => handleSaveSection('contact', {
                contact_phone_1: contactPhone1,
                contact_phone_2: contactPhone2,
                contact_address: contactAddress,
                working_hours: workingHours
              })}
              disabled={savingSection === 'contact'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-1.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {savingSection === 'contact' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">رقم الهاتف الأول (رئيسي)</label>
              <input
                type="text"
                value={contactPhone1}
                onChange={(e) => setContactPhone1(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                dir="ltr"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">رقم الهاتف الثاني (احتياطي)</label>
              <input
                type="text"
                value={contactPhone2}
                onChange={(e) => setContactPhone2(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                dir="ltr"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">العنوان الجغرافي للدار</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
              />
            </div>
            <div className="form-group flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-bold">أوقات وساعات العمل</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Category Shop Headers */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <h3 className="text-sm md:text-base font-bold text-gray-200 flex items-center gap-2">
              <i className="fa-solid fa-tags text-[#D4AF37] text-xs"></i>
              عناوين وتفاصيل صفحات التصنيفات
            </h3>
            <button
              onClick={() => handleSaveSection('categories', {
                men_category_title: menCategoryTitle,
                men_category_subtitle: menCategorySubtitle,
                women_category_title: womenCategoryTitle,
                women_category_subtitle: womenCategorySubtitle,
                gift_category_title: giftCategoryTitle,
                gift_category_subtitle: giftCategorySubtitle
              })}
              disabled={savingSection === 'categories'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-1.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {savingSection === 'categories' ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Men's category */}
            <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
              <h4 className="text-xs text-[#D4AF37] font-black">العطور الرجالية</h4>
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={menCategoryTitle}
                  onChange={(e) => setMenCategoryTitle(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                />
              </div>
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">الوصف أو العنوان الفرعي</label>
                <input
                  type="text"
                  value={menCategorySubtitle}
                  onChange={(e) => setMenCategorySubtitle(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                />
              </div>
            </div>

            {/* Women's category */}
            <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
              <h4 className="text-xs text-[#D4AF37] font-black">العطور النسائية</h4>
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={womenCategoryTitle}
                  onChange={(e) => setWomenCategoryTitle(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                />
              </div>
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">الوصف أو العنوان الفرعي</label>
                <input
                  type="text"
                  value={womenCategorySubtitle}
                  onChange={(e) => setWomenCategorySubtitle(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                />
              </div>
            </div>

            {/* Gifts category */}
            <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800 md:col-span-2">
              <h4 className="text-xs text-[#D4AF37] font-black">بوكسات الهدايا</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={giftCategoryTitle}
                    onChange={(e) => setGiftCategoryTitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">الوصف أو العنوان الفرعي</label>
                  <input
                    type="text"
                    value={giftCategorySubtitle}
                    onChange={(e) => setGiftCategorySubtitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
