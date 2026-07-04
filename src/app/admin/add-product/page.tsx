'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddProduct() {
  // Input fields state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'men' | 'women' | 'unisex' | 'gifts'>('men');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNew, setIsNew] = useState(true);
  
  // Available Sizes and Prices
  const [size30Checked, setSize30Checked] = useState(false);
  const [size30Price, setSize30Price] = useState('');
  
  const [size50Checked, setSize50Checked] = useState(true);
  const [size50Price, setSize50Price] = useState('');
  
  const [size100Checked, setSize100Checked] = useState(false);
  const [size100Price, setSize100Price] = useState('');
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      if (!imageFile) {
        throw new Error('يرجى اختيار صورة للمنتج أولاً.');
      }

      // 1. Determine Arabic Category Label
      let categoryNameAr = 'العطور الرجالية';
      if (category === 'women') categoryNameAr = 'العطور النسائية';
      if (category === 'unisex') categoryNameAr = 'عطور للجنسين';
      if (category === 'gifts') categoryNameAr = 'بوكسات الهدايا';

      // 2. Format product sizes array
      const sizesArray: { ml: number; price: number }[] = [];
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
        throw new Error('يرجى تحديد حجم واحد متاح على الأقل للمنتج.');
      }

      // 3. Upload image to Supabase Storage Bucket
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`خطأ في رفع الصورة: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // 4. Insert Product Record into Database
      const { error: insertError } = await supabase.from('products').insert([
        {
          name,
          category,
          categoryNameAr,
          price: Number(price) || sizesArray[0].price,
          image: publicUrl,
          images: [publicUrl],
          isBestSeller,
          isNew,
          rating: 4.8, // Default rating
          reviewsCount: 1, // Default reviews
          description,
          notes: {
            top: topNotes,
            heart: heartNotes,
            base: baseNotes
          },
          sizes: sizesArray
        }
      ]);

      if (insertError) {
        throw insertError;
      }

      setStatusMessage({ text: 'تمت إضافة المنتج بنجاح إلى قاعدة البيانات!', isError: false });
      
      // Reset form fields
      setName('');
      setPrice('');
      setDescription('');
      setTopNotes('');
      setHeartNotes('');
      setBaseNotes('');
      setImageFile(null);
      setSize30Checked(false);
      setSize30Price('');
      setSize50Checked(true);
      setSize50Price('');
      setSize100Checked(false);
      setSize100Price('');
      
      // Reset file input
      const fileInput = document.getElementById('product-image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء الحفظ.';
      setStatusMessage({ text: errMsg, isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="view-add-product" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">لوحة إضافة منتج جديد</h1>
        <p>قم بتعبئة تفاصيل العطر لإضافته مباشرة لقاعدة بيانات دار العطور</p>
      </div>

      <div className="section-wrapper" style={{ marginTop: '20px' }}>
        <div className="checkout-card text-right" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
          <h3 className="checkout-title gold-text" style={{ borderBottom: '1px solid var(--border-gold)', paddingBottom: '10px', marginBottom: '20px' }}>
            <i className="fa-solid fa-plus-circle" style={{ marginLeft: '10px' }}></i> تفاصيل المنتج الجديد
          </h3>

          {statusMessage && (
            <div 
              style={{
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: statusMessage.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${statusMessage.isError ? '#ef4444' : '#10b981'}`,
                color: statusMessage.isError ? '#f87171' : '#34d399',
                textAlign: 'center'
              }}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="checkout-form-rows">
              
              {/* Product Name */}
              <div className="form-group-checkout">
                <label className="block text-sm mb-1 text-gray-300">اسم المنتج (بالكامل مع الترجمة الإنجليزية)</label>
                <input
                  type="text"
                  placeholder="مثال: غرام - Gharam Velvet"
                  className="premium-input w-full"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category and Base Price */}
              <div className="form-row-2col">
                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">التصنيف الرئيسي</label>
                  <select
                    className="select-premium w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'men' | 'women' | 'unisex' | 'gifts')}
                  >
                    <option value="men">رجالي</option>
                    <option value="women">نسائي</option>
                    <option value="unisex">مشترك (للجنسين)</option>
                    <option value="gifts">بوكسات هدايا</option>
                  </select>
                </div>
                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">السعر الأساسي المبدئي (جنيه)</label>
                  <input
                    type="number"
                    placeholder="مثال: 600"
                    className="premium-input w-full"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Fragrance Notes */}
              <div style={{ background: '#121212', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a', margin: '15px 0' }}>
                <h4 className="gold-text text-sm font-bold mb-3">النوتات العطرية والروائح (Product Notes)</h4>
                <div className="form-row-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div className="form-group-checkout" style={{ marginBottom: 0 }}>
                    <label className="block text-xs mb-1 text-gray-400">القمة العطرية (Top Notes)</label>
                    <input
                      type="text"
                      placeholder="برغموت، تفاح"
                      className="premium-input w-full"
                      value={topNotes}
                      onChange={(e) => setTopNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group-checkout" style={{ marginBottom: 0 }}>
                    <label className="block text-xs mb-1 text-gray-400">القلب العطري (Heart Notes)</label>
                    <input
                      type="text"
                      placeholder="ياسمين، لافندر"
                      className="premium-input w-full"
                      value={heartNotes}
                      onChange={(e) => setHeartNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-group-checkout" style={{ marginBottom: 0 }}>
                    <label className="block text-xs mb-1 text-gray-400">القاعدة العطرية (Base Notes)</label>
                    <input
                      type="text"
                      placeholder="خشب الصندل، مسك"
                      className="premium-input w-full"
                      value={baseNotes}
                      onChange={(e) => setBaseNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sizes Checkboxes and Prices */}
              <div style={{ background: '#121212', padding: '15px', borderRadius: '8px', border: '1px solid #1a1a1a', margin: '15px 0' }}>
                <h4 className="gold-text text-sm font-bold mb-3">الأحجام والأسعار لكل حجم</h4>
                
                {/* 30 ML */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={size30Checked}
                      onChange={(e) => setSize30Checked(e.target.checked)}
                    />
                    <span>30 ML</span>
                  </label>
                  {size30Checked && (
                    <input
                      type="number"
                      placeholder="سعر عبوة 30 مل"
                      className="premium-input"
                      style={{ padding: '4px 10px', fontSize: '0.9rem', width: '200px' }}
                      value={size30Price}
                      onChange={(e) => setSize30Price(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* 50 ML */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={size50Checked}
                      onChange={(e) => setSize50Checked(e.target.checked)}
                    />
                    <span>50 ML</span>
                  </label>
                  {size50Checked && (
                    <input
                      type="number"
                      placeholder="سعر عبوة 50 مل"
                      className="premium-input"
                      style={{ padding: '4px 10px', fontSize: '0.9rem', width: '200px' }}
                      value={size50Price}
                      onChange={(e) => setSize50Price(e.target.value)}
                      required
                    />
                  )}
                </div>

                {/* 100 ML */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={size100Checked}
                      onChange={(e) => setSize100Checked(e.target.checked)}
                    />
                    <span>100 ML</span>
                  </label>
                  {size100Checked && (
                    <input
                      type="number"
                      placeholder="سعر عبوة 100 مل"
                      className="premium-input"
                      style={{ padding: '4px 10px', fontSize: '0.9rem', width: '200px' }}
                      value={size100Price}
                      onChange={(e) => setSize100Price(e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group-checkout">
                <label className="block text-sm mb-1 text-gray-300">وصف المنتج</label>
                <textarea
                  placeholder="اكتب وصفاً جذاباً وتفصيلياً للعطر الجديد..."
                  className="premium-input w-full"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Flags and Image Upload */}
              <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
                {/* Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                    />
                    <span className="text-sm text-gray-300">تمييز المنتج كأكثر مبيعاً (Best Seller)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                    />
                    <span className="text-sm text-gray-300">تمييز المنتج كإصدار جديد بالدار (New Release)</span>
                  </label>
                </div>

                {/* File Input */}
                <div className="form-group-checkout" style={{ marginBottom: 0 }}>
                  <label className="block text-sm mb-1 text-gray-300">صورة العطر</label>
                  <input
                    id="product-image-input"
                    type="file"
                    accept="image/*"
                    className="premium-input w-full"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>
                    يرجى رفع ملفات بصيغة jpg، png، أو jpeg بجودة جيدة.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-premium w-full"
                style={{ marginTop: '30px', padding: '12px', fontSize: '1.05rem', fontWeight: 'bold' }}
                disabled={submitting}
              >
                {submitting ? (
                  <span>جاري الرفع والحفظ... <i className="fa-solid fa-spinner fa-spin"></i></span>
                ) : (
                  <span>إضافة المنتج لقاعدة البيانات</span>
                )}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
