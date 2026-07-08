'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductSize } from '@/data/products';
import Image from 'next/image';
import { formatPriceVal } from '@/lib/formatters';
import Toast from '@/components/Toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [likesCountMap, setLikesCountMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter/Sort State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'men' | 'women' | 'unisex' | 'gifts'>('men');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [description, setDescription] = useState('');
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');
  const [contents, setContents] = useState(''); // for gifts box contents
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNew, setIsNew] = useState(true);

  // Sizes Checkboxes
  const [size30Checked, setSize30Checked] = useState(false);
  const [size30Price, setSize30Price] = useState('');
  const [size50Checked, setSize50Checked] = useState(true);
  const [size50Price, setSize50Price] = useState('');
  const [size100Checked, setSize100Checked] = useState(false);
  const [size100Price, setSize100Price] = useState('');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load products and wishlist counts
  async function fetchProducts() {
    try {
      setLoading(true);
      const { data: pData, error: pErr } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
        
      if (pErr) throw pErr;

      // Fetch like counts from product_likes
      const { data: likesData } = await supabase
        .from('product_likes')
        .select('product_id');

      const likeMap: Record<number, number> = {};
      likesData?.forEach(l => {
        likeMap[l.product_id] = (likeMap[l.product_id] || 0) + 1;
      });

      setProducts(pData || []);
      setLikesCountMap(likeMap);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
      setToast({ message: `خطأ في تحميل المنتجات: ${errMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();

    // Subscribe to products table real-time changes
    const channel = supabase
      .channel('admin-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('men');
    setPrice('');
    setStock('15');
    setDescription('');
    setTopNotes('');
    setHeartNotes('');
    setBaseNotes('');
    setContents('');
    setIsBestSeller(false);
    setIsNew(true);
    setSize30Checked(false);
    setSize30Price('');
    setSize50Checked(true);
    setSize50Price('');
    setSize100Checked(false);
    setSize100Price('');
    setImageFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setStock(String(product.stock || 15));
    setDescription(product.description || '');
    setTopNotes(product.notes?.top || '');
    setHeartNotes(product.notes?.heart || '');
    setBaseNotes(product.notes?.base || '');
    setContents(product.contents || '');
    setIsBestSeller(!!product.isBestSeller);
    setIsNew(!!product.isNew);

    // Map sizes array
    const sizes: ProductSize[] = product.sizes || [];
    const s30 = sizes.find(s => s.ml === 30);
    const s50 = sizes.find(s => s.ml === 50);
    const s100 = sizes.find(s => s.ml === 100);

    setSize30Checked(!!s30);
    setSize30Price(s30 ? String(s30.price) : '');
    setSize50Checked(!!s50);
    setSize50Price(s50 ? String(s50.price) : '');
    setSize100Checked(!!s100);
    setSize100Price(s100 ? String(s100.price) : '');

    setImageFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormError('');

    try {
      // 1. Validate Form Inputs
      const sizesArray: ProductSize[] = [];
      if (size30Checked) {
        if (!size30Price) throw new Error('يرجى تحديد سعر العبوة 30 مل.');
        sizesArray.push({ ml: 30, price: Number(size30Price) });
      }
      if (size50Checked) {
        if (!size50Price) throw new Error('يرجى تحديد سعر العبوة 50 مل.');
        sizesArray.push({ ml: 50, price: Number(size50Price) });
      }
      if (size100Checked) {
        if (!size100Price) throw new Error('يرجى تحديد سعر العبوة 100 مل.');
        sizesArray.push({ ml: 100, price: Number(size100Price) });
      }

      if (sizesArray.length === 0) {
        throw new Error('يرجى اختيار حجم واحد على الأقل للمنتج.');
      }

      let categoryNameAr = 'العطور الرجالية';
      if (category === 'women') categoryNameAr = 'العطور النسائية';
      if (category === 'unisex') categoryNameAr = 'عطور للجنسين';
      if (category === 'gifts') categoryNameAr = 'بوكسات الهدايا';

      let imageUrl = editingProduct ? editingProduct.image : '';

      // 2. Upload image to Storage if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw new Error(`خطأ رفع الصورة: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (!imageUrl) {
        throw new Error('يرجى اختيار صورة للمنتج.');
      }

      const productPayload = {
        name,
        category,
        categoryNameAr,
        price: Number(price) || sizesArray[0].price,
        stock: Number(stock) || 0,
        image: imageUrl,
        images: [imageUrl],
        isBestSeller,
        isNew,
        description,
        contents: category === 'gifts' ? contents : null,
        notes: category !== 'gifts' ? {
          top: topNotes,
          heart: heartNotes,
          base: baseNotes
        } : null,
        sizes: sizesArray
      };

      if (editingProduct) {
        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
      } else {
        // Insert product (auto-assign next ID to prevent Postgres sequence desync conflicts)
        const nextId = Math.max(...products.map(p => Number(p.id)), 0) + 1;
        const { error: insertError } = await supabase
          .from('products')
          .insert([{
            ...productPayload,
            id: nextId
          }]);

        if (insertError) throw insertError;
      }

      setIsModalOpen(false);
      setToast({ message: editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح', type: 'success' });
      fetchProducts();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المنتج.';
      console.error(err);
      setFormError(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number, productName: string) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف المنتج (${(productName || '').split(' - ')[0]}) نهائياً من قاعدة البيانات؟`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'تم حذف المنتج بنجاح', type: 'success' });
      fetchProducts();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
      setToast({ message: `خطأ في حذف المنتج: ${errMsg}`, type: 'error' });
    }
  };

  // 3. Client side filtering and sorting
  const getFilteredProducts = () => {
    let list = [...products];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Sort
    list.sort((a, b) => {
      const likesA = likesCountMap[a.id] || 0;
      const likesB = likesCountMap[b.id] || 0;

      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'likes') return likesB - likesA;
      return (a.name || '').localeCompare(b.name || '', 'ar');
    });

    return list;
  };

  const filteredList = getFilteredProducts();

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2">
            <i className="fa-solid fa-box-open"></i> إدارة منتجات الدار
          </h1>
          <p className="text-xs text-gray-400 mt-1">إضافة، تعديل وحذف زجاجات العطور والبوكسات في المتجر</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-black font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-circle-plus"></i>
          <span>إضافة عطر جديد</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#121212] border border-gray-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="بحث باسم المنتج..."
            className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-right pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-gray-500 text-xs"></i>
        </div>

        {/* Category */}
        <select
          className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-gray-300"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">جميع التصنيفات</option>
          <option value="men">العطور الرجالية</option>
          <option value="women">العطور النسائية</option>
          <option value="unisex">عطور للجنسين (مشتركة)</option>
          <option value="gifts">بوكسات الهدايا</option>
        </select>

        {/* Sort */}
        <select
          className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-gray-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">ترتيب بالاسم</option>
          <option value="price-asc">السعر: من الأقل</option>
          <option value="price-desc">السعر: من الأعلى</option>
          <option value="stock">مستوى المخزون</option>
          <option value="likes">عدد الإعجابات (المفضلة)</option>
        </select>
      </div>

      {/* Products Content */}
      {loading ? (
        <div className="text-center py-20 text-[#D4AF37]">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl"></i>
          <p className="text-xs text-gray-400 mt-3">جاري تحميل المنتجات...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          <i className="fa-solid fa-box-open text-4xl text-gray-700 mb-3"></i>
          <p className="text-sm">لم يتم العثور على منتجات مطابقة لخيارات البحث</p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP GRID TABLE ── */}
          <div className="hidden md:block bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-gray-800 text-gray-400 text-xs font-bold">
                  <th className="py-4 px-6 w-20">الصورة</th>
                  <th className="py-4 px-6">اسم العطر</th>
                  <th className="py-4 px-6">التصنيف</th>
                  <th className="py-4 px-6 text-center">الأسعار</th>
                  <th className="py-4 px-6 text-center w-24">المخزون</th>
                  <th className="py-4 px-6 text-center w-24">المفضلة</th>
                  <th className="py-4 px-6 text-center w-24">شارات</th>
                  <th className="py-4 px-6 text-center w-36">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {filteredList.map((p) => {
                  const likesCount = likesCountMap[p.id] || 0;
                  const isLowStock = (p.stock || 0) < 5;

                  return (
                    <tr key={p.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-6">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-800">
                          <Image src={p.image || 'https://placehold.co/100x100/121212/D4AF37?text=Perfume'} alt={p.name || 'عطر'} fill className="object-cover" />
                        </div>
                      </td>
                      {/* Name */}
                      <td className="py-3 px-6 font-bold text-gray-100">
                        {(p.name || '').split(' - ')[0]}
                        <span className="block text-[10px] text-gray-500 font-normal font-english">{(p.name || '').split(' - ')[1] || ''}</span>
                      </td>
                      {/* Category */}
                      <td className="py-3 px-6 text-gray-400">{p.categoryNameAr}</td>
                      {/* Prices */}
                      <td className="py-3 px-6 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(p.sizes || []).map((sz, i: number) => (
                            <span key={i} className="bg-gray-800/60 border border-gray-800 rounded-lg py-0.5 px-2 text-[10px] font-bold text-gray-300 font-english">
                              {sz.ml}ml: {sz.price}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* Stock */}
                      <td className={`py-3 px-6 text-center font-bold font-english ${isLowStock ? 'text-red-500 bg-red-950/10' : 'text-gray-300'}`}>
                        {p.stock ?? 15}
                      </td>
                      {/* Likes count */}
                      <td className="py-3 px-6 text-center text-red-400 font-bold font-english">
                        <i className="fa-solid fa-heart text-[10px] ml-1"></i>
                        <span>{likesCount}</span>
                      </td>
                      {/* Flags */}
                      <td className="py-3 px-6 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {p.isBestSeller && <span className="bg-amber-500/10 text-[#D4AF37] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#D4AF37]/20 uppercase">مبيعاً</span>}
                          {p.isNew && <span className="bg-blue-500/10 text-blue-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">جديد</span>}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-6 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditModal(p)}
                            className="bg-gray-800 text-gray-300 hover:text-white py-1.5 px-3 rounded-lg text-xs font-bold border border-gray-700 cursor-pointer"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="bg-red-950/20 text-red-400 hover:text-red-300 py-1.5 px-3 rounded-lg text-xs font-bold border border-red-900/30 cursor-pointer"
                          >
                            إزالة من الموقع
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS LIST ── */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredList.map((p) => {
              const likesCount = likesCountMap[p.id] || 0;
              const isLowStock = (p.stock || 0) < 5;

              return (
                <div key={p.id} className="bg-[#121212] border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                  
                  {/* Badges indicators absolute top */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    {p.isBestSeller && <span className="bg-amber-500/10 text-[#D4AF37] text-[8px] font-black px-1.5 py-0.5 rounded border border-[#D4AF37]/20">مبيعاً</span>}
                    {p.isNew && <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-500/20">جديد</span>}
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-800">
                      <Image src={p.image || 'https://placehold.co/100x100/121212/D4AF37?text=Perfume'} alt={p.name || 'عطر'} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-100 truncate">{(p.name || '').split(' - ')[0]}</h3>
                      <p className="text-[10px] text-gray-500 truncate font-english">{(p.name || '').split(' - ')[1] || ''}</p>
                      <p className="text-[10px] text-[#D4AF37] mt-1">{p.categoryNameAr}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#1A1A1A] p-2.5 rounded-xl border border-gray-800/50 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-0.5">المخزون</span>
                      <span className={`font-black font-english ${isLowStock ? 'text-red-500' : 'text-gray-300'}`}>
                        {p.stock ?? 15}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-0.5">المفضلة</span>
                      <span className="font-black font-english text-red-400">
                        <i className="fa-solid fa-heart text-[8px] ml-1"></i>{likesCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-0.5">السعر الأساسي</span>
                      <span className="font-black font-english text-[#D4AF37]">{formatPriceVal(p.price)}ج</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="flex-1 bg-gray-800 text-gray-300 py-2 px-4 rounded-xl text-xs font-bold border border-gray-700 text-center cursor-pointer"
                    >
                      تعديل المنتج
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="flex-1 bg-red-950/20 text-red-400 py-2 px-4 rounded-xl text-xs font-bold border border-red-900/30 text-center cursor-pointer"
                    >
                      إزالة من الموقع
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ADD/EDIT PRODUCT DIALOG MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto select-none backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#D4AF37] border-opacity-30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slideUp max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#1A1A1A] border-b border-gray-800 p-5 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <i className="fa-solid fa-box-open"></i>
                <span>{editingProduct ? 'تعديل بيانات العطر' : 'إضافة عطر جديد للكتالوج'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-right">
              
              {formError && (
                <div className="bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl p-3 text-center text-xs">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">اسم المنتج بالكامل (مع الترجمة الإنجليزية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: غرام - Gharam Velvet"
                  className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-white focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-20 text-right"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category, Base Price & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">التصنيف</label>
                  <select
                    className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-gray-300 focus:ring-1 focus:ring-opacity-20 text-right"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="men">رجالي</option>
                    <option value="women">نسائي</option>
                    <option value="unisex">مشترك (للجنسين)</option>
                    <option value="gifts">بوكسات هدايا</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">السعر المبدئي (جنيه)</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 600"
                    className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-white text-right font-english"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">كمية المخزون (الستوك)</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 15"
                    className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-white text-right font-english"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              {/* Fragrance Notes (Hide if Gift category) */}
              {category !== 'gifts' ? (
                <div className="bg-[#1A1A1A] border border-gray-800/80 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-[#D4AF37]">النوتات العطرية والروائح (Notes)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400">القمة (Top Notes)</label>
                      <input
                        type="text"
                        placeholder="ليمون، نعناع"
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-2 px-3 text-xs text-white text-right"
                        value={topNotes}
                        onChange={(e) => setTopNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400">الوسط (Heart Notes)</label>
                      <input
                        type="text"
                        placeholder="ياسمين، بخور"
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-2 px-3 text-xs text-white text-right"
                        value={heartNotes}
                        onChange={(e) => setHeartNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400">القاعدة (Base Notes)</label>
                      <input
                        type="text"
                        placeholder="مسك، أخشاب"
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-lg py-2 px-3 text-xs text-white text-right"
                        value={baseNotes}
                        onChange={(e) => setBaseNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Gift Contents
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">محتويات بوكس الهدايا (تفاصيل الباقة)</label>
                  <input
                    type="text"
                    placeholder="مثال: عطر غرام 50مل، عطر دلع 50مل، مبخرة ذهبية، كرت إهداء"
                    className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-white text-right"
                    value={contents}
                    onChange={(e) => setContents(e.target.value)}
                  />
                </div>
              )}

              {/* Sizing Prices */}
              <div className="bg-[#1A1A1A] border border-gray-800/80 p-4 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-[#D4AF37]">تحديد الأحجام المتاحة وأسعارها</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 30 ML */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="checkbox" checked={size30Checked} onChange={(e) => setSize30Checked(e.target.checked)} />
                      <span className="font-english">30 ML</span>
                    </label>
                    {size30Checked && (
                      <input
                        type="number"
                        placeholder="السعر لعبوة 30مل"
                        required
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-1.5 px-2 text-xs text-white font-english text-right"
                        value={size30Price}
                        onChange={(e) => setSize30Price(e.target.value)}
                      />
                    )}
                  </div>

                  {/* 50 ML */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="checkbox" checked={size50Checked} onChange={(e) => setSize50Checked(e.target.checked)} />
                      <span className="font-english">50 ML</span>
                    </label>
                    {size50Checked && (
                      <input
                        type="number"
                        placeholder="السعر لعبوة 50مل"
                        required
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-1.5 px-2 text-xs text-white font-english text-right"
                        value={size50Price}
                        onChange={(e) => setSize50Price(e.target.value)}
                      />
                    )}
                  </div>

                  {/* 100 ML */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="checkbox" checked={size100Checked} onChange={(e) => setSize100Checked(e.target.checked)} />
                      <span className="font-english">100 ML</span>
                    </label>
                    {size100Checked && (
                      <input
                        type="number"
                        placeholder="السعر لعبوة 100مل"
                        required
                        className="w-full bg-[#121212] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-1.5 px-2 text-xs text-white font-english text-right"
                        value={size100Price}
                        onChange={(e) => setSize100Price(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">الوصف التفصيلي للمنتج</label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب وصف المنتج الذي سيظهر للعملاء في صفحة الشراء..."
                  className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs md:text-sm text-white text-right"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Flags Toggles & File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3 justify-center">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
                    <span className="text-gray-300">تمييز كـ "أكثر مبيعاً" (Best Seller)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                    <span className="text-gray-300">تمييز كـ "إصدار جديد بالدار" (New release)</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    صورة المنتج {editingProduct && <span className="text-[10px] text-gray-500">(اتركها فارغة للاحتفاظ بالصورة الحالية)</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingProduct}
                    className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2 px-3 outline-none text-xs text-gray-400"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-800 pt-5 flex gap-3 shrink-0 justify-between items-center">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteProduct(editingProduct.id, name);
                      setIsModalOpen(false);
                    }}
                    className="bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 py-2.5 px-5 rounded-xl text-xs md:text-sm border border-red-900/30 cursor-pointer font-bold transition-all"
                  >
                    إزالة المنتج من الموقع
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-800 text-gray-300 hover:text-white font-bold py-2.5 px-5 rounded-xl text-xs md:text-sm border border-gray-700 cursor-pointer"
                  >
                    إلغاء
                  </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-black font-bold py-2.5 px-6 rounded-xl text-xs md:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i>
                      <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                    </>
                  )}
                </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
