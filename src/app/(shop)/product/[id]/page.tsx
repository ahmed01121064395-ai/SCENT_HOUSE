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
  if (name.includes("دلع") || name.includes("dala")) {
    return sizeMl === 30 ? "/images/d30ml.jpeg" : "/images/mm30ml.jpeg";
  }
  if (name.includes("مجد") || name.includes("majd")) {
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

  // Swipe and Gallery Navigation States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Custom Gift Box Wizard States
  const [mixedVariant, setMixedVariant] = useState<'2' | '3'>('2');
  const [selectedSlots, setSelectedSlots] = useState<{ product: Product, sizeMl: number }[]>([]);
  const [uniformSizeMl, setUniformSizeMl] = useState<number>(30);

  const getPerfumePrice = (p: Product, ml: number) => {
    const sz = p.sizes.find(s => s.ml === ml);
    return sz ? sz.price_after_discount : (ml === 30 ? 350 : 450);
  };

  const dynamicPrice = (() => {
    if (!product || product.category !== 'gifts') return null;
    
    const limit = product.id === 13 && mixedVariant === '2' ? 2 : 3;
    let sum = 0;
    
    for (let i = 0; i < limit; i++) {
      const slot = selectedSlots[i];
      if (slot) {
        sum += getPerfumePrice(slot.product, slot.sizeMl);
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
    return selectedSlots.length === requiredPerfumeCount;
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
        const has50 = product.sizes.some(s => s.ml === 50);
        setSelectedSizeMl(has50 ? 50 : (product.sizes[0]?.ml || null));
      }
      setActiveImage(product.image);
      setQty(1);
      setBoxType('عطور رجالية');
      setGiftMessage('');
      
      // Reset custom gift box wizard states
      setMixedVariant('2');
      setSelectedSlots([]);
      setUniformSizeMl(30);
    }
  }, [product]);

  // (image navigation is handled directly in size button onClick)

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
  const originalPriceToShow = sizeObj?.price_before_discount || null;
  const currentPriceToShow = product.category === 'gifts' ? dynamicPrice! : (sizeObj?.price_after_discount || product.price);

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

    const imgs = product.images || [product.image];
    
    // Check if 30ml and 50ml images already exist in the gallery list
    const has30 = imgs.some(img => img.includes('30ml') || img.includes('30_ml') || img.includes('30-ml') || img.includes('mm30ml') || img.includes('d30ml'));
    const has50 = imgs.some(img => img.includes('50ml') || img.includes('50_ml') || img.includes('50-ml') || img.includes('heeba2') || img.includes('sehr2') || img.includes('nabd2') || img.includes('dalaa2') || img.includes('magd2') || img.includes('gharam2') || img.includes('naqaa2'));
    
    const size30Img = getSizeImage(product.name, 30);
    const size50Img = getSizeImage(product.name, 50);
    
    let result = [...imgs];
    
    // Insert 30ml image if missing and product supports it
    if (!has30 && product.sizes.some(s => s.ml === 30)) {
      result.splice(1, 0, size30Img);
    }
    
    // Insert 50ml image if missing and product supports it
    if (!has50 && product.sizes.some(s => s.ml === 50)) {
      const idx = result.indexOf(size30Img);
      if (idx > -1) {
        result.splice(idx + 1, 0, size50Img);
      } else {
        result.splice(1, 0, size50Img);
      }
    }
    
    return Array.from(new Set(result));
  })();

  const handlePrevImage = () => {
    if (!galleryImages || galleryImages.length === 0) return;
    const currentIdx = galleryImages.indexOf(activeImage || product.image);
    const prevIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIdx]);
  };

  const handleNextImage = () => {
    if (!galleryImages || galleryImages.length === 0) return;
    const currentIdx = galleryImages.indexOf(activeImage || product.image);
    const nextIdx = (currentIdx + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

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
        perfumes: selectedSlots.map(s => ({
          id: s.product.id,
          name: s.product.name.split(' - ')[0],
          size: s.sizeMl
        })),
        // Legacy compat fields
        perfume1: selectedSlots[0]?.product.name.split(' - ')[0],
        perfume1Size: selectedSlots[0]?.sizeMl || uniformSizeMl,
        perfume2: selectedSlots[1]?.product.name.split(' - ')[0],
        perfume2Size: selectedSlots[1]?.sizeMl || uniformSizeMl,
        perfume3: selectedSlots[2]?.product.name.split(' - ')[0],
        perfume3Size: selectedSlots[2]?.sizeMl || uniformSizeMl
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
        perfumes: selectedSlots.map(s => ({
          id: s.product.id,
          name: s.product.name.split(' - ')[0],
          size: s.sizeMl
        })),
        // Legacy compat fields
        perfume1: selectedSlots[0]?.product.name.split(' - ')[0],
        perfume1Size: selectedSlots[0]?.sizeMl || uniformSizeMl,
        perfume2: selectedSlots[1]?.product.name.split(' - ')[0],
        perfume2Size: selectedSlots[1]?.sizeMl || uniformSizeMl,
        perfume3: selectedSlots[2]?.product.name.split(' - ')[0],
        perfume3Size: selectedSlots[2]?.sizeMl || uniformSizeMl
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
            <div
              className="gallery-main relative group"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Image
                src={activeImage || product.image}
                alt={product.name}
                fill
                className="gallery-main-img"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Navigation Arrows & Swipe indicators */}
              {galleryImages && galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-gray-700/30 transition-all opacity-0 group-hover:opacity-100 md:opacity-100 cursor-pointer z-10"
                    title="الصورة السابقة"
                  >
                    <i className="fa-solid fa-chevron-left text-sm"></i>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-gray-700/30 transition-all opacity-0 group-hover:opacity-100 md:opacity-100 cursor-pointer z-10"
                    title="الصورة التالية"
                  >
                    <i className="fa-solid fa-chevron-right text-sm"></i>
                  </button>
                  
                  {/* Slide indicators / dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 px-2.5 py-1 rounded-full">
                    {galleryImages.map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          galleryImages.indexOf(activeImage || product.image) === i 
                            ? 'bg-[#D4AF37] scale-125' 
                            : 'bg-gray-400/60'
                        }`}
                      ></span>
                    ))}
                  </div>
                </>
              )}
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
                {originalPriceToShow && (
                  <span className="details-original-price">
                    <span className="english-num">{originalPriceToShow * qty}</span> جنيه
                  </span>
                )}
                <span className="details-price">
                  <span className="english-num">
                    {currentPriceToShow * qty}
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
                  {product.sizes.map((sz, sIdx) => (
                    <button
                      key={sz.ml}
                      className={`size-option-btn ${selectedSizeMl === sz.ml ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSizeMl(sz.ml);
                        // Navigate carousel to the image that matches this size
                        // Image layout: [0]=hero, [1]=1st-size-img, [2]=2nd-size-img, [3]=4th-dalaa-img
                        const targetImgIndex = sIdx + 1; // offset by 1 to skip hero image
                        if (galleryImages[targetImgIndex]) {
                          setActiveImage(galleryImages[targetImgIndex]);
                        }
                      }}
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
              <div className="gift-box-builder mb-6 text-right">

                {/* Variant Selector (Only for Mixed Box 13) */}
                {product.id === 13 && (
                  <div className="mb-5 border-b border-gray-800/60 pb-4 flex flex-col items-end">
                    <label className="text-xs text-gray-400 block mb-2 font-bold">نوع البوكس المشترك:</label>
                    <div className="flex gap-3 justify-end w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setMixedVariant('3');
                          setSelectedSlots([]);
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
                          setSelectedSlots([]);
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
                      تم اختيار {selectedSlots.length} من {product.id === 13 && mixedVariant === '2' ? 2 : 3}
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
                        const count = selectedSlots.filter(s => s.product.id === p.id).length;
                        const limit = product.id === 13 && mixedVariant === '2' ? 2 : 3;
                        
                        const handleIncrement = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (selectedSlots.length < limit) {
                            setSelectedSlots([...selectedSlots, { product: p, sizeMl: 30 }]);
                          }
                        };

                        const handleDecrement = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          const idx = selectedSlots.map(s => s.product.id).lastIndexOf(p.id);
                          if (idx > -1) {
                            const updated = [...selectedSlots];
                            updated.splice(idx, 1);
                            setSelectedSlots(updated);
                          }
                        };

                        return (
                          <div
                            key={p.id}
                            onClick={handleIncrement}
                            className={`perfume-selection-card ${count > 0 ? 'selected' : ''}`}
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
                            <div className="flex items-center gap-1.5 justify-center mt-0.5">
                              <span className="perfume-selection-card-category">
                                {p.category === 'men' ? 'رجالي' : 'نسائي'}
                              </span>
                              <span className="text-[10px] text-gray-500 font-bold english-num">
                                {p.sizes[0]?.price_before_discount ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-1">{p.sizes[0].price_before_discount}</span>
                                    <span className="text-amber-600">{p.sizes[0].price_after_discount}ج</span>
                                  </>
                                ) : (
                                  <span>{p.sizes[0]?.price_after_discount || p.price}ج</span>
                                )}
                              </span>
                            </div>
                            
                            {/* Quantity Stepper Controls */}
                            <div className="flex items-center gap-2.5 mt-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={handleDecrement}
                                disabled={count === 0}
                              className="w-6 h-6 rounded bg-white border border-gray-300 font-bold text-xs flex items-center justify-center text-gray-700 disabled:opacity-30 cursor-pointer hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-gray-800 min-w-[12px] text-center font-english">{count}</span>
                              <button
                                type="button"
                                onClick={handleIncrement}
                                disabled={selectedSlots.length >= limit}
                              className="w-6 h-6 rounded bg-white border border-gray-300 font-bold text-xs flex items-center justify-center text-gray-700 disabled:opacity-30 cursor-pointer hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Choose Sizes - Displayed directly below the card selection */}
                <div className="border-t border-gray-800/60 pt-4 mb-4">
                  {!(product.id === 13 && mixedVariant === '2') ? (
                    /* Uniform Size Selector */
                    <div className="text-center pt-2">
                      <label className="text-[11px] text-gray-400 block mb-2 font-bold">حجم موحد لكافة عطور البوكس:</label>
                      <div className="flex justify-center gap-3">
                        {[30, 50].map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setUniformSizeMl(size);
                              // Sync all slot sizes
                              setSelectedSlots(selectedSlots.map(s => ({ ...s, sizeMl: size })));
                            }}
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
                      {selectedSlots.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSlots.map((slot, index) => {
                            const handleUpdateSlotSize = (size: number) => {
                              const updated = [...selectedSlots];
                              if (updated[index]) {
                                updated[index].sizeMl = size;
                                setSelectedSlots(updated);
                              }
                            };

                            return (
                              <div key={index} className="flex justify-between items-center py-2.5 border-b border-gray-800/40 last:border-b-0">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-8 h-10">
                                    <Image
                                      src={slot.product.image}
                                      alt={slot.product.name}
                                      fill
                                      className="object-contain"
                                      sizes="30px"
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-gray-300">
                                    {slot.product.name.split(' - ')[0]} (عطر {index + 1})
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  {[30, 50].map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handleUpdateSlotSize(size)}
                                      className={`px-3 py-1 rounded-lg border font-bold text-[11px] font-english transition-all ${
                                        slot.sizeMl === size
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
                <div className="mt-4 pt-3 border-t border-gray-800/60 text-right">
                  <h4 className="text-[10px] text-gray-400 font-bold mb-2">ملخص البوكس الجاري تصميمه:</h4>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="font-bold gold-text">
                        {product.id === 9 ? 'رجالي' : product.id === 11 ? 'نسائي' : 'مشترك'} 
                        ({product.id === 13 && mixedVariant === '2' ? 'عطرين' : '3 عطور'})
                      </span>
                      <span>نوع البوكس:</span>
                    </div>

                    {selectedSlots.length > 0 ? (
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col items-end gap-1">
                          {(() => {
                            const grouped = selectedSlots.reduce((acc, slot) => {
                              const existing = acc.find(item => item.product.id === slot.product.id);
                              if (existing) {
                                existing.qty += 1;
                                existing.sizes.push(slot.sizeMl);
                              } else {
                                acc.push({ product: slot.product, qty: 1, sizes: [slot.sizeMl] });
                              }
                              return acc;
                            }, [] as { product: Product, qty: number, sizes: number[] }[]);

                            return grouped.map(g => (
                              <span key={g.product.id} className="text-gray-300">
                                {g.product.name.split(' - ')[0]} × {g.qty} ({g.sizes.map(sz => sz + 'مل').join(' + ')})
                              </span>
                            ));
                          })()}
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
