'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
  overridePrice?: number;
}

export default function ProductCard({ product, overridePrice }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id) ? 'active' : '';

  const badgeHtml = product.isBestSeller ? (
    <div className="product-card-badge">الأكثر مبيعاً</div>
  ) : product.isNew ? (
    <div className="product-card-badge">جديد بالدار</div>
  ) : null;

  // We show 50ml price (or 100ml for gift boxes) by default on the card
  const displayPrice = overridePrice !== undefined
    ? overridePrice
    : (product.sizes && product.sizes.length > 0 ? product.sizes[0].price : product.price);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
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
          <span className="product-card-price">
            <span className="english-num">{displayPrice}</span> <span>جنيه</span>
          </span>
          <div className="product-card-rating">
            <i className="fa-solid fa-star"></i>
            <span className="english-num">{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
