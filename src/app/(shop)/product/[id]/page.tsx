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
      if (product.sizes.length === 1) {
        setSelectedSizeMl(product.sizes[0].ml);
      } else {
        setSelectedSizeMl(null);
      }
      setActiveImage(product.image);
      setQty(1);
      setBoxType('عطور رجالية');
      setGiftMessage('');
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
    if (selectedSizeMl === null) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    addToCart(
      product.id,
      selectedSizeMl!,
      qty,
      product.category === 'gifts' ? boxType : undefined,
      product.category === 'gifts' ? giftMessage : undefined
    );
    // Show Arabic toast for 2.5 seconds
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (selectedSizeMl === null) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    // Use buyNow (no drawer) then go straight to checkout
    buyNow(
      product.id,
      selectedSizeMl!,
      qty,
      product.category === 'gifts' ? boxType : undefined,
      product.category === 'gifts' ? giftMessage : undefined
    );
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
                  <span className="english-num">{sizeObj.price * qty}</span> جنيه
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

            <p className="details-desc">{product.description}</p>

            {/* Custom Packaging options for Gift Boxes */}
            {product.category === 'gifts' && (
              <div className="gift-box-customizer">
                <h4 className="gift-custom-title">
                  <i className="fa-solid fa-gift"></i> تخصيص بوكس الهدايا
                </h4>

                <div className="form-group-checkout" style={{ marginBottom: '15px' }}>
                  <label className="block text-sm mb-1 text-gray-300">نوع العطور المفضلة بالبوكس</label>
                  <select
                    className="select-premium w-full"
                    value={boxType}
                    onChange={(e) => setBoxType(e.target.value)}
                  >
                    <option value="عطور رجالية">عطور رجالية فاخرة</option>
                    <option value="عطور نسائية">عطور نسائية راقية</option>
                    <option value="عطور مكس (رجالي ونسائي)">تشكيلة رجالي ونسائي (مكس)</option>
                  </select>
                </div>

                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">اكتب رسالة الإهداء (تُطبع بخط مذهب يدوي)</label>
                  <textarea
                    placeholder="اكتب هنا العبارة التي تريد إرفاقها بالبوكس..."
                    className="custom-textarea w-full"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

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

            {/* Size Selector */}
            {product.sizes.length > 1 && (
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
                >
                  <i className="fa-solid fa-bag-shopping"></i> إضافة إلى السلة
                </button>
              </div>

              {/* Row 2: Buy Now — goes directly to checkout */}
              <button
                className="buy-now-btn-large"
                onClick={handleBuyNow}
                type="button"
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
