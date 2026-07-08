'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/Toast';
import Image from 'next/image';

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<'settings' | 'features' | 'testimonials' | 'coupons' | 'boxTypes'>('settings');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────
  // STAGE 1 STATES: Site Settings
  // ────────────────────────────────────────────────────────────────
  const [announcementBarText, setAnnouncementBarText] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroVideo1Url, setHeroVideo1Url] = useState('');
  const [heroVideo2Url, setHeroVideo2Url] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [contactPhone1, setContactPhone1] = useState('');
  const [contactPhone2, setContactPhone2] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [menCategoryTitle, setMenCategoryTitle] = useState('');
  const [menCategorySubtitle, setMenCategorySubtitle] = useState('');
  const [womenCategoryTitle, setWomenCategoryTitle] = useState('');
  const [womenCategorySubtitle, setWomenCategorySubtitle] = useState('');
  const [giftCategoryTitle, setGiftCategoryTitle] = useState('');
  const [giftCategorySubtitle, setGiftCategorySubtitle] = useState('');

  // ────────────────────────────────────────────────────────────────
  // STAGE 2 STATES
  // ────────────────────────────────────────────────────────────────
  const [featuresList, setFeaturesList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [boxTypesList, setBoxTypesList] = useState<any[]>([]);

  // Modals / Forms for Stage 2
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'feature' | 'coupon' | 'boxType' | 'testimonial' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form inputs
  const [featureIcon, setFeatureIcon] = useState('fa-gem');
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureOrder, setFeatureOrder] = useState('1');

  const [couponCode, setCouponCodeInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('10');
  const [couponActive, setCouponActive] = useState(true);

  const [boxName, setBoxName] = useState('');
  const [boxCode, setBoxCode] = useState('');
  const [boxOrder, setBoxOrder] = useState('1');

  const [testimonialFile, setTestimonialFile] = useState<File | null>(null);
  const [testimonialOrder, setTestimonialOrder] = useState('1');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      
      // Load Stage 1 Settings
      const { data: settingsData, error: sErr } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (sErr) throw sErr;

      if (settingsData) {
        setAnnouncementBarText(settingsData.announcement_bar_text || '');
        setHeroTitle(settingsData.hero_title || '');
        setHeroSubtitle(settingsData.hero_subtitle || '');
        setHeroVideo1Url(settingsData.hero_video_1_url || '');
        setHeroVideo2Url(settingsData.hero_video_2_url || '');
        setFacebookUrl(settingsData.facebook_url || '');
        setInstagramUrl(settingsData.instagram_url || '');
        setTiktokUrl(settingsData.tiktok_url || '');
        setContactPhone1(settingsData.contact_phone_1 || '');
        setContactPhone2(settingsData.contact_phone_2 || '');
        setContactAddress(settingsData.contact_address || '');
        setWorkingHours(settingsData.working_hours || '');
        setMenCategoryTitle(settingsData.men_category_title || '');
        setMenCategorySubtitle(settingsData.men_category_subtitle || '');
        setWomenCategoryTitle(settingsData.women_category_title || '');
        setWomenCategorySubtitle(settingsData.women_category_subtitle || '');
        setGiftCategoryTitle(settingsData.gift_category_title || '');
        setGiftCategorySubtitle(settingsData.gift_category_subtitle || '');
      }

      // Load Stage 2 settings lists
      const { data: fData } = await supabase.from('homepage_features').select('*').order('display_order');
      if (fData) setFeaturesList(fData);

      const { data: tData } = await supabase.from('testimonials').select('*').order('display_order');
      if (tData) setTestimonialsList(tData);

      const { data: cData } = await supabase.from('coupons').select('*').order('code');
      if (cData) setCouponsList(cData);

      const { data: bData } = await supabase.from('gift_box_types').select('*').order('display_order');
      if (bData) setBoxTypesList(bData);

    } catch (err) {
      console.error('Error fetching settings:', err);
      showToast('خطأ في تحميل بيانات الإعدادات والمحتوى', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  // ────────────────────────────────────────────────────────────────
  // STAGE 1 SAVE METHOD
  // ────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────
  // STAGE 2 CRUD METHODS
  // ────────────────────────────────────────────────────────────────

  // Open modals
  const openModal = (type: 'feature' | 'coupon' | 'boxType' | 'testimonial', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'feature') {
      setFeatureIcon(item ? item.icon : 'fa-gem');
      setFeatureTitle(item ? item.title : '');
      setFeatureOrder(item ? String(item.display_order) : '1');
    } else if (type === 'coupon') {
      setCouponCodeInput(item ? item.code : '');
      setCouponDiscount(item ? String(item.discount_percent) : '10');
      setCouponActive(item ? item.is_active : true);
    } else if (type === 'boxType') {
      setBoxName(item ? item.name : '');
      setBoxCode(item ? item.code : '');
      setBoxOrder(item ? String(item.display_order) : '1');
    } else if (type === 'testimonial') {
      setTestimonialFile(null);
      setTestimonialOrder(item ? String(item.display_order) : '1');
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  // Submit Modal forms
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('modal');
    try {
      if (modalType === 'feature') {
        const payload = {
          icon: featureIcon,
          title: featureTitle,
          display_order: parseInt(featureOrder) || 1
        };

        if (editingItem) {
          // Update
          const { error } = await supabase.from('homepage_features').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase.from('homepage_features').insert([payload]);
          if (error) throw error;
        }
      } else if (modalType === 'coupon') {
        const payload = {
          code: couponCode.trim().toUpperCase(),
          discount_percent: parseInt(couponDiscount) || 10,
          is_active: couponActive
        };

        if (editingItem) {
          const { error } = await supabase.from('coupons').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('coupons').insert([payload]);
          if (error) throw error;
        }
      } else if (modalType === 'boxType') {
        const payload = {
          name: boxName,
          code: boxCode.trim().toLowerCase(),
          display_order: parseInt(boxOrder) || 1
        };

        if (editingItem) {
          const { error } = await supabase.from('gift_box_types').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('gift_box_types').insert([payload]);
          if (error) throw error;
        }
      } else if (modalType === 'testimonial') {
        let imageUrl = editingItem ? editingItem.image_url : '';

        if (testimonialFile) {
          // Upload file to product-images storage
          const fileExt = testimonialFile.name.split('.').pop();
          const fileName = `testimonial_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, testimonialFile);

          if (uploadError) throw uploadError;

          // Get Public URL
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          imageUrl = publicUrlData.publicUrl;
        }

        if (!imageUrl && !editingItem) {
          throw new Error('يرجى تحديد ملف صورة للرأي أو المحادثة');
        }

        const payload = {
          image_url: imageUrl,
          display_order: parseInt(testimonialOrder) || 1
        };

        if (editingItem) {
          const { error } = await supabase.from('testimonials').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('testimonials').insert([payload]);
          if (error) throw error;
        }
      }

      showToast('تمت العملية بنجاح وتحديث الموقع', 'success');
      closeModal();
      fetchInitialData(); // Re-fetch to update table view
    } catch (err: any) {
      console.error(err);
      showToast(`فشلت العملية: ${err.message || err}`, 'error');
    } finally {
      setSavingSection(null);
    }
  };

  // Delete Item
  const handleDeleteItem = async (table: string, id: number, label: string) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من إزالة (${label}) نهائياً؟`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      showToast('تم الحذف بنجاح وتحديث الموقع', 'success');
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      showToast(`خطأ أثناء الحذف: ${err.message || err}`, 'error');
    }
  };

  // Toggle Coupon Active Status
  const handleToggleCoupon = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      showToast('تم تغيير حالة الكوبون بنجاح', 'success');
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      showToast(`فشلت العملية: ${err.message || err}`, 'error');
    }
  };

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
          <p className="text-xs text-gray-400 mt-1">تعديل النصوص، آراء العملاء، الكوبونات الفعالة، والعلب التخصيصية</p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-align-justify ml-2"></i>
          النصوص والمعلومات الأساسية
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'features'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-gem ml-2"></i>
          مميزات المتجر (Feature Bar)
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'testimonials'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-comments ml-2"></i>
          آراء ومحادثات العملاء
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-ticket ml-2"></i>
          كوبونات الخصم (Coupons)
        </button>
        <button
          onClick={() => setActiveTab('boxTypes')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'boxTypes'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-gift ml-2"></i>
          أنواع وتخصيص علب الهدايا
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          TAB 1: SITE SETTINGS
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
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
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 2: HOMEPAGE FEATURES
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'features' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">مميزات المتجر بالواجهة الرئيسية</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">البطاقات الأربعة المعروضة بأسفل الهيدر (أيقونة، عنوان، ترتيب)</p>
            </div>
            <button
              onClick={() => openModal('feature')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-plus ml-1.5"></i> إضافة ميزة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featuresList.map((f) => (
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative hover:border-[#D4AF37]/30 transition-all duration-300" key={f.id}>
                <div className="absolute top-2 left-2 text-[10px] bg-[#121212] px-2 py-0.5 rounded border border-gray-800 font-english font-bold text-gray-500">
                  #{f.display_order}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                    <i className={`fa-solid ${f.icon} text-lg`}></i>
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-200 ml-10">{f.title}</h4>
                </div>
                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-900">
                  <button
                    onClick={() => openModal('feature', f)}
                    className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-[#121212] border border-gray-800 py-1 px-2.5 rounded-lg cursor-pointer"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteItem('homepage_features', f.id, f.title)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-400 bg-red-950/10 border border-red-900/20 py-1 px-2.5 rounded-lg cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 3: TESTIMONIALS
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'testimonials' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">آراء عملاء سنت هاوس</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">لقطات شاشة محادثات وآراء عملاء الدار الراقين (معرض التمرير العرضي بالصفحة الرئيسية)</p>
            </div>
            <button
              onClick={() => openModal('testimonial')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-cloud-arrow-up ml-1.5"></i> رفع رأي جديد
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {testimonialsList.map((t) => (
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-2 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all duration-300" key={t.id}>
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-[#121212] border border-gray-800">
                  <Image src={t.image_url} alt="رأي عميل" fill className="object-contain" sizes="150px" />
                  <div className="absolute top-1 left-1 text-[8px] bg-black/60 px-1.5 py-0.5 rounded font-english font-bold">
                    #{t.display_order}
                  </div>
                </div>
                <div className="flex gap-2 justify-center mt-2 pt-2 border-t border-gray-900/60">
                  <button
                    onClick={() => openModal('testimonial', t)}
                    className="text-[9px] font-bold text-amber-500 hover:text-amber-400 bg-[#121212] border border-gray-800 py-0.5 px-2 rounded cursor-pointer"
                  >
                    تعديل الترتيب
                  </button>
                  <button
                    onClick={() => handleDeleteItem('testimonials', t.id, `رأي رقم ${t.display_order}`)}
                    className="text-[9px] font-bold text-red-500 hover:text-red-400 bg-red-950/10 border border-red-900/20 py-0.5 px-2 rounded cursor-pointer"
                  >
                    إزالة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 4: COUPONS LIST
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'coupons' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">كوبونات الخصم الترويجية</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">إنشاء وتعديل أكواد الخصم المستخدمة من قبل الزبائن في سلة المشتريات والدفع</p>
            </div>
            <button
              onClick={() => openModal('coupon')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-plus ml-1.5"></i> إضافة كود خصم
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400">
                  <th className="py-3 px-4">كود الخصم</th>
                  <th className="py-3 px-4 text-center">نسبة الخصم</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-xs md:text-sm">
                {couponsList.map((c) => (
                  <tr className="hover:bg-[#1A1A1A]/40 transition-colors" key={c.id}>
                    <td className="py-3 px-4 font-bold text-gray-100 font-english">{c.code}</td>
                    <td className="py-3 px-4 text-center font-bold font-english text-green-400">%{c.discount_percent}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleCoupon(c.id, c.is_active)}
                        className={`py-1 px-3 rounded-full text-[10px] font-bold cursor-pointer border ${
                          c.is_active
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {c.is_active ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openModal('coupon', c)}
                          className="text-[10px] font-bold text-amber-500 bg-[#1A1A1A] border border-gray-800 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteItem('coupons', c.id, c.code)}
                          className="text-[10px] font-bold text-red-500 bg-red-950/10 border border-red-900/20 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 5: BOX TYPES
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'boxTypes' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">أنواع وتخصيص علب الهدايا</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">إدارة الخيارات الظاهرة للزبون في قائمة تخصيص بوكس الهدايا بصفحة تفاصيل المنتج</p>
            </div>
            <button
              onClick={() => openModal('boxType')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-plus ml-1.5"></i> إضافة نوع علبة جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400">
                  <th className="py-3 px-4">اسم نوع العلبة أو المناسبة</th>
                  <th className="py-3 px-4 text-center">المعرف البرمجي (Code)</th>
                  <th className="py-3 px-4 text-center">الترتيب</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-xs md:text-sm">
                {boxTypesList.map((b) => (
                  <tr className="hover:bg-[#1A1A1A]/40 transition-colors" key={b.id}>
                    <td className="py-3 px-4 font-bold text-gray-200">{b.name}</td>
                    <td className="py-3 px-4 text-center text-gray-400 font-english font-bold">{b.code}</td>
                    <td className="py-3 px-4 text-center font-english">{b.display_order}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openModal('boxType', b)}
                          className="text-[10px] font-bold text-amber-500 bg-[#1A1A1A] border border-gray-800 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteItem('gift_box_types', b.id, b.name)}
                          className="text-[10px] font-bold text-red-500 bg-red-950/10 border border-red-900/20 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          ADD/EDIT COMMON MODAL POPUP
          ──────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm select-none">
          <div className="bg-[#121212] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden text-right font-cairo shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-300 text-lg cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3 className="text-sm md:text-base font-bold text-[#D4AF37]">
                {editingItem ? 'تعديل العنصر الحالي' : 'إضافة عنصر جديد'}
              </h3>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModal} className="p-6 space-y-4">
              
              {/* FEATURE FIELDS */}
              {modalType === 'feature' && (
                <>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">عنوان الميزة</label>
                    <input
                      type="text"
                      required
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">اسم أيقونة FontAwesome</label>
                    <input
                      type="text"
                      required
                      value={featureIcon}
                      onChange={(e) => setFeatureIcon(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english"
                      dir="ltr"
                      placeholder="مثال: fa-gem, fa-crown, fa-truck"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">ترتيب العرض (الرقم)</label>
                    <input
                      type="number"
                      required
                      value={featureOrder}
                      onChange={(e) => setFeatureOrder(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                    />
                  </div>
                </>
              )}

              {/* COUPON FIELDS */}
              {modalType === 'coupon' && (
                <>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">كود الخصم (أحرف إنجليزية كبيرة)</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingItem}
                      value={couponCode}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english uppercase"
                      dir="ltr"
                      placeholder="مثال: SCENT15"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">نسبة الخصم % (الرقم فقط)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="coupon_active"
                      checked={couponActive}
                      onChange={(e) => setCouponActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#D4AF37]"
                    />
                    <label htmlFor="coupon_active" className="text-xs text-gray-300 font-bold select-none cursor-pointer">
                      تفعيل الكوبون مباشرة للاستخدام
                    </label>
                  </div>
                </>
              )}

              {/* BOX TYPE FIELDS */}
              {modalType === 'boxType' && (
                <>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">اسم نوع العلبة أو المناسبة</label>
                    <input
                      type="text"
                      required
                      value={boxName}
                      onChange={(e) => setBoxName(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                      placeholder="مثال: بوكس مناسبات تخرج"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">المعرف الفريد (Code - أحرف صغيرة)</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingItem}
                      value={boxCode}
                      onChange={(e) => setBoxCode(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-left text-gray-200 font-english lowercase"
                      dir="ltr"
                      placeholder="مثال: graduation"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">ترتيب العرض (الرقم)</label>
                    <input
                      type="number"
                      required
                      value={boxOrder}
                      onChange={(e) => setBoxOrder(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                    />
                  </div>
                </>
              )}

              {/* TESTIMONIAL FIELDS */}
              {modalType === 'testimonial' && (
                <>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">ترتيب العرض (الرقم)</label>
                    <input
                      type="number"
                      required
                      value={testimonialOrder}
                      onChange={(e) => setTestimonialOrder(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                    />
                  </div>
                  {!editingItem && (
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">صورة الرأي / لقطة الشاشة</label>
                      <input
                        type="file"
                        required
                        accept="image/*"
                        onChange={(e) => setTestimonialFile(e.target.files ? e.target.files[0] : null)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left text-gray-200"
                        dir="ltr"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Submit/Cancel buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-800 text-gray-300 hover:text-white py-2 px-4 rounded-xl text-xs font-bold border border-gray-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingSection === 'modal'}
                  className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {savingSection === 'modal' ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
