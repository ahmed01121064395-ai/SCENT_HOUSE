'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export default function Checkout() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    discountPercent,
    setLastPlacedOrder,
    clearCart,
    buyNowItem,
    setBuyNowItem
  } = useApp();

  // Form states
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [city, setCity] = useState('الفيوم');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'applepay' | 'cod'>('cod');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbError, setDbError] = useState('');

  // Determine active checkout items (buyNowItem takes precedence)
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;

  // Calculations
  const subtotal = buyNowItem
    ? buyNowItem.size.price * buyNowItem.quantity
    : cartSubtotal;
  const discount = buyNowItem
    ? Math.round(subtotal * (discountPercent / 100))
    : cartDiscount;
  const grandTotal = subtotal - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    setIsSubmitting(true);
    setDbError('');

    const orderDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    });

    let paymentMethodLabel = 'الدفع عند الاستلام';
    if (paymentMethod === 'applepay') paymentMethodLabel = 'Apple Pay';

    // ── Step 1: Insert into orders (column names match your real schema) ──
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        orderDate,        // VARCHAR - matches "orderDate" column
        fullname,
        phone,
        phone2,
        city,
        address,
        paymentMethodLabel,   // matches "paymentMethodLabel" column
        subtotal: subtotal,
        discount: discount,
        vat: 0,
        grandTotal,            // matches "grandTotal" column
        status: 'جديد',        // matches CHECK constraint values
      })
      .select('id, "orderId"') // get back UUID id + trigger-generated orderId
      .single();

    if (orderError) {
      const msg = `${orderError.code}: ${orderError.message}${orderError.details ? ' | ' + orderError.details : ''}`;
      setDbError(msg);
      setIsSubmitting(false);
      return;
    }

    // ── Step 2: Insert each checkout item into order_items ──
    const itemRows = checkoutItems.map(item => ({
      order_id: orderRow.id,              // UUID FK to orders.id
      productId: Number(item.product.id), // INTEGER FK to products.id
      size: { ml: item.size.ml, price: item.size.price }, // JSONB
      quantity: item.quantity,
      boxType: item.boxType || null,
      giftMessage: item.giftMessage || null,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) {
      console.warn('order_items insert failed (non-blocking):', itemsError.message);
    }

    setIsSubmitting(false);

    // ── Step 3: Save to context for confirmation page ──
    setLastPlacedOrder({
      orderId: orderRow.orderId,   // use the DB-generated SH-XXXXX id
      orderDate,
      fullname,
      phone,
      phone2,
      paymentMethodLabel,
      items: [...checkoutItems],
      subtotal: subtotal,
      discount: discount,
      vat: 0,
      grandTotal
    });

    // Clear buyNowItem if it exists, otherwise clear cart
    if (buyNowItem) {
      setBuyNowItem(null);
    } else {
      clearCart();
    }
    router.push('/confirmation');
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-cart-shopping text-4xl mb-4 gold-text"></i>
        <p className="mb-6">سلة المشتريات فارغة، لا يمكنك إتمام الشراء.</p>
        <button className="btn-premium" onClick={() => router.push('/shop')}>
          الذهاب للمتجر والتسوق
        </button>
      </div>
    );
  }

  return (
    <div id="view-checkout" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">إتمام الشراء والطلب</h1>
        <p>يرجى تعبئة التفاصيل بدقة لإرسال باقتك العطرية الفاخرة</p>
      </div>

      <div className="section-wrapper">
        <div className="checkout-grid">
          {/* Left Column: Form */}
          <div className="checkout-card">
            <h3 className="checkout-title">
              <i className="fa-solid fa-truck-ramp-box"></i> معلومات الشحن والتوصيل
            </h3>
            
            <form id="checkout-main-form" onSubmit={handlePlaceOrder}>
              <div className="checkout-form-rows text-right">
                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">الاسم الكامل للمستلم</label>
                  <input
                    type="text"
                    placeholder="مثال: أحمد عبد الله الرويلي"
                    className="premium-input w-full"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group-checkout">
                    <label className="block text-sm mb-1 text-gray-300">رقم الجوال الأول (للتنسيق مع مندوب التوصيل)</label>
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      className="premium-input w-full"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group-checkout">
                    <label className="block text-sm mb-1 text-gray-300">رقم الجوال الثاني (احتياطي)</label>
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      className="premium-input w-full"
                      required
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">المدينة</label>
                  <select
                    className="select-premium w-full"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الأسكندرية">الأسكندرية</option>
                    <option value="الدقهلية">الدقهلية</option>
                    <option value="البحر الأحمر">البحر الأحمر</option>
                    <option value="البحيرة">البحيرة</option>
                    <option value="الفيوم">الفيوم</option>
                    <option value="الغربية">الغربية</option>
                    <option value="الإسماعيلية">الإسماعيلية</option>
                    <option value="المنوفية">المنوفية</option>
                    <option value="المنيا">المنيا</option>
                    <option value="القليوبية">القليوبية</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                    <option value="السويس">السويس</option>
                    <option value="الشرقية">الشرقية</option>
                    <option value="دمياط">دمياط</option>
                    <option value="أسوان">أسوان</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="بورسعيد">بورسعيد</option>
                    <option value="جنوب سيناء">جنوب سيناء</option>
                    <option value="كفر الشيخ">كفر الشيخ</option>
                    <option value="مطروح">مطروح</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="قنا">قنا</option>
                    <option value="شمال سيناء">شمال سيناء</option>
                    <option value="سوهاج">سوهاج</option>
                  </select>
                </div>

                <div className="form-group-checkout">
                  <label className="block text-sm mb-1 text-gray-300">العنوان السكني وتفاصيل الحي والشارع</label>
                  <input
                    type="text"
                    placeholder="مثال: حي الياسمين، شارع طامية العام، منزل 15"
                    className="premium-input w-full"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                {/* Payment Selector */}
                <h3 className="checkout-title" style={{ marginTop: '30px' }}>
                  <i className="fa-regular fa-credit-card"></i> طريقة الدفع المفضلة
                </h3>
                
                <div className="payment-method-selector grid grid-cols-2 gap-3">
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'applepay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('applepay')}
                  >
                    <i className="fa-brands fa-apple-pay text-2xl"></i>
                    <span className="payment-option-title text-xs mt-1 block">Apple Pay</span>
                  </div>
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <i className="fa-solid fa-hand-holding-dollar"></i>
                    <span className="payment-option-title text-xs mt-1 block">عند الاستلام</span>
                  </div>
                </div>

                {/* DB Error display */}
                {dbError && (
                  <div style={{
                    background: 'rgba(220,38,38,0.12)',
                    border: '1px solid #dc2626',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    marginTop: '20px',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    direction: 'ltr',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    <strong style={{ color: '#ef4444' }}>❌ Database Error:</strong><br/>
                    {dbError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-premium w-full mt-8 py-3 text-lg font-bold"
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting
                    ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: '8px' }}></i> جاري إرسال الطلب...&#8239;</>
                    : <>تأكيد الطلب وشراء العطور</>}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-card h-fit">
            <h3 className="checkout-title">
              <i className="fa-solid fa-receipt"></i> ملخص الطلب
            </h3>

            {/* List of items */}
            <div className="checkout-mini-list border-b border-yellow-600/10 pb-4 max-h-[250px] overflow-y-auto">
              {checkoutItems.map((item, index) => (
                <div
                  className="flex items-center gap-3 py-2 text-right justify-between border-b border-yellow-600/5 last:border-0"
                  key={`${item.product.id}-${item.size.ml}-${index}`}
                >
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={48}
                    height={56}
                    className="object-contain bg-[var(--bg-secondary)] border border-yellow-600/10 rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.product.name.split(' - ')[0]}</h4>
                    <span className="text-xs text-gray-400">
                      الحجم: <span className="english-num">{item.size.ml}</span> مل × <span className="english-num">{item.quantity}</span>
                    </span>
                  </div>
                  <div className="text-left font-mono text-sm">
                    <span className="english-num">{item.size.price * item.quantity}</span> ج.م
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-box mt-4 text-right">
              <div className="summary-item-line flex justify-between py-1 text-sm text-gray-300">
                <span>سعر المنتجات:</span>
                <span>
                  <span className="english-num">{subtotal}</span> جنيه
                </span>
              </div>
              
              {discount > 0 && (
                <div className="summary-item-line flex justify-between py-1 text-sm text-green-500">
                  <span>كود الخصم المطبق:</span>
                  <span>
                    -<span className="english-num">{discount}</span> جنيه
                  </span>
                </div>
              )}

              <div className="summary-item-line flex justify-between py-1 text-sm text-gray-300">
                <span>تكلفة الشحن والتغليف الفاخر:</span>
                <span className="text-green-500">مجاني</span>
              </div>

              <div className="summary-item-line total flex justify-between py-2 border-t border-yellow-600/10 mt-2 font-bold text-[var(--text-primary)] text-lg">
                <span>المجموع الإجمالي:</span>
                <span className="gold-text">
                  <span className="english-num">{grandTotal}</span> جنيه
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
