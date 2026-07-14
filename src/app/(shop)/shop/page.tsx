'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Product } from '@/data/products';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const { products, wishlist, settings } = useApp();
  const searchParams = useSearchParams();

  // Search, sort and filter states
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [viewWishlistOnly, setViewWishlistOnly] = useState(false);

  // Initialize filters from search parameters
  useEffect(() => {
    const catParam = searchParams.get('category');
    const wishlistParam = searchParams.get('wishlist');

    if (catParam) {
      setSelectedCats([catParam]);
    } else {
      setSelectedCats([]);
    }

    if (wishlistParam === 'true') {
      setViewWishlistOnly(true);
    } else {
      setViewWishlistOnly(false);
    }
  }, [searchParams]);

  const handleCatChange = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSizeChange = (size: number) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? [] : [size]
    );
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // 1. Category Filter
    if (selectedCats.length > 0) {
      const matchesCat = selectedCats.includes(product.category) ||
                         (product.category === 'unisex' && (selectedCats.includes('men') || selectedCats.includes('women')));
      if (!matchesCat) return false;
    }

    // 3. Size Filter
    if (selectedSizes.length > 0) {
      const hasMatchingSize = product.sizes.some(s => selectedSizes.includes(s.ml));
      if (!hasMatchingSize) return false;
    }

    // 4. Wishlist Only Filter
    if (viewWishlistOnly && !wishlist.includes(product.id)) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'featured') {
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    }
    if (sortBy === 'newest') {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeA !== 0 || timeB !== 0) {
        return timeB - timeA;
      }
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'price-asc') {
      const getDefPrice = (p: Product) => {
        const sz = p.sizes && p.sizes.length > 0 ? (p.sizes.find(s => s.ml === 50) || p.sizes[0]) : null;
        return sz ? sz.price_after_discount : p.price;
      };
      return getDefPrice(a) - getDefPrice(b);
    }
    if (sortBy === 'price-desc') {
      const getDefPrice = (p: Product) => {
        const sz = p.sizes && p.sizes.length > 0 ? (p.sizes.find(s => s.ml === 50) || p.sizes[0]) : null;
        return sz ? sz.price_after_discount : p.price;
      };
      return getDefPrice(b) - getDefPrice(a);
    }
    return 0;
  });

  // Calculate overridden display price for cards if size filter is single-checked
  const getOverridePrice = (p: Product) => {
    if (selectedSizes.includes(30) && !selectedSizes.includes(50)) {
      const size30 = p.sizes.find(s => s.ml === 30);
      if (size30) return size30.price_after_discount;
    }
    if (selectedSizes.includes(50) && !selectedSizes.includes(30)) {
      const size50 = p.sizes.find(s => s.ml === 50);
      if (size50) return size50.price_after_discount;
    }
    return undefined;
  };

  // Determine Custom Title and Subtitle based on active section/category
  const getHeaderInfo = () => {
    if (viewWishlistOnly) {
      return {
        title: 'قائمة مفضلاتي',
        sub: 'تصفح عطورك المفضلة التي قمت بإضافتها لقائمتك الخاصة'
      };
    }
    const cat = searchParams.get('category');
    if (cat === 'men') {
      return {
        title: settings?.men_category_title || 'رجولة تفوح عبقًا',
        sub: settings?.men_category_subtitle || 'تشكيلة عطور رجالية تجمع بين القوة والأناقة في كل رشة'
      };
    }
    if (cat === 'women') {
      return {
        title: settings?.women_category_title || 'أنوثة تُروى بالعطر',
        sub: settings?.women_category_subtitle || 'عطور نسائية تحمل توقيعك الخاص في كل مكان تذهبين إليه'
      };
    }
    if (cat === 'gifts') {
      return {
        title: settings?.gift_category_title || 'هدايا تُروى بالعطر',
        sub: settings?.gift_category_subtitle || 'عطرك… هدية لا تُنسى'
      };
    }
    return {
      title: 'اكتشف عالمنا العطري الكامل',
      sub: 'تصفح كتالوج العطور الفخم واختر النفحات العطرية الملائمة لأسلوب حياتك'
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div id="view-shop" className="active">
      <div className="info-page-header">
        <h1 id="shop-view-title" className="gold-text">
          {headerInfo.title}
        </h1>
        <p>
          {headerInfo.sub}
        </p>
      </div>

      <div className="section-wrapper">
        {/* Sort Controls (Search removed) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '0 5px' }}>
          <div className="sort-container">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ترتيب حسب:</span>
            <select
              className="select-premium"
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem',
                height: '34px',
                minWidth: '140px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px'
              }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">الأكثر مبيعاً</option>
              <option value="newest">الأحدث</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
            </select>
          </div>
        </div>

        {/* Layout */}
        <div className="shop-layout" style={searchParams.get('category') === 'gifts' ? { gridTemplateColumns: '1fr' } : {}}>
          {/* Sidebar */}
          {searchParams.get('category') !== 'gifts' && (
            <aside className="shop-sidebar">
              {/* Category Filter - only shown when not on a specific category section */}
              {!searchParams.get('category') && (
                <div className="filter-group">
                  <h4 className="filter-title">التصنيفات</h4>
                  <div className="filter-options">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes('men')}
                        onChange={() => handleCatChange('men')}
                      />
                      <span className="checkbox-box"></span>
                      <span>عطور رجالية</span>
                    </label>
                    
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes('women')}
                        onChange={() => handleCatChange('women')}
                      />
                      <span className="checkbox-box"></span>
                      <span>عطور نسائية</span>
                    </label>

                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes('gifts')}
                        onChange={() => handleCatChange('gifts')}
                      />
                      <span className="checkbox-box"></span>
                      <span>بوكسات هدايا ومناسبات</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Size Filter - only shown when category is not gifts */}
              {!selectedCats.includes('gifts') && (
                <div className="filter-group">
                  <h4 className="filter-title">الحجم المتوفر</h4>
                  <div className="filter-options">
                    <label className="custom-radio">
                      <input
                        type="radio"
                        name="size-filter"
                        checked={selectedSizes.includes(30)}
                        onChange={() => handleSizeChange(30)}
                      />
                      <span className="radio-circle"></span>
                      <span className="english-num">30 ML</span>
                    </label>
                    
                    <label className="custom-radio">
                      <input
                        type="radio"
                        name="size-filter"
                        checked={selectedSizes.includes(50)}
                        onChange={() => handleSizeChange(50)}
                      />
                      <span className="radio-circle"></span>
                      <span className="english-num">50 ML</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Wishlist filter shortcut toggler */}
              {wishlist.length > 0 && (
                <div className="filter-group">
                  <button
                    onClick={() => setViewWishlistOnly(!viewWishlistOnly)}
                    className={`btn-drawer-full text-sm py-2 rounded border ${
                      viewWishlistOnly
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-yellow-600/40 text-yellow-500/90 hover:bg-yellow-600/10'
                    }`}
                    type="button"
                  >
                    <i className="fa-solid fa-heart ml-2"></i>
                    {viewWishlistOnly ? 'عرض كل العطور' : 'عرض المفضلة فقط'}
                  </button>
                </div>
              )}
            </aside>
          )}

          {/* Grid list or No Results placeholder */}
          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <div id="shop-no-results" className="text-center py-24 text-gray-500">
                <i className="fa-solid fa-magnifying-glass-minus text-5xl mb-4 gold-text opacity-40"></i>
                <p>عذراً، لم نجد أي عطور تطابق خيارات التصفية الخاصة بك.</p>
              </div>
            ) : (
              <div className="product-grid">
                {sortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    overridePrice={getOverridePrice(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 gold-text"></i>
        <p>جاري تحميل معرض العطور الفاخرة...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
