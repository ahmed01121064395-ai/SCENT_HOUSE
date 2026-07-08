'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/Toast';
import Image from 'next/image';

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<'settings' | 'men_products' | 'women_products' | 'gift_products' | 'features' | 'testimonials' | 'coupons' | 'boxTypes' | 'offers' | 'about'>('settings');
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

  // ────────────────────────────────────────────────────────────────
  // STAGE 3 STATES
  // ────────────────────────────────────────────────────────────────
  const [offersList, setOffersList] = useState<any[]>([]);
  
  // About Page State
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [aboutHistoryBadge, setAboutHistoryBadge] = useState('');
  const [aboutHistoryTitle, setAboutHistoryTitle] = useState('');
  const [aboutHistoryDesc, setAboutHistoryDesc] = useState('');
  const [aboutVisionTitle, setAboutVisionTitle] = useState('');
  const [aboutVisionDesc, setAboutVisionDesc] = useState('');
  const [aboutMissionTitle, setAboutMissionTitle] = useState('');
  const [aboutMissionDesc, setAboutMissionDesc] = useState('');
  const [aboutCoverImageUrl, setAboutCoverImageUrl] = useState('');
  
  // Values State
  const [value1Title, setValue1Title] = useState('');
  const [value1Desc, setValue1Desc] = useState('');
  const [value1Icon, setValue1Icon] = useState('');
  
  const [value2Title, setValue2Title] = useState('');
  const [value2Desc, setValue2Desc] = useState('');
  const [value2Icon, setValue2Icon] = useState('');
  
  const [value3Title, setValue3Title] = useState('');
  const [value3Desc, setValue3Desc] = useState('');
  const [value3Icon, setValue3Icon] = useState('');

  // ────────────────────────────────────────────────────────────────
  // PRODUCTS MANAGEMENT STATES (NEW!)
  // ────────────────────────────────────────────────────────────────
  const [productsList, setProductsList] = useState<any[]>([]);
  const [dbErrors, setDbErrors] = useState<string[]>([]);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'men' | 'women' | 'unisex' | 'gifts'>('men');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('15');
  const [prodDescription, setProdDescription] = useState('');
  const [prodTopNotes, setProdTopNotes] = useState('');
  const [prodHeartNotes, setProdHeartNotes] = useState('');
  const [prodBaseNotes, setProdBaseNotes] = useState('');
  const [prodContents, setProdContents] = useState('');
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodSize30Checked, setProdSize30Checked] = useState(false);
  const [prodSize30Price, setProdSize30Price] = useState('');
  const [prodSize50Checked, setProdSize50Checked] = useState(true);
  const [prodSize50Price, setProdSize50Price] = useState('');
  const [prodSize100Checked, setProdSize100Checked] = useState(false);
  const [prodSize100Price, setProdSize100Price] = useState('');
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);

  // Modals / Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'feature' | 'coupon' | 'boxType' | 'testimonial' | 'offer' | 'product' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Modal input states
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

  // Offer inputs
  const [offerTitle, setOfferTitle] = useState('');
  const [offerBadgeText, setOfferBadgeText] = useState('');
  const [offerOldPrice, setOfferOldPrice] = useState('');
  const [offerNewPrice, setOfferNewPrice] = useState('');
  const [offerDetailsText, setOfferDetailsText] = useState('');
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [offerWhatsappText, setOfferWhatsappText] = useState('');
  const [offerOrder, setOfferOrder] = useState('1');
  const [offerActive, setOfferActive] = useState(true);

  useEffect(() => {
    fetchInitialData();

    // Subscribe to all tables to keep the CMS dashboard real-time synced
    const sChannel = supabase.channel('cms-settings-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => { fetchInitialData(); }).subscribe();
    const fChannel = supabase.channel('cms-features-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_features' }, () => { fetchInitialData(); }).subscribe();
    const tChannel = supabase.channel('cms-testimonials-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => { fetchInitialData(); }).subscribe();
    const cChannel = supabase.channel('cms-coupons-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => { fetchInitialData(); }).subscribe();
    const bChannel = supabase.channel('cms-boxtypes-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'gift_box_types' }, () => { fetchInitialData(); }).subscribe();
    const oChannel = supabase.channel('cms-offers-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'special_offers' }, () => { fetchInitialData(); }).subscribe();
    const aChannel = supabase.channel('cms-about-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, () => { fetchInitialData(); }).subscribe();
    const pChannel = supabase.channel('cms-products-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { fetchInitialData(); }).subscribe();

    return () => {
      sChannel.unsubscribe();
      fChannel.unsubscribe();
      tChannel.unsubscribe();
      cChannel.unsubscribe();
      bChannel.unsubscribe();
      oChannel.unsubscribe();
      aChannel.unsubscribe();
      pChannel.unsubscribe();
    };
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setDbErrors([]); // reset errors
      
      // Load Stage 1 Settings
      try {
        const { data: settingsData, error: sErr } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        if (sErr) {
          setDbErrors(prev => [...prev, `إعدادات الموقع: ${sErr.message}`]);
        } else if (settingsData) {
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
      } catch (err: any) {
        console.error('Error loading site settings:', err);
        setDbErrors(prev => [...prev, `إعدادات الموقع: ${err.message || err}`]);
      }

      // Load Stage 2 settings lists: features
      try {
        const { data: fData, error: fErr } = await supabase.from('homepage_features').select('*').order('display_order');
        if (fErr) {
          setDbErrors(prev => [...prev, `مميزات المتجر: ${fErr.message}`]);
        } else if (fData) {
          setFeaturesList(fData);
        }
      } catch (err: any) {
        console.error('Error loading features:', err);
        setDbErrors(prev => [...prev, `مميزات المتجر: ${err.message || err}`]);
      }

      // Load Stage 2 settings lists: testimonials
      try {
        const { data: tData, error: tErr } = await supabase.from('testimonials').select('*').order('display_order');
        if (tErr) {
          setDbErrors(prev => [...prev, `آراء العملاء: ${tErr.message}`]);
        } else if (tData) {
          setTestimonialsList(tData);
        }
      } catch (err: any) {
        console.error('Error loading testimonials:', err);
        setDbErrors(prev => [...prev, `آراء العملاء: ${err.message || err}`]);
      }

      // Load Stage 2 settings lists: coupons
      try {
        const { data: cData, error: cErr } = await supabase.from('coupons').select('*').order('code');
        if (cErr) {
          setDbErrors(prev => [...prev, `الكوبونات: ${cErr.message}`]);
        } else if (cData) {
          setCouponsList(cData);
        }
      } catch (err: any) {
        console.error('Error loading coupons:', err);
        setDbErrors(prev => [...prev, `الكوبونات: ${err.message || err}`]);
      }

      // Load Stage 2 settings lists: boxTypes
      try {
        const { data: bData, error: bErr } = await supabase.from('gift_box_types').select('*').order('display_order');
        if (bErr) {
          setDbErrors(prev => [...prev, `علب الهدايا: ${bErr.message}`]);
        } else if (bData) {
          setBoxTypesList(bData);
        }
      } catch (err: any) {
        console.error('Error loading gift box types:', err);
        setDbErrors(prev => [...prev, `علب الهدايا: ${err.message || err}`]);
      }

      // Load Stage 3 special offers
      try {
        const { data: oData, error: oErr } = await supabase.from('special_offers').select('*').order('display_order');
        if (oErr) {
          setDbErrors(prev => [...prev, `عروض المتجر: ${oErr.message}`]);
        } else if (oData) {
          setOffersList(oData);
        }
      } catch (err: any) {
        console.error('Error loading special offers:', err);
        setDbErrors(prev => [...prev, `عروض المتجر: ${err.message || err}`]);
      }

      // Load Stage 3 About Content
      try {
        const { data: aboutData, error: aErr } = await supabase.from('about_content').select('*').eq('id', 1).maybeSingle();
        if (aErr) {
          setDbErrors(prev => [...prev, `صفحة من نحن: ${aErr.message}`]);
        } else if (aboutData) {
          setAboutTitle(aboutData.title || '');
          setAboutSubtitle(aboutData.subtitle || '');
          setAboutHistoryBadge(aboutData.history_badge || '');
          setAboutHistoryTitle(aboutData.history_title || '');
          setAboutHistoryDesc(aboutData.history_description || '');
          setAboutVisionTitle(aboutData.vision_title || '');
          setAboutVisionDesc(aboutData.vision_description || '');
          setAboutMissionTitle(aboutData.mission_title || '');
          setAboutMissionDesc(aboutData.mission_description || '');
          setAboutCoverImageUrl(aboutData.cover_image || '');

          const vals = Array.isArray(aboutData.values_list) ? aboutData.values_list : [];
          if (vals[0]) {
            setValue1Title(vals[0].title || '');
            setValue1Desc(vals[0].desc || '');
            setValue1Icon(vals[0].icon || '');
          }
          if (vals[1]) {
            setValue2Title(vals[1].title || '');
            setValue2Desc(vals[1].desc || '');
            setValue2Icon(vals[1].icon || '');
          }
          if (vals[2]) {
            setValue3Title(vals[2].title || '');
            setValue3Desc(vals[2].desc || '');
            setValue3Icon(vals[2].icon || '');
          }
        }
      } catch (err: any) {
        console.error('Error loading about content:', err);
        setDbErrors(prev => [...prev, `صفحة من نحن: ${err.message || err}`]);
      }

      // Load Products List (NEW!)
      try {
        const { data: pData, error: pErr } = await supabase.from('products').select('*').order('id', { ascending: true });
        if (pErr) {
          setDbErrors(prev => [...prev, `المنتجات: ${pErr.message}`]);
        } else if (pData) {
          setProductsList(pData);
        }
      } catch (err: any) {
        console.error('Error loading products list:', err);
        setDbErrors(prev => [...prev, `المنتجات: ${err.message || err}`]);
      }

    } catch (err: any) {
      console.error('Error in fetchInitialData:', err);
      showToast('خطأ في تحميل البيانات', 'error');
      setDbErrors(prev => [...prev, `أخرى: ${err.message || err}`]);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  // ────────────────────────────────────────────────────────────────
  // SAVE SITE SETTINGS (STAGE 1) OR ABOUT PAGE (STAGE 3)
  // ────────────────────────────────────────────────────────────────
  async function handleSaveSection(sectionName: string, payload: any, table: string = 'site_settings') {
    try {
      setSavingSection(sectionName);
      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', 1);

      if (error) throw error;
      showToast('تم حفظ التعديلات بنجاح وتحديث الموقع فوراً', 'success');
      fetchInitialData();
    } catch (err: any) {
      console.error(`Error saving section ${sectionName}:`, err);
      showToast(`خطأ في الحفظ: ${err.message || err}`, 'error');
    } finally {
      setSavingSection(null);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // MODAL CRUD OPEN
  // ────────────────────────────────────────────────────────────────
  const openModal = (type: 'feature' | 'coupon' | 'boxType' | 'testimonial' | 'offer' | 'product', item: any = null) => {
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
    } else if (type === 'offer') {
      setOfferTitle(item ? item.title : '');
      setOfferBadgeText(item ? item.badge_text : '');
      setOfferOldPrice(item ? String(item.old_price || '') : '');
      setOfferNewPrice(item ? String(item.new_price) : '');
      setOfferDetailsText(item ? (Array.isArray(item.details_list) ? item.details_list.join('\n') : '') : '');
      setOfferFile(null);
      setOfferWhatsappText(item ? item.whatsapp_text : '');
      setOfferOrder(item ? String(item.display_order) : '1');
      setOfferActive(item ? item.is_active : true);
    } else if (type === 'product') {
      setProdName(item ? item.name : '');
      
      // Determine tab-category pre-selection
      let currentCat: 'men' | 'women' | 'unisex' | 'gifts' = 'men';
      if (activeTab === 'women_products') currentCat = 'women';
      if (activeTab === 'gift_products') currentCat = 'gifts';
      setProdCategory(item ? item.category : currentCat);
      
      setProdPrice(item ? String(item.price) : '');
      setProdStock(item ? String(item.stock || 15) : '15');
      setProdDescription(item ? item.description || '' : '');
      setProdTopNotes(item ? item.notes?.top || '' : '');
      setProdHeartNotes(item ? item.notes?.heart || '' : '');
      setProdBaseNotes(item ? item.notes?.base || '' : '');
      setProdContents(item ? item.contents || '' : '');
      setProdIsBestSeller(item ? !!item.isBestSeller : false);
      setProdIsNew(item ? !!item.isNew : true);

      // Sizes mapping
      const sizesArray = item ? (item.sizes || []) : [];
      const s30 = sizesArray.find((s: any) => s.ml === 30);
      const s50 = sizesArray.find((s: any) => s.ml === 50);
      const s100 = sizesArray.find((s: any) => s.ml === 100);

      setProdSize30Checked(!!s30);
      setProdSize30Price(s30 ? String(s30.price) : '');
      setProdSize50Checked(!!s50);
      setProdSize50Price(s50 ? String(s50.price) : '');
      setProdSize100Checked(!!s100);
      setProdSize100Price(s100 ? String(s100.price) : '');
      setProdImageFile(null);
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
          const { error } = await supabase.from('homepage_features').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
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
          const fileExt = testimonialFile.name.split('.').pop();
          const fileName = `testimonial_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, testimonialFile);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
        if (!imageUrl && !editingItem) throw new Error('يرجى تحديد ملف صورة للرأي');

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
      } else if (modalType === 'offer') {
        let imageUrl = editingItem ? editingItem.image_url : '';
        if (offerFile) {
          const fileExt = offerFile.name.split('.').pop();
          const fileName = `offer_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, offerFile);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
        if (!imageUrl && !editingItem) throw new Error('يرجى تحديد صورة العرض الترويجي');

        const payload = {
          title: offerTitle,
          badge_text: offerBadgeText,
          old_price: offerOldPrice ? parseInt(offerOldPrice) : null,
          new_price: parseInt(offerNewPrice) || 0,
          details_list: offerDetailsText.split('\n').map(d => d.trim()).filter(Boolean),
          image_url: imageUrl,
          whatsapp_text: offerWhatsappText,
          display_order: parseInt(offerOrder) || 1,
          is_active: offerActive
        };

        if (editingItem) {
          const { error } = await supabase.from('special_offers').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('special_offers').insert([payload]);
          if (error) throw error;
        }
      } else if (modalType === 'product') {
        // Build sizes array
        const sizesArray = [];
        if (prodSize30Checked) {
          if (!prodSize30Price) throw new Error('يرجى كتابة سعر عبوة 30 مل');
          sizesArray.push({ ml: 30, price: Number(prodSize30Price) });
        }
        if (prodSize50Checked) {
          if (!prodSize50Price) throw new Error('يرجى كتابة سعر عبوة 50 مل');
          sizesArray.push({ ml: 50, price: Number(prodSize50Price) });
        }
        if (prodSize100Checked) {
          if (!prodSize100Price) throw new Error('يرجى كتابة سعر عبوة 100 مل');
          sizesArray.push({ ml: 100, price: Number(prodSize100Price) });
        }
        if (sizesArray.length === 0) throw new Error('يرجى اختيار حجم واحد على الأقل للمنتج');

        let categoryNameAr = 'العطور الرجالية';
        if (prodCategory === 'women') categoryNameAr = 'العطور النسائية';
        if (prodCategory === 'unisex') categoryNameAr = 'عطور للجنسين';
        if (prodCategory === 'gifts') categoryNameAr = 'بوكسات الهدايا';

        let imageUrl = editingItem ? editingItem.image : '';

        // Upload Product Image
        if (prodImageFile) {
          const fileExt = prodImageFile.name.split('.').pop();
          const fileName = `prod_${Date.now()}.${fileExt}`;
          const filePath = `products/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, prodImageFile);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
          imageUrl = publicUrlData.publicUrl;
        }
        if (!imageUrl) throw new Error('يرجى اختيار صورة للمنتج');

        const payload = {
          name: prodName,
          category: prodCategory,
          categoryNameAr,
          price: sizesArray[0].price, // Base price is the first size price
          stock: parseInt(prodStock) || 15,
          description: prodDescription,
          notes: {
            top: prodTopNotes,
            heart: prodHeartNotes,
            base: prodBaseNotes
          },
          contents: prodContents,
          isBestSeller: prodIsBestSeller,
          isNew: prodIsNew,
          sizes: sizesArray,
          image: imageUrl,
          images: editingItem ? (editingItem.images || [imageUrl]) : [imageUrl]
        };

        if (editingItem) {
          const { error } = await supabase.from('products').update(payload).eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').insert([payload]);
          if (error) throw error;
        }
      }

      showToast('تمت العملية بنجاح وتحديث الموقع', 'success');
      closeModal();
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      showToast(`فشلت العملية: ${err.message || err}`, 'error');
    } finally {
      setSavingSection(null);
    }
  };

  // Upload About Page Image
  const handleUploadAboutImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSavingSection('about_image');
      const fileExt = file.name.split('.').pop();
      const fileName = `about_cover_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setAboutCoverImageUrl(publicUrlData.publicUrl);
      showToast('تم رفع صورة الغلاف لصفحة من نحن بنجاح', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`فشل رفع الصورة: ${err.message || err}`, 'error');
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

  // Toggle statuses
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

  const handleToggleOffer = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('special_offers').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      showToast('تم تغيير حالة نشاط العرض بنجاح', 'success');
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      showToast(`فشلت العملية: ${err.message || err}`, 'error');
    }
  };

  // Filter products by category tab
  const getFilteredProducts = () => {
    if (activeTab === 'men_products') {
      return productsList.filter(p => p.category === 'men' || p.category === 'unisex');
    }
    if (activeTab === 'women_products') {
      return productsList.filter(p => p.category === 'women' || p.category === 'unisex');
    }
    if (activeTab === 'gift_products') {
      return productsList.filter(p => p.category === 'gifts');
    }
    return [];
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-[#D4AF37]">
        <i className="fa-solid fa-circle-notch animate-spin text-3xl"></i>
        <p className="text-xs text-gray-400 mt-3 font-cairo">جاري تحميل إعدادات المحتوى والمنتجات...</p>
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

      {dbErrors.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs space-y-1 mb-4">
          <p className="font-bold flex items-center gap-1 mb-1">
            <i className="fa-solid fa-triangle-exclamation"></i>
            تنبيه: حدثت أخطاء أثناء تحميل بعض الجداول من قاعدة البيانات:
          </p>
          {dbErrors.map((err, i) => (
            <p key={i}>- {err}</p>
          ))}
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-gray-900">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-100 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-[#D4AF37] text-lg"></i>
            إدارة محتوى المتجر (CMS)
          </h1>
          <p className="text-xs text-gray-400 mt-1">تعديل نصوص وتصنيفات المتجر، المنتجات، العروض، والصفحات الثابتة</p>
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
          المعلومات الأساسية
        </button>
        <button
          onClick={() => setActiveTab('men_products')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'men_products'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10 border-b border-[#D4AF37]'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-mars ml-2"></i>
          العطور الرجالية
        </button>
        <button
          onClick={() => setActiveTab('women_products')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'women_products'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10 border-b border-[#D4AF37]'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-venus ml-2"></i>
          العطور النسائية
        </button>
        <button
          onClick={() => setActiveTab('gift_products')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'gift_products'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10 border-b border-[#D4AF37]'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-gift ml-2"></i>
          صناديق الهدايا
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-tags ml-2"></i>
          عروض المتجر
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'about'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-yellow-600/10'
              : 'text-gray-400 hover:text-white hover:bg-[#121212]'
          }`}
        >
          <i className="fa-solid fa-info-circle ml-2"></i>
          صفحة من نحن
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
          المميزات
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
          الآراء
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
          الكوبونات
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
          علب الهدايا
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          TAB 1: SITE SETTINGS
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 gap-8">
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
                    <label className="text-[10px] text-gray-500">الوصف أو العنوان الفرعي</label>
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
          TABS: PRODUCTS LISTING (NEW! - FOR MEN, WOMEN, AND GIFTS)
          ──────────────────────────────────────────────────────────────── */}
      {(activeTab === 'men_products' || activeTab === 'women_products' || activeTab === 'gift_products') && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">
                {activeTab === 'men_products' && `إدارة العطور الرجالية والمشتركة (${getFilteredProducts().length})`}
                {activeTab === 'women_products' && `إدارة العطور النسائية والمشتركة (${getFilteredProducts().length})`}
                {activeTab === 'gift_products' && `إدارة صناديق وبوكسات الهدايا (${getFilteredProducts().length})`}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                إضافة، تعديل، حذف، وتخصيص تفاصيل المنتجات المعروضة في هذا القسم بالمتجر
              </p>
            </div>
            <button
              onClick={() => openModal('product')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-plus ml-1.5"></i> إضافة منتج جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400">
                  <th className="py-3 px-4">المنتج</th>
                  <th className="py-3 px-4 text-center">التصنيف</th>
                  <th className="py-3 px-4 text-center">السعر الأساسي</th>
                  <th className="py-3 px-4 text-center">الأحجام المتاحة</th>
                  <th className="py-3 px-4 text-center">الكمية/الستوك</th>
                  <th className="py-3 px-4 text-center">شارات مميزة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-xs md:text-sm">
                {getFilteredProducts().map((prod) => (
                  <tr className="hover:bg-[#1A1A1A]/40 transition-colors" key={prod.id}>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded bg-[#1A1A1A] overflow-hidden border border-gray-800">
                        <Image src={prod.image} alt={prod.name} fill className="object-contain" sizes="40px" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">{prod.name}</h4>
                        {prod.stock <= 5 && (
                          <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                            <i className="fa-solid fa-triangle-exclamation"></i> كمية منخفضة!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {prod.category === 'unisex' ? 'مشترك للجنسين' : prod.categoryNameAr}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#D4AF37] font-english">{prod.price} ج.م</td>
                    <td className="py-3 px-4 text-center font-english space-x-1 space-x-reverse">
                      {Array.isArray(prod.sizes) && prod.sizes.map((s: any) => (
                        <span key={s.ml} className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
                          {s.ml}ML
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-center font-english text-gray-300">{prod.stock || 0}</td>
                    <td className="py-3 px-4 text-center space-x-1 space-x-reverse">
                      {prod.isBestSeller && (
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold">الأكثر مبيعاً</span>
                      )}
                      {prod.isNew && (
                        <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full font-bold">جديد</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openModal('product', prod)}
                          className="text-[10px] font-bold text-amber-500 bg-[#1A1A1A] border border-gray-800 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteItem('products', prod.id, prod.name)}
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
          TAB 5: HOMEPAGE FEATURES
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
          TAB 6: TESTIMONIALS
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
          TAB 7: COUPONS LIST
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
          TAB 8: BOX TYPES
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'boxTypes' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">أنواع وتخصيص علب الهدايا</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">إدارة الخيارات الظاهرة للزبون في قائمة تخصيص بوكس الهدايا بصفحة تفاصيل العطر</p>
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
          TAB 9: SPECIAL OFFERS
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'offers' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">عروض المتجر الرئيسية (Special Offers)</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">البطاقات الترويجية الثلاثة بوسط الواجهة الرئيسية للمتجر</p>
            </div>
            <button
              onClick={() => openModal('offer')}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              <i className="fa-solid fa-plus ml-1.5"></i> إضافة عرض ترويجي جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offersList.map((o) => (
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all duration-300 relative" key={o.id}>
                {o.badge_text && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                    {o.badge_text}
                  </span>
                )}
                
                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#121212] border border-gray-800">
                    <Image src={o.image_url} alt={o.title} fill className="object-cover" sizes="300px" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#D4AF37]">{o.title}</h4>
                    <div className="flex gap-2 items-center text-xs mt-1">
                      <span className="text-gray-400 font-english font-bold text-sm">{o.new_price} ج.م</span>
                      {o.old_price && <span className="text-gray-600 line-through font-english text-xs">{o.old_price} ج.م</span>}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 space-y-1 bg-[#121212] p-2.5 rounded-lg border border-gray-900">
                    <span className="text-[10px] text-gray-500 font-bold">تفاصيل العرض:</span>
                    {Array.isArray(o.details_list) && o.details_list.map((d: string, idx: number) => (
                      <p className="flex items-center gap-1.5" key={idx}>
                        <i className="fa-solid fa-circle-check text-green-500 text-[9px]"></i>
                        {d}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-900">
                  <button
                    onClick={() => handleToggleOffer(o.id, o.is_active)}
                    className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border cursor-pointer ${
                      o.is_active
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {o.is_active ? 'نشط' : 'معطل'}
                  </button>
                  <button
                    onClick={() => openModal('offer', o)}
                    className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-[#121212] border border-gray-800 py-1 px-2.5 rounded-lg cursor-pointer"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteItem('special_offers', o.id, o.title)}
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
          TAB 10: ABOUT PAGE EDITOR
          ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'about' && (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-200">صفحة من نحن (About)</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">تعديل قصة دار العطور، قيمنا الجوهرية الثلاثة، وصورة الغلاف الجانبية</p>
            </div>
            <button
              onClick={() => handleSaveSection('about_all', {
                title: aboutTitle,
                subtitle: aboutSubtitle,
                history_badge: aboutHistoryBadge,
                history_title: aboutHistoryTitle,
                history_description: aboutHistoryDesc,
                vision_title: aboutVisionTitle,
                vision_description: aboutVisionDesc,
                mission_title: aboutMissionTitle,
                mission_description: aboutMissionDesc,
                cover_image: aboutCoverImageUrl,
                values_list: [
                  { title: value1Title, desc: value1Desc, icon: value1Icon },
                  { title: value2Title, desc: value2Desc, icon: value2Icon },
                  { title: value3Title, desc: value3Desc, icon: value3Icon }
                ]
              }, 'about_content')}
              disabled={savingSection === 'about_all'}
              className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:brightness-110 text-black text-xs font-bold py-2 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-600/10"
            >
              {savingSection === 'about_all' ? 'جاري حفظ الصفحة...' : 'حفظ كامل الصفحة'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-bold">عنوان الصفحة الرئيسي</label>
                  <input
                    type="text"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-bold">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={aboutSubtitle}
                    onChange={(e) => setAboutSubtitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-bold">شارة القصة (Badge)</label>
                  <input
                    type="text"
                    value={aboutHistoryBadge}
                    onChange={(e) => setAboutHistoryBadge(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-bold">عنوان القصة الرئيسي</label>
                  <input
                    type="text"
                    value={aboutHistoryTitle}
                    onChange={(e) => setAboutHistoryTitle(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-bold">نص تاريخ وتأسيس دار عطور Scent House</label>
                <textarea
                  rows={4}
                  value={aboutHistoryDesc}
                  onChange={(e) => setAboutHistoryDesc(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
                  <h4 className="text-xs text-[#D4AF37] font-black">رؤية المتجر</h4>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500">عنوان الرؤية</label>
                    <input
                      type="text"
                      value={aboutVisionTitle}
                      onChange={(e) => setAboutVisionTitle(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500">نص الرؤية</label>
                    <textarea
                      rows={3}
                      value={aboutVisionDesc}
                      onChange={(e) => setAboutVisionDesc(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
                  <h4 className="text-xs text-[#D4AF37] font-black">رسالة المتجر</h4>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500">عنوان الرسالة</label>
                    <input
                      type="text"
                      value={aboutMissionTitle}
                      onChange={(e) => setAboutMissionTitle(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500">نص الرسالة</label>
                    <textarea
                      rows={3}
                      value={aboutMissionDesc}
                      onChange={(e) => setAboutMissionDesc(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-bold">صورة الغلاف الجانبية للدار</label>
                <div className="relative w-full aspect-[4/3] bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
                  <Image src={aboutCoverImageUrl || '/images/S1.jpg'} alt="غلاف صفحة من نحن" fill className="object-cover" sizes="300px" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAboutImage}
                  className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left text-gray-200"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-6 space-y-4">
            <h3 className="text-sm md:text-base font-bold text-[#D4AF37]">القيم الجوهرية الثلاثة (Core Values)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
                <h4 className="text-xs text-gray-300 font-black flex items-center justify-between">
                  <span>القيمة الأولى</span>
                  <i className={`fa-solid ${value1Icon || 'fa-award'} text-[#D4AF37]`}></i>
                </h4>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">العنوان</label>
                  <input
                    type="text"
                    value={value1Title}
                    onChange={(e) => setValue1Title(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">أيقونة FontAwesome</label>
                  <input
                    type="text"
                    value={value1Icon}
                    onChange={(e) => setValue1Icon(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left font-english text-gray-200"
                    dir="ltr"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">شرح القيمة</label>
                  <textarea
                    rows={3}
                    value={value1Desc}
                    onChange={(e) => setValue1Desc(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
                <h4 className="text-xs text-gray-300 font-black flex items-center justify-between">
                  <span>القيمة الثانية</span>
                  <i className={`fa-solid ${value2Icon || 'fa-award'} text-[#D4AF37]`}></i>
                </h4>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">العنوان</label>
                  <input
                    type="text"
                    value={value2Title}
                    onChange={(e) => setValue2Title(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">أيقونة FontAwesome</label>
                  <input
                    type="text"
                    value={value2Icon}
                    onChange={(e) => setValue2Icon(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left font-english text-gray-200"
                    dir="ltr"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">شرح القيمة</label>
                  <textarea
                    rows={3}
                    value={value2Desc}
                    onChange={(e) => setValue2Desc(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                  />
                </div>
              </div>

              {/* Card 3 */}
              <div className="space-y-3 p-4 bg-[#1A1A1A]/40 rounded-xl border border-gray-800">
                <h4 className="text-xs text-gray-300 font-black flex items-center justify-between">
                  <span>القيمة الثالثة</span>
                  <i className={`fa-solid ${value3Icon || 'fa-award'} text-[#D4AF37]`}></i>
                </h4>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">العنوان</label>
                  <input
                    type="text"
                    value={value3Title}
                    onChange={(e) => setValue3Title(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">أيقونة FontAwesome</label>
                  <input
                    type="text"
                    value={value3Icon}
                    onChange={(e) => setValue3Icon(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left font-english text-gray-200"
                    dir="ltr"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500">شرح القيمة</label>
                  <textarea
                    rows={3}
                    value={value3Desc}
                    onChange={(e) => setValue3Desc(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          ADD/EDIT COMMON MODAL POPUP
          ──────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm select-none">
          <div className="bg-[#121212] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden text-right font-cairo shadow-2xl">
            
            <div className="bg-[#1A1A1A] px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-300 text-lg cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3 className="text-sm md:text-base font-bold text-[#D4AF37]">
                {editingItem ? 'تعديل العنصر الحالي' : 'إضافة عنصر جديد'}
              </h3>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* PRODUCT FIELDS (NEW!) */}
              {modalType === 'product' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">اسم المنتج (العطر)</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                        placeholder="مثال: عطر شيوخ الذهب"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">التصنيف</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-gray-200"
                      >
                        <option value="men">العطور الرجالية</option>
                        <option value="women">العطور النسائية</option>
                        <option value="unisex">عطور للجنسين (مشتركة)</option>
                        <option value="gifts">بوكسات الهدايا</option>
                      </select>
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">الكمية المتوفرة بالستوك</label>
                      <input
                        type="number"
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 font-english"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">صورة المنتج</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProdImageFile(e.target.files ? e.target.files[0] : null)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-2 outline-none text-xs text-left text-gray-200"
                        dir="ltr"
                      />
                      {editingItem && <p className="text-[9px] text-gray-500">اتركها فارغة للإبقاء على الصورة الحالية</p>}
                    </div>
                  </div>

                  {/* SIZES CHECKBOXES & PRICES */}
                  <div className="space-y-3 p-4 bg-[#1A1A1A] rounded-xl border border-gray-800">
                    <h4 className="text-xs text-gray-300 font-bold">الحجم والأسعار (اختر حجمًا واحدًا على الأقل):</h4>
                    
                    {/* Size 30ML */}
                    <div className="flex items-center gap-3 justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <input
                          type="checkbox"
                          checked={prodSize30Checked}
                          onChange={(e) => setProdSize30Checked(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#D4AF37]"
                        />
                        عبوة 30 ML
                      </label>
                      {prodSize30Checked && (
                        <input
                          type="number"
                          placeholder="السعر بالجنيه"
                          value={prodSize30Price}
                          onChange={(e) => setProdSize30Price(e.target.value)}
                          className="bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-1 px-2.5 outline-none text-xs text-right text-gray-200 font-english w-32"
                        />
                      )}
                    </div>

                    {/* Size 50ML */}
                    <div className="flex items-center gap-3 justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <input
                          type="checkbox"
                          checked={prodSize50Checked}
                          onChange={(e) => setProdSize50Checked(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#D4AF37]"
                        />
                        عبوة 50 ML
                      </label>
                      {prodSize50Checked && (
                        <input
                          type="number"
                          placeholder="السعر بالجنيه"
                          value={prodSize50Price}
                          onChange={(e) => setProdSize50Price(e.target.value)}
                          className="bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-1 px-2.5 outline-none text-xs text-right text-gray-200 font-english w-32"
                        />
                      )}
                    </div>

                    {/* Size 100ML */}
                    <div className="flex items-center gap-3 justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <input
                          type="checkbox"
                          checked={prodSize100Checked}
                          onChange={(e) => setProdSize100Checked(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#D4AF37]"
                        />
                        عبوة 100 ML
                      </label>
                      {prodSize100Checked && (
                        <input
                          type="number"
                          placeholder="السعر بالجنيه"
                          value={prodSize100Price}
                          onChange={(e) => setProdSize100Price(e.target.value)}
                          className="bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-1 px-2.5 outline-none text-xs text-right text-gray-200 font-english w-32"
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">وصف العطر أو النبذة التعريفية</label>
                    <textarea
                      rows={2}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">المكونات العليا (Top Notes)</label>
                      <input
                        type="text"
                        value={prodTopNotes}
                        onChange={(e) => setProdTopNotes(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                        placeholder="مثال: الخزامى، الزعفران"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">المكونات الوسطى (Heart Notes)</label>
                      <input
                        type="text"
                        value={prodHeartNotes}
                        onChange={(e) => setProdHeartNotes(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                        placeholder="مثال: الباتشولي، العود"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">المكونات الأساسية (Base Notes)</label>
                      <input
                        type="text"
                        value={prodBaseNotes}
                        onChange={(e) => setProdBaseNotes(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                        placeholder="مثال: خشب الصندل، العنبر"
                      />
                    </div>
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">محتويات العلبة (Contents)</label>
                    <input
                      type="text"
                      value={prodContents}
                      onChange={(e) => setProdContents(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200"
                      placeholder="مثال: زجاجة العطر 50 مل + علبة كرتونية فاخرة"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="prod_bestseller"
                        checked={prodIsBestSeller}
                        onChange={(e) => setProdIsBestSeller(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#D4AF37]"
                      />
                      <label htmlFor="prod_bestseller" className="text-xs text-gray-300 font-bold cursor-pointer">
                        المنتج الأكثر مبيعاً
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="prod_new"
                        checked={prodIsNew}
                        onChange={(e) => setProdIsNew(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#D4AF37]"
                      />
                      <label htmlFor="prod_new" className="text-xs text-gray-300 font-bold cursor-pointer">
                        منتج جديد بالمتجر
                      </label>
                    </div>
                  </div>
                </>
              )}

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

              {/* SPECIAL OFFER FIELDS */}
              {modalType === 'offer' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">اسم العرض الترويجي</label>
                      <input
                        type="text"
                        required
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">شارة الخصم (Badge)</label>
                      <input
                        type="text"
                        value={offerBadgeText}
                        onChange={(e) => setOfferBadgeText(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                        placeholder="مثال: وفر 200 جنيه!"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">السعر القديم (اختياري)</label>
                      <input
                        type="number"
                        value={offerOldPrice}
                        onChange={(e) => setOfferOldPrice(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">السعر الجديد (الحالي)</label>
                      <input
                        type="number"
                        required
                        value={offerNewPrice}
                        onChange={(e) => setOfferNewPrice(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                      />
                    </div>
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">تفاصيل ومميزات العرض (كل ميزة في سطر منفصل)</label>
                    <textarea
                      rows={3}
                      required
                      value={offerDetailsText}
                      onChange={(e) => setOfferDetailsText(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-right text-gray-200 resize-y"
                      placeholder="مثال:&#10;2 × 50 مل&#10;بوكس التسترات هدية"
                    />
                  </div>
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">رسالة الطلب عبر واتساب</label>
                    <input
                      type="text"
                      required
                      value={offerWhatsappText}
                      onChange={(e) => setOfferWhatsappText(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">ترتيب العرض</label>
                      <input
                        type="number"
                        required
                        value={offerOrder}
                        onChange={(e) => setOfferOrder(e.target.value)}
                        className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right text-gray-200 font-english"
                      />
                    </div>
                    {!editingItem && (
                      <div className="form-group flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400">صورة العرض</label>
                        <input
                          type="file"
                          required
                          accept="image/*"
                          onChange={(e) => setOfferFile(e.target.files ? e.target.files[0] : null)}
                          className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-left text-gray-200"
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="offer_active"
                      checked={offerActive}
                      onChange={(e) => setOfferActive(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#D4AF37]"
                    />
                    <label htmlFor="offer_active" className="text-xs text-gray-300 font-bold select-none cursor-pointer">
                      تفعيل وعرض العرض الترويجي بالصفحة الرئيسية
                    </label>
                  </div>
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
