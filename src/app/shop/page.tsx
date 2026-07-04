'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Product } from '@/data/products';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const { products, wishlist } = useApp();
  const searchParams = useSearchParams();

  // Search, sort and filter states
  const [searchQuery, setSearchQuery] = useState('');
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
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // 1. Search Query Filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.notes && Object.values(product.notes).some(n => n.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (product.contents && product.contents.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Category Filter
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
      const priceA = a.sizes && a.sizes.length > 0 ? a.sizes[0].price : a.price;
      const priceB = b.sizes && b.sizes.length > 0 ? b.sizes[0].price : b.price;
      return priceA - priceB;
    }
    if (sortBy === 'price-desc') {
      const priceA = a.sizes && a.sizes.length > 0 ? a.sizes[0].price : a.price;
      const priceB = b.sizes && b.sizes.length > 0 ? b.sizes[0].price : b.price;
      return priceB - priceA;
    }
    return 0;
  });

  // Calculate overridden display price for cards if size filter is single-checked
  const getOverridePrice = (p: Product) => {
    if (selectedSizes.includes(30) && !selectedSizes.includes(50)) {
      const size30 = p.sizes.find(s => s.ml === 30);
      if (size30) return size30.price;
    }
    if (selectedSizes.includes(50) && !selectedSizes.includes(30)) {
      const size50 = p.sizes.find(s => s.ml === 50);
      if (size50) return size50.price;
    }
    return undefined;
  };

  return (
    <div id="view-shop" className="active">
      <div className="info-page-header">
        <h1 id="shop-view-title" className="gold-text">
          {viewWishlistOnly ? 'قائمة مفضلاتي' : 'معرض العطور الفاخرة'}
        </h1>
        <p>
          {viewWishlistOnly
            ? 'تصفح عطورك المفضلة التي قمت بإضافتها لقائمتك الخاصة'
            : 'تصفح كتالوج العطور الفخم واختر النفحات العطرية الملائمة لأسلوب حياتك'}
        </p>
      </div>

      <div className="section-wrapper">
        {/* Search & Sort Controls */}
        <div className="shop-main-controls">
          <div className="search-box-wrap">
            <input
              type="text"
              placeholder="البحث عن عطر، مكون أو بوكس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
          </div>
          
          <div className="sort-container">
            <span>ترتيب حسب:</span>
            <select
              className="select-premium"
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
        <div className="shop-layout">
          {/* Sidebar */}
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

            {/* Size Filter */}
            <div className="filter-group">
              <h4 className="filter-title">الحجم المتوفر</h4>
              <div className="filter-options">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(30)}
                    onChange={() => handleSizeChange(30)}
                  />
                  <span className="checkbox-box"></span>
                  <span className="english-num">30 ML</span>
                </label>
                
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(50)}
                    onChange={() => handleSizeChange(50)}
                  />
                  <span className="checkbox-box"></span>
                  <span className="english-num">50 ML</span>
                </label>
              </div>
            </div>

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
