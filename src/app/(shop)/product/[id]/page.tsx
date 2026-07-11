'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';

function getSizeImage(productName: string, sizeMl: number): string {
  const name = productName.toLowerCase();
  if (name.includes("غرام") || name.includes("gharam")) {
    return "/images/gh.jpeg";
  }
  if (
    name.includes("دلع") ||
    name.includes("dala") ||
    name.includes("مجد") ||
    name.includes("majd")
  ) {
    return "/images/mm30ml.jpeg";
  }
  return sizeMl === 30 ? "/images/30ml.jpeg" : "/images/50ml.jpeg";
}

const PERFUMES_LIST = ["نقاء", "هيبة", "نبض", "دلع", "مجد", "غرام", "سحر"];

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { products, wishlist, toggleWishlist, addToCart, buyNow, giftBoxTypes } = useApp();

  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [selectedSizeMl, setSelectedSizeMl] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [boxType, setBoxType] = useState('luxury');
  const [giftMessage, setGiftMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Custom Gift Box Wizard States
  const [mixedVariant, setMixedVariant] = useState<'2' | '3'>('2');
  const [selectedPerfumes, setSelectedPerfumes] = useState<Product[]>([]);
  const [uniformSizeMl, setUniformSizeMl] = useState<number>(30);
  const [perfumeSizes, setPerfumeSizes] = useState<{ [id: number]: number }>({});
  const [activeStep, setActiveStep] = useState<number>(1);

  const getPerfumePrice = (p: Product, ml: number) => {
    const sz = p.sizes.find(s => s.ml === ml);
    return sz ? sz.price : (ml === 30 ? 350 : 450);
  };

  const dynamicPrice = (() => {
    if (!product || product.category !== 'gifts') return null;
    
    const count = product.id === 13 && mixedVariant === '2' ? 2 : 3;
    let sum = 0;
    
    for (let i = 0; i < count; i++) {
      const p = selectedPerfumes[i];
      if (p) {
        const ml = (product.id === 13 && mixedVariant === '2') ? (perfumeSizes[p.id] || 30) : uniformSizeMl;
        sum += getPerfumePrice(p, ml);
      } else {
        const ml = (product.id === 13 && mixedVariant === '2') ? 30 : uniformSizeMl;
        sum += (ml === 30 ? 350 : 450);
      }
    }
    
    return sum - 50; // flat 50 EGP discount
  })();

  const isSelectionComplete = (() => {
    if (!product) return false;
    if (product.category !== 'gifts') return true;
    
    const requiredPerfumeCount = product.id === 13 && mixedVariant === '2' ? 2 : 3;
    return selectedPerfumes.length === requiredPerfumeCount;
  })();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      // Try to find it in context first
      const found = products.find(p => p.id === productId);
      if (found) {
        setProduct(found);
        setLoading(false);
      } else {
        // Query directly from database
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (!error && data) {
          setProduct(data);
        }
        setLoading(false);
      }
    }
    if (productId) {
      loadProduct();
    }
  }, [productId, products]);

  useEffect(() => {
    if (product) {
      if (product.category === 'gifts') {
        setSelectedSizeMl(100);
      } else if (product.sizes.length === 1) {
        setSelectedSizeMl(product.sizes[0].ml);
      } else {
        setSelectedSizeMl(null);
      }
      setActiveImage(product.image);
      setQty(1);
      setBoxType('عطور رجالية');
      setGiftMessage('');
      
      // Reset custom gift box wizard states
      setMixedVariant('2');
      setSelectedPerfumes([]);
      setUniformSizeMl(30);
      setPerfumeSizes({});
      setActiveStep(1);
    }
  }, [product]);

  // Update active image dynamically when size changes
  useEffect(() => {
    if (product && product.category !== 'gifts' && selectedSizeMl !== null) {
      const sizeImg = getSizeImage(product.name, selectedSizeMl);
      setActiveImage(sizeImg);
    }
  }, [selectedSizeMl, product]);

  if (loading) {
    return (
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 gold-text"></i>
        <p>جاري تحميل تفاصيل العطر الفاخر...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 gold-text"></i>
        <p className="mb-6">عذراً، لم نجد المنتج الذي تبحث عنه.</p>
        <Link href="/shop" className="btn-premium">
          العودة للمعرض
        </Link>
      </div>
    );
  }

  // Get active size details
  const sizeObj = product.sizes.find(s => s.ml === selectedSizeMl) || product.sizes[0];

  // Wishlist state
  const isWishlisted = wishlist.includes(product.id) ? 'active' : '';

  // Related products (up to 4 products in same category excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Get dynamic gallery images
  const galleryImages = (() => {
    if (!product) return [];
    if (product.category === 'gifts') return product.images || [product.image];

    const baseImages = product.images || [product.image];
    
    // If no size is selected yet, we only show the original product photos
    if (selectedSizeMl === null) {
      if (baseImages.length >= 3) {
        // Skip the size image at index 1
        return [baseImages[0], ...baseImages.slice(2)];
      }
      return baseImages;
    }

    const sizeImg = getSizeImage(product.name, selectedSizeMl);
    const gallery = [...baseImages];
    if (gallery.length > 2) {
      gallery[1] = sizeImg;
    } else if (gallery.length === 2) {
      gallery.splice(1, 0, sizeImg);
    } else {
      gallery.push(sizeImg);
    }
    return gallery;
  })();

  const handleAddToCart = () => {
    if (product.category !== 'gifts' && selectedSizeMl === null) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    if (product.category === 'gifts') {
      if (!isSelectionComplete) return;
      const customSizeObj = {
        isCustomGift: true,
        box_type: product.id === 9 ? 'رجالي' : product.id === 11 ? 'نسائي' : 'مشترك',
        box_variant: product.id === 13 ? (mixedVariant === '2' ? '2_perfumes' : '3_perfumes') : '3_perfumes',
        ml: 100,
        price: dynamicPrice,
        perfumes: selectedPerfumes.map(p => ({
          id: p.id,
          name: p.name.split(' - ')[0],
          size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[p.id] || 30) : uniformSizeMl
        })),
        // Legacy compat fields
        perfume1: selectedPerfumes[0]?.name.split(' - ')[0],
        perfume1Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[0]?.id] || 30) : uniformSizeMl,
        perfume2: selectedPerfumes[1]?.name.split(' - ')[0],
        perfume2Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[1]?.id] || 30) : uniformSizeMl,
        perfume3: selectedPerfumes[2]?.name.split(' - ')[0],
        perfume3Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[2]?.id] || 30) : uniformSizeMl
      };
      addToCart(
        product.id,
        100,
        qty,
        undefined,
        undefined,
        customSizeObj
      );
    } else {
      addToCart(
        product.id,
        selectedSizeMl!,
        qty,
        undefined,
        undefined
      );
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (product.category !== 'gifts' && selectedSizeMl === null) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    if (product.category === 'gifts') {
      if (!isSelectionComplete) return;
      const customSizeObj = {
        isCustomGift: true,
        box_type: product.id === 9 ? 'رجالي' : product.id === 11 ? 'نسائي' : 'مشترك',
        box_variant: product.id === 13 ? (mixedVariant === '2' ? '2_perfumes' : '3_perfumes') : '3_perfumes',
        ml: 100,
        price: dynamicPrice,
        perfumes: selectedPerfumes.map(p => ({
          id: p.id,
          name: p.name.split(' - ')[0],
          size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[p.id] || 30) : uniformSizeMl
        })),
        // Legacy compat fields
        perfume1: selectedPerfumes[0]?.name.split(' - ')[0],
        perfume1Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[0]?.id] || 30) : uniformSizeMl,
        perfume2: selectedPerfumes[1]?.name.split(' - ')[0],
        perfume2Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[1]?.id] || 30) : uniformSizeMl,
        perfume3: selectedPerfumes[2]?.name.split(' - ')[0],
        perfume3Size: product.id === 13 && mixedVariant === '2' ? (perfumeSizes[selectedPerfumes[2]?.id] || 30) : uniformSizeMl
      };
      buyNow(
        product.id,
        100,
        qty,
        undefined,
        undefined,
        customSizeObj
      );
    } else {
      buyNow(
        product.id,
        selectedSizeMl!,
        qty,
        undefined,
        undefined
      );
    }
    router.push('/checkout');
  };

  return (
    <div id="view-product" className="active">
      {/* Arabic Add-to-Cart Toast */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: `translateX(-50%) translateY(${showToast ? '0' : '20px'})`,
          opacity: showToast ? 1 : 0,
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          background: 'linear-gradient(135deg, #1a1200, #2a1d00)',
          border: '1px solid var(--primary-gold)',
          borderRadius: '50px',
          padding: '12px 28px',
          color: 'var(--primary-gold)',
          fontWeight: 700,
          fontSize: '1rem',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(212,175,55,0.25)',
          whiteSpace: 'nowrap'
        }}
      >
        <i className="fa-solid fa-circle-check" style={{ fontSize: '1.1rem' }}></i>
        تمت الإضافة إلى السلة
      </div>

      {/* Arabic Select Size Warning Toast */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: `translateX(-50%) translateY(${sizeError ? '0' : '20px'})`,
          opacity: sizeError ? 1 : 0,
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          background: 'linear-gradient(135deg, #2b0b0b, #1d0505)',
          border: '1px solid #ff4d4d',
          borderRadius: '50px',
          padding: '12px 28px',
          color: '#ff4d4d',
          fontWeight: 700,
          fontSize: '1rem',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(255, 77, 77, 0.25)',
          whiteSpace: 'nowrap'
        }}
      >
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.1rem' }}></i>
        الرجاء اختيار الحجم أولاً
      </div>

      <div className="section-wrapper" style={{ marginTop: '30px' }}>
        {/* Back link button */}
        <button
          className="btn-outline-gold"
          style={{ padding: '8px 20px', fontSize: '0.85rem', marginBottom: '25px' }}
          onClick={() => router.push('/shop')}
        >
          <i className="fa-solid fa-arrow-right" style={{ marginLeft: '5px' }}></i> العودة للمتجر
        </button>

        <div className="product-details-container">
          {/* Left: Gallery */}
          <div className="details-gallery">
            <div className="gallery-main">
              <Image
                src={activeImage || product.image}
                alt={product.name}
                fill
                className="gallery-main-img"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            
            {/* Gallery Thumbnails (only if product has multiple images) */}
            {galleryImages && galleryImages.length > 0 && (
              <div className="gallery-thumbs">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`gallery-thumb-item ${(activeImage || product.image) === img ? 'active' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <Image
                      src={img}
                      alt={`تفاصيل العطر ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="90px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Spec and purchase inputs */}
          <div className="details-info text-right">
            <span className="product-card-category">{product.categoryNameAr}</span>
            <h1 className="details-title gold-text">{product.name.split(' - ')[0]}</h1>

            <div className="details-price-bar">
              <div className="details-price-block">
                {sizeObj.originalPrice && (
                  <span className="details-original-price">
                    <span className="english-num">{sizeObj.originalPrice * qty}</span> جنيه
                  </span>
                )}
                <span className="details-price">
                  <span className="english-num">
                    {product.category === 'gifts' ? (dynamicPrice! * qty) : (sizeObj.price * qty)}
                  </span>{' '}
                  جنيه
                </span>
              </div>
              <div className="product-card-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`fa-solid fa-star ${
                      i < Math.floor(product.rating) ? 'text-amber-500' : 'text-gray-600'
                    }`}
                  ></i>
                ))}
                <span className="english-num mr-2">({product.reviewsCount} تقييم)</span>
              </div>
            </div>

            {/* Size Selector */}
            {product.category !== 'gifts' && product.sizes.length > 1 && (
              <div className="filter-group">
                <h4 className="filter-title">الحجم المتوفر:</h4>
                <div className="size-selector">
                  {product.sizes.map(sz => (
                    <button
                      key={sz.ml}
                      className={`size-option-btn ${selectedSizeMl === sz.ml ? 'active' : ''}`}
                      onClick={() => setSelectedSizeMl(sz.ml)}
                      type="button"
                    >
                      {sz.ml} ML
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customizable Gift Box Wizard */}
            {product.category === 'gifts' && (
              <div className="gift-box-builder bg-[#171717]/60 border border-yellow-600/10 rounded-2xl p-5 mb-6 text-right">
                <h3 className="gold-text font-bold text-base mb-4 flex items-center gap-2 justify-end">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  مصمم البوكس المخصص
                </h3>

                {/* Variant Selector (Only for Mixed Box 13) */}
                {product.id === 13 && (
                  <div className="mb-5 border-b border-gray-800/60 pb-4 flex flex-col items-end">
                    <label className="text-xs text-gray-400 block mb-2 font-bold">نوع البوكس المشترك:</label>
                    <div className="flex gap-3 justify-end w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setMixedVariant('3');
                          setSelectedPerfumes([]);
                        }}
                        className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all text-center ${
                          mixedVariant === '3'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-500'
                            : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        3 عطور (حجم موحد)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMixedVariant('2');
                          setSelectedPerfumes([]);
                        }}
                        className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all text-center ${
                          mixedVariant === '2'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-500'
                            : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        عطرين (أحجام مستقلة)
                      </button>
                    </div>
                  </div>
                )}

                {/* Choose Perfumes Grid */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] text-amber-500 font-bold">
                      تم اختيار {selectedPerfumes.length} من {product.id === 13 && mixedVariant === '2' ? 2 : 3}
                    </span>
                    <h4 className="text-gray-300 font-bold text-xs">اختر عطورك المفضلة:</h4>
                  </div>

                  <div className="perfumes-grid max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
                    {products
                      .filter(p => {
                        if (product.id === 9) return p.category === 'men';
                        if (product.id === 11) return p.category === 'women';
                        return p.category === 'men' || p.category === 'women';
                      })
                      .map(p => {
                        const isSelected = selectedPerfumes.some(sp => sp.id === p.id);
                        const limit = product.id === 13 && mixedVariant === '2' ? 2 : 3;
                        
                        const handleSelect = () => {
                          if (isSelected) {
                            setSelectedPerfumes(selectedPerfumes.filter(sp => sp.id !== p.id));
                          } else {
                            if (selectedPerfumes.length < limit) {
                              setSelectedPerfumes([...selectedPerfumes, p]);
                            }
                          }
                        };

                        return (
                          <div
                            key={p.id}
                            onClick={handleSelect}
                            className={`perfume-selection-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div className="perfume-selection-card-img-wrapper">
                              <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                sizes="120px"
                                className="object-contain p-1"
                              />
                            </div>
                            <span className="perfume-selection-card-name">{p.name.split(' - ')[0]}</span>
                            <span className="perfume-selection-card-category">
                              {p.category === 'men' ? 'رجالي' : 'نسائي'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Choose Sizes - Displayed directly below the card selection */}
                <div className="border-t border-gray-800/60 pt-4 mb-4">
                  {!(product.id === 13 && mixedVariant === '2') ? (
                    /* Uniform Size Selector */
                    <div className="bg-black/20 p-3 rounded-xl border border-gray-800/80 text-center">
                      <label className="text-[11px] text-gray-400 block mb-2 font-bold">حجم موحد لكافة عطور البوكس:</label>
                      <div className="flex justify-center gap-3">
                        {[30, 50].map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setUniformSizeMl(size)}
                            className={`px-6 py-2 rounded-lg border font-bold text-xs font-english transition-all ${
                              uniformSizeMl === size
                                ? 'border-amber-500 bg-amber-500/5 text-amber-500'
                                : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-700'
                            }`}
                          >
                            {size} ML
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Independent Size Selectors for Selected Perfumes */
                    <div>
                      <label className="text-[11px] text-gray-400 block mb-2 font-bold text-right">أحجام العطور المختارة:</label>
                      {selectedPerfumes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPerfumes.map(p => {
                            const currentSize = perfumeSizes[p.id] || 30;
                            return (
                              <div key={p.id} className="flex justify-between items-center p-2.5 rounded-xl border border-gray-800 bg-black/20">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-8 h-10">
                                    <Image
                                      src={p.image}
                                      alt={p.name}
                                      fill
                                      className="object-contain"
                                      sizes="30px"
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-gray-300">{p.name.split(' - ')[0]}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  {[30, 50].map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => setPerfumeSizes({ ...perfumeSizes, [p.id]: size })}
                                      className={`px-3 py-1 rounded-lg border font-bold text-[11px] font-english transition-all ${
                                        currentSize === size
                                          ? 'border-amber-500 bg-amber-500/5 text-amber-500'
                                          : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-700'
                                      }`}
                                    >
                                      {size} ML
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-2 text-xs">يرجى اختيار العطور أولاً لتحديد أحجامها.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Running Summary / Preview Panel */}
                <div className="mt-4 p-3 bg-black/30 border border-gray-800/80 rounded-xl text-right">
                  <h4 className="text-[10px] text-gray-400 font-bold mb-2">ملخص البوكس الجاري تصميمه:</h4>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="font-bold gold-text">
                        {product.id === 9 ? 'رجالي' : product.id === 11 ? 'نسائي' : 'مشترك'} 
                        ({product.id === 13 && mixedVariant === '2' ? 'عطرين' : '3 عطور'})
                      </span>
                      <span>نوع البوكس:</span>
                    </div>

                    {selectedPerfumes.length > 0 ? (
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col items-end gap-0.5">
                          {selectedPerfumes.map(sp => {
                            const size = product.id === 13 && mixedVariant === '2' ? (perfumeSizes[sp.id] || 30) : uniformSizeMl;
                            return (
                              <span key={sp.id} className="text-gray-300">
                                {sp.name.split(' - ')[0]} ({size}مل)
                              </span>
                            );
                          })}
                        </div>
                        <span>العطور المختارة:</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-1">لم يتم اختيار أي عطور بعد.</div>
                    )}

                    <div className="border-t border-gray-800/60 pt-2 flex justify-between font-bold text-sm">
                      <span className="gold-text"><span className="english-num">{dynamicPrice}</span> جنيه</span>
                      <span>السعر الإجمالي (شامل الخصم):</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity control & Add to Cart button */}
            <div className="purchase-actions">
              {/* Row 1: qty + add-to-cart side by side */}
              <div className="purchase-actions-row">
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    type="button"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={qty}
                    readOnly
                    className="qty-input"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => setQty(qty + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  className="btn-premium btn-add-cart-large"
                  onClick={handleAddToCart}
                  type="button"
                  disabled={!isSelectionComplete}
                  style={{ opacity: isSelectionComplete ? 1 : 0.5, cursor: isSelectionComplete ? 'pointer' : 'not-allowed' }}
                >
                  <i className="fa-solid fa-bag-shopping"></i> إضافة إلى السلة
                </button>
              </div>

              {/* Row 2: Buy Now — goes directly to checkout */}
              <button
                className="buy-now-btn-large"
                onClick={handleBuyNow}
                type="button"
                disabled={!isSelectionComplete}
                style={{ opacity: isSelectionComplete ? 1 : 0.5, cursor: isSelectionComplete ? 'pointer' : 'not-allowed' }}
              >
                <i className="fa-solid fa-bolt"></i> اشتري الان
              </button>

              {/* Wishlist */}
              <button
                className={`btn-wishlist-large ${isWishlisted}`}
                onClick={() => toggleWishlist(product.id)}
                type="button"
                title="تفضيل"
              >
                <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>

            <p className="details-desc">{product.description}</p>



            {/* Fragrance Notes Display */}
            {product.notes && (
              <div className="fragrance-notes-display">
                {/* Top Note */}
                <div className="note-display-card">
                  <div className="note-card-header">
                    <i className="fa-solid fa-wind note-icon"></i>
                    <span>مقدمة العطر (Top Notes)</span>
                  </div>
                  <div className="note-card-content">{product.notes.top}</div>
                </div>

                {/* Heart Note */}
                <div className="note-display-card">
                  <div className="note-card-header">
                    <i className="fa-solid fa-heart note-icon"></i>
                    <span>قلب العطر (Heart Notes)</span>
                  </div>
                  <div className="note-card-content">{product.notes.heart}</div>
                </div>

                {/* Base Note */}
                <div className="note-display-card">
                  <div className="note-card-header">
                    <i className="fa-solid fa-gem note-icon"></i>
                    <span>قاعدة العطر (Base Notes)</span>
                  </div>
                  <div className="note-card-content">{product.notes.base}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="section-wrapper" style={{ marginTop: '80px', borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
            <div className="section-header">
              <h2>عطور ذات صلة</h2>
              <p>روائح ونفحات عطرية قد تنال إعجابك أيضاً</p>
            </div>
            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
