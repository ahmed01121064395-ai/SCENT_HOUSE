'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    applyCoupon,
    couponCode,
    discountPercent,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    setBuyNowItem,
    giftBoxTypes
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyCoupon = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;

    const success = applyCoupon(promoInput);
    if (success) {
      setPromoSuccess('تم تطبيق كود الخصم بنجاح! 🎉');
    } else {
      setPromoError('كود الخصم غير صحيح أو منتهي الصلاحية ❌');
    }
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    setBuyNowItem(null);
    router.push('/checkout');
  };


  return (
    <div
      className={`cart-drawer-backdrop${isCartOpen ? ' show' : ''}`}
      onClick={() => setCartOpen(false)}
    >
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h3>سلة المشتريات (<span className="english-num">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>)</h3>
          <button className="close-drawer-btn" onClick={() => setCartOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body list */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <i className="fa-solid fa-bag-shopping text-4xl mb-4 gold-text opacity-40"></i>
              <p className="text-gray-400 mb-6">سلة المشتريات فارغة تماماً حالياً</p>
              <Link href="/shop" className="btn-premium" onClick={() => setCartOpen(false)}>
                اذهب للتسوق الآن
              </Link>
            </div>
          ) : (
            <div className="cart-items-wrapper">
              {cart.map((item, index) => {
                const sizeLabel = item.product.category === 'gifts' ? 'صندوق فاخر' : `${item.size.ml} ML`;
                const boxTypeName = giftBoxTypes.find(g => g.code === item.boxType)?.name || (item.boxType === 'luxury' || item.boxType === 'royal' ? 'ملكي فاخر' : 'بسيط');
                const customBadge = item.boxType ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-gold)', marginTop: '3px' }}>
                    <i className="fa-solid fa-gift"></i> التغليف: {boxTypeName}
                    {item.giftMessage && ` - رسالة: ${item.giftMessage}`}
                  </div>
                ) : null;

                return (
                  <div className="cart-item-row" key={`${item.product.id}-${item.size.ml}-${index}`}>
                    <div className="cart-item-img-box" style={{ position: 'relative' }}>
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.product.name.split(' - ')[0]}</span>
                      <span className="cart-item-meta">{sizeLabel}</span>
                      {customBadge}
                      <div className="cart-item-controls">
                        <div className="qty-control" style={{ height: '30px' }}>
                          <button
                            className="qty-btn"
                            style={{ width: '25px' }}
                            onClick={() => updateCartQuantity(item.product.id, item.size.ml, item.quantity - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span
                            className="english-num"
                            style={{ width: '25px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="qty-btn"
                            style={{ width: '25px' }}
                            onClick={() => updateCartQuantity(item.product.id, item.size.ml, item.quantity + 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <span
                          className="cart-item-price english-num"
                        >
                          {(item.size.price * item.quantity).toFixed(2)} جنيه
                        </span>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.product.id, item.size.ml)}
                          type="button"
                          title="حذف"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo Code Apply */}
            <div className="coupon-box-drawer">
              <input
                type="text"
                placeholder="كود الخصم (SCENT10)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="premium-input"
              />
              <button className="btn-apply-coupon" onClick={handleApplyCoupon}>
                تطبيق
              </button>
            </div>
            
            {promoError && <p className="text-red-500 text-xs mt-1 text-right">{promoError}</p>}
            {promoSuccess && <p className="text-green-500 text-xs mt-1 text-right">{promoSuccess}</p>}
            {couponCode && (
              <p className="text-green-500 text-xs mt-1 text-right">
                تم تطبيق الكوبون النشط: <strong className="gold-text">{couponCode}</strong> ({discountPercent}% خصم)
              </p>
            )}

            {/* Calculations lines */}
            <div className="cart-summary-line">
              <span>المجموع الفرعي:</span>
              <span>
                <span className="english-num">{cartSubtotal.toFixed(2)}</span> جنيه
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="cart-summary-line" style={{ color: '#2ecc71' }}>
                <span>الخصم (<span className="english-num">{discountPercent}</span>%):</span>
                <span>
                  -<span className="english-num">{cartDiscount.toFixed(2)}</span> جنيه
                </span>
              </div>
            )}

            <div className="cart-summary-total">
              <span>الإجمالي الكلي:</span>
              <span className="gold-text">
                <span className="english-num">{cartTotal.toFixed(2)}</span> جنيه
              </span>
            </div>

            <div className="cart-drawer-actions">
              <button className="btn-premium btn-drawer-full" onClick={handleCheckoutClick}>
                إتمام الطلب والدفع <i className="fa-solid fa-arrow-left"></i>
              </button>
              <button
                className="btn-outline-gold btn-drawer-full"
                style={{ marginTop: '10px', width: '100%', padding: '12px', fontSize: '0.9rem', textAlign: 'center' }}
                onClick={() => setCartOpen(false)}
              >
                <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                مواصلة التسوق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
