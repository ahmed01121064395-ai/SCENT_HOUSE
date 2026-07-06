'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/data/products';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
  overridePrice?: number;
}

export default function ProductCard({ product, overridePrice }: ProductCardProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, buyNow } = useApp();
  const isWishlisted = wishlist.includes(product.id) ? 'active' : '';

  const badgeHtml = product.isBestSeller ? (
    <div className="product-card-badge">الأكثر مبيعاً</div>
  ) : product.isNew ? (
    <div className="product-card-badge">جديد بالدار</div>
  ) : null;

  // Show first size price on card (with originalPrice if available)
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
  const displayPrice = overridePrice !== undefined
    ? overridePrice
    : (defaultSize ? defaultSize.price : product.price);
  const displayOriginalPrice = overridePrice !== undefined
    ? undefined
    : (defaultSize?.originalPrice);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Add to cart then open the cart drawer
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSizeMl = defaultSize ? defaultSize.ml : 0;
    addToCart(product.id, defaultSizeMl, 1);
  };

  // Buy Now → add to cart silently (no drawer), then go directly to /checkout
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSizeMl = defaultSize ? defaultSize.ml : 0;
    buyNow(product.id, defaultSizeMl, 1);
    router.push('/checkout');
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card" style={{ cursor: 'pointer' }}>
      {badgeHtml}

      {/* Wishlist Button */}
      <div className="product-card-wishlist">
        <button
          className={`wishlist-btn-heart ${isWishlisted}`}
          onClick={handleWishlistToggle}
          title="أضف للمفضلة"
          type="button"
        >
          <i className="fa-solid fa-heart"></i>
        </button>
      </div>

      {/* Product Image */}
      <div className="product-card-image-box">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="product-card-img"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      {/* Product Info */}
      <div className="product-card-info">
        <span className="product-card-category">{product.categoryNameAr}</span>
        <h3 className="product-card-title">{product.name.split(' - ')[0]}</h3>
        <p className="product-card-notes">
          {product.notes ? `مقدمة العطر: ${product.notes.top}` : `محتويات البوكس: ${product.contents}`}
        </p>
        <div className="product-card-footer">
          <div className="product-card-price-block">
            {displayOriginalPrice && (
              <span className="product-card-original-price">
                <span className="english-num">{displayOriginalPrice}</span> جنيه
              </span>
            )}
            <span className="product-card-price">
              <span className="english-num">{displayPrice}</span> <span>جنيه</span>
            </span>
          </div>
          <div className="product-card-rating">
            <i className="fa-solid fa-star"></i>
            <span className="english-num">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons — equal size, stacked */}
      <div className="product-card-btns">
        <button
          className="card-add-cart-btn"
          onClick={handleAddToCart}
          type="button"
          title="أضف للسلة"
        >
          <i className="fa-solid fa-bag-shopping"></i>
          <span>أضف للسلة</span>
        </button>

        <button
          className="buy-now-btn"
          onClick={handleBuyNow}
          type="button"
          title="اشتري الان مباشرة"
        >
          <i className="fa-solid fa-bolt"></i>
          <span>اشتري الان</span>
        </button>
      </div>
    </Link>
  );
}
