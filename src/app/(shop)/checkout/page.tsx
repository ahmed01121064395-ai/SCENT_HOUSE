'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet' | 'kiosk' | 'applepay'>('cod');
  const [walletType, setWalletType] = useState<'mobile' | 'instapay' | null>(null);
  const [walletNumber, setWalletNumber] = useState('');
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [paymobError, setPaymobError] = useState('');

  useEffect(() => {
    if (errorParam === 'paymob_failed') {
      setPaymobError('لم تتم عملية الدفع، برجاء المحاولة مرة أخرى.');
    }
  }, [errorParam]);

  useEffect(() => {
    // Check if device is Apple (Mac, iPhone, iPad) and is running Safari or supports Apple Pay
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !(window as any).MSStream;
    const hasApplePay = !!(window as any).ApplePaySession;
    setIsAppleDevice(isApple || hasApplePay);
  }, []);

  const handleDisabledPaymentSelect = (method: 'card' | 'wallet' | 'applepay', subType?: 'mobile' | 'instapay') => {
    setPaymentMethod(method);
    if (method === 'wallet' && subType) {
      setWalletType(subType);
    } else if (method === 'wallet' && !subType) {
      setWalletType('mobile');
    } else {
      setWalletType(null);
    }
    setActiveTooltip('هذه الطريقة ستكون متاحة قريباً. تم توفيرها للتجربة البصرية فقط.');
  };

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
  const shippingCost = checkoutItems.length > 0 ? 80 : 0;
  const grandTotal = subtotal - discount + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    setIsSubmitting(true);
    setDbError('');

    if (paymentMethod !== 'cod' && paymentMethod !== 'card' && paymentMethod !== 'wallet' && paymentMethod !== 'kiosk') {
      setActiveTooltip('طريقة الدفع المحددة غير مفعلة حالياً. يرجى اختيار أحد الخيارات المفعلة لإتمام الطلب.');
      setIsSubmitting(false);
      return;
    }

    if (paymentMethod === 'wallet' && (!walletType || walletType !== 'mobile' || !walletNumber.trim())) {
      setActiveTooltip('يرجى إدخال رقم محفظة الهاتف المحمول بشكل صحيح.');
      setIsSubmitting(false);
      return;
    }

    const orderDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    });

    let paymentMethodLabel = 'الدفع عند الاستلام';
    if (paymentMethod === 'applepay') {
      paymentMethodLabel = 'Apple Pay';
    } else if (paymentMethod === 'card') {
      paymentMethodLabel = 'بطاقة بنكية - قيد الدفع';
    } else if (paymentMethod === 'wallet') {
      paymentMethodLabel = 'محفظة هاتف محمول - قيد الدفع';
    } else if (paymentMethod === 'kiosk') {
      paymentMethodLabel = 'دفع كشك (أمان/مصاري) - قيد الدفع';
    }

    // Generate a secure temporary merchant order ID (strictly under 20 characters constraint)
    const merchantOrderId = `SH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-8)}`;

    // ── Step 1: Handle card/wallet/kiosk payment redirect or Cash on Delivery completion ──
    if (paymentMethod === 'card' || paymentMethod === 'wallet' || paymentMethod === 'kiosk') {
      try {
        console.log(`[Checkout] Initiating Paymob ${paymentMethod} payment for order:`, merchantOrderId);
        const res = await fetch('/api/create-paymob-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: merchantOrderId,
            fullname,
            phone,
            phone2,
            discount,
            city,
            address,
            amount: grandTotal,
            items: checkoutItems,
            paymentMethod,
            walletNumber
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to initialize payment at Paymob');
        }

        const data = await res.json();
        
        let finalLabel = paymentMethodLabel;
        if (paymentMethod === 'kiosk') {
          // Kiosk payment returns a reference code instead of redirecting
          const billRef = data.billReference;
          finalLabel = `دفع كشك (أمان/مصاري) - كود الدفع: ${billRef}`;

          // Insert order immediately for Kiosk since it does not redirect
          console.log(`[Checkout] Kiosk code generated successfully. Inserting order row for: ${merchantOrderId}...`);
          const { data: orderRow, error: orderError } = await supabase
            .from('orders')
            .insert({
              orderId: merchantOrderId,
              orderDate,
              fullname,
              phone,
              phone2,
              city,
              address,
              paymentMethodLabel: finalLabel,
              subtotal,
              discount,
              vat: 0,
              grandTotal,
              status: 'جديد' // Kiosk orders are registered as pending payments
            })
            .select('id')
            .single();

          if (orderError) {
            throw new Error(`Failed to save Kiosk order: ${orderError.message}`);
          }

          // Insert order items
          const itemRows = checkoutItems.map(item => ({
            order_id: orderRow.id,
            productId: Number(item.product.id),
            size: item.size,
            quantity: item.quantity,
            boxType: item.boxType || null,
            giftMessage: item.giftMessage || null,
          }));

          const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
          if (itemsError) {
            console.warn('[Checkout] order_items insert failed for Kiosk order:', itemsError.message);
          }
        }

        // Save to context for confirmation page
        setLastPlacedOrder({
          orderId: merchantOrderId,
          orderDate,
          fullname,
          phone,
          phone2,
          paymentMethodLabel: finalLabel,
          items: [...checkoutItems],
          subtotal: subtotal,
          discount: discount,
          vat: 0,
          grandTotal
        });

        setIsSubmitting(false);

        if (paymentMethod === 'kiosk') {
          // Kiosk option clears cart immediately because it doesn't leave the site
          if (buyNowItem) {
            setBuyNowItem(null);
          } else {
            clearCart();
          }
          router.push('/confirmation');
        } else {
          // Card or Wallet redirects to external page (redirectUrl)
          window.location.href = data.redirectUrl;
        }
      } catch (err: any) {
        console.error('[Checkout] Paymob Payment initiation failed:', err.message);
        setDbError(`خطأ في تهيئة بوابة الدفع: ${err.message}`);
        setIsSubmitting(false);
      }
    } else {
      // ── Step 2: Handle Cash on Delivery (COD) ──
      try {
        console.log('[Checkout] Placing Cash on Delivery order...');
        const { data: orderRow, error: orderError } = await supabase
          .from('orders')
          .insert({
            orderDate,
            fullname,
            phone,
            phone2,
            city,
            address,
            paymentMethodLabel,
            subtotal,
            discount,
            vat: 0,
            grandTotal,
            status: 'جديد',
          })
          .select('id, "orderId"')
          .single();

        if (orderError) {
          throw new Error(orderError.message);
        }

        // Insert items
        const itemRows = checkoutItems.map(item => ({
          order_id: orderRow.id,
          productId: Number(item.product.id),
          size: item.size,
          quantity: item.quantity,
          boxType: item.boxType || null,
          giftMessage: item.giftMessage || null,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
        if (itemsError) {
          console.warn('[Checkout] order_items insert failed for COD order:', itemsError.message);
        }

        setLastPlacedOrder({
          orderId: orderRow.orderId,
          orderDate,
          fullname,
          phone,
          phone2,
          paymentMethodLabel,
          items: [...checkoutItems],
          subtotal,
          discount,
          vat: 0,
          grandTotal
        });

        setIsSubmitting(false);

        // Clear buyNowItem if it exists, otherwise clear cart
        if (buyNowItem) {
          setBuyNowItem(null);
        } else {
          clearCart();
        }
        router.push('/confirmation');
      } catch (err: any) {
        setDbError(`خطأ في إنشاء الطلب: ${err.message}`);
        setIsSubmitting(false);
      }
    }
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
                    <label className="block text-sm mb-1 text-gray-300">رقم الهاتف الأول (للتنسيق مع مندوب التوصيل)</label>
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
                    <label className="block text-sm mb-1 text-gray-300">رقم هاتف إضافي (اختياري)</label>
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      className="premium-input w-full"
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
                
                <div className="payment-method-selector grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Option 1: Cash on Delivery (COD) */}
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('cod');
                      setWalletType(null);
                      setActiveTooltip(null);
                    }}
                  >
                    <i className="fa-solid fa-hand-holding-dollar text-xl"></i>
                    <span className="payment-option-title text-xs mt-1 block">الدفع عند الاستلام</span>
                  </div>

                  {/* Option 2: Credit/Debit Card */}
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('card');
                      setWalletType(null);
                      setActiveTooltip(null);
                      setPaymobError('');
                    }}
                  >
                    <i className="fa-solid fa-credit-card text-xl"></i>
                    <span className="payment-option-title text-xs mt-1 block">بطاقة بنكية</span>
                  </div>

                  {/* Option 3: Digital Wallet */}
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'wallet' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('wallet');
                      setWalletType('mobile');
                      setActiveTooltip(null);
                      setPaymobError('');
                    }}
                  >
                    <i className="fa-solid fa-wallet text-xl"></i>
                    <span className="payment-option-title text-xs mt-1 block">المحفظة الإلكترونية</span>
                  </div>

                  {/* Option 4: Aman/Masary Cash Kiosk */}
                  <div
                    className={`payment-option-btn cursor-pointer ${paymentMethod === 'kiosk' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('kiosk');
                      setWalletType(null);
                      setActiveTooltip(null);
                      setPaymobError('');
                    }}
                  >
                    <i className="fa-solid fa-shop text-xl"></i>
                    <span className="payment-option-title text-xs mt-1 block">أمان / مصاري (نقداً)</span>
                  </div>

                  {/* Option 5: Apple Pay (Only for Safari/Apple users) */}
                  {isAppleDevice && (
                    <div
                      className={`payment-option-btn disabled cursor-pointer ${paymentMethod === 'applepay' ? 'active' : ''}`}
                      onClick={() => handleDisabledPaymentSelect('applepay')}
                    >
                      <span className="payment-option-badge-soon">قريباً</span>
                      <i className="fa-brands fa-apple-pay text-2xl"></i>
                      <span className="payment-option-title text-xs mt-1 block">Apple Pay</span>
                    </div>
                  )}
                </div>

                {/* Sub-choices for Digital Wallet */}
                {paymentMethod === 'wallet' && (
                  <div className="wallet-sub-choices grid grid-cols-2 gap-3 mt-3 p-3 bg-black/25 border border-yellow-600/10 rounded-lg animate-fadeIn text-right">
                    <div
                      className={`payment-option-btn cursor-pointer ${walletType === 'mobile' ? 'active' : ''}`}
                      onClick={() => {
                        setWalletType('mobile');
                        setActiveTooltip(null);
                        setPaymobError('');
                      }}
                    >
                      <i className="fa-solid fa-mobile-screen-button text-xl"></i>
                      <span className="payment-option-title text-xs mt-1 block">محفظة هاتف محمول</span>
                    </div>
                    <div
                      className={`payment-option-btn disabled cursor-pointer ${walletType === 'instapay' ? 'active' : ''}`}
                      onClick={() => handleDisabledPaymentSelect('wallet', 'instapay')}
                    >
                      <span className="payment-option-badge-soon">قريباً</span>
                      <i className="fa-solid fa-money-bill-transfer text-xl"></i>
                      <span className="payment-option-title text-xs mt-1 block">إنستاباي (InstaPay)</span>
                    </div>
                  </div>
                )}

                {/* Mobile Wallet Number Input */}
                {paymentMethod === 'wallet' && walletType === 'mobile' && (
                  <div className="form-group-checkout mt-3 text-right animate-fadeIn">
                    <label className="block text-sm mb-1 text-gray-300">رقم محفظة الهاتف المحمول (فودافون كاش / أورنج / اتصالات)</label>
                    <input
                      type="tel"
                      placeholder="مثال: 01012345678"
                      className="premium-input w-full text-right"
                      required
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value)}
                    />
                  </div>
                )}

                {/* Kiosk Cash Explanation */}
                {paymentMethod === 'kiosk' && (
                  <div className="bg-yellow-950/20 border border-yellow-600/30 text-yellow-500 text-xs p-3 rounded-lg text-right mt-3 animate-fadeIn">
                    <i className="fa-solid fa-circle-info"></i>
                    <span className="mr-1"><strong>الدفع نقداً عبر أمان/مصاري:</strong> ادفع نقداً في أقرب نقطة أمان أو مصاري خلال 24 ساعة، وسيتم شحن طلبك بعد تأكيد الدفع.</span>
                  </div>
                )}

                {/* Warning Tooltip */}
                {activeTooltip && (
                  <div className="bg-yellow-950/20 border border-yellow-600/30 text-yellow-500 text-xs p-3 rounded-lg text-center mt-3 flex items-center justify-center gap-1.5 animate-fadeIn">
                    <i className="fa-solid fa-circle-info"></i>
                    {activeTooltip}
                  </div>
                )}

                {/* Paymob Error display */}
                {paymobError && (
                  <div className="bg-red-950/20 border border-red-600/30 text-red-400 text-xs p-3 rounded-lg text-center mt-3 flex items-center justify-center gap-1.5 animate-fadeIn">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {paymobError}
                  </div>
                )}

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
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {item.product.category === 'offer' ? (
                        <span className="text-[#D4AF37] font-bold">عرض خاص</span>
                      ) : item.product.category === 'gifts' && item.size.perfumes ? (
                        <span className="text-gray-300 block text-[11px] leading-relaxed">
                          المكونات: {(() => {
                            const grouped = item.size.perfumes.reduce((acc: any, p: any) => {
                              const exist = acc.find((x: any) => x.name === p.name);
                              if (exist) {
                                exist.qty += 1;
                                exist.sizes.push(p.size);
                              } else {
                                acc.push({ name: p.name, qty: 1, sizes: [p.size] });
                              }
                              return acc;
                            }, []);
                            return grouped.map((g: any) => `${g.name} × ${g.qty} (${g.sizes.map((s: any) => s + 'مل').join(' + ')})`).join('، ');
                          })()}
                        </span>
                      ) : item.product.category === 'gifts' && item.size.perfume1 ? (
                        <span className="text-gray-300 block text-[11px] leading-relaxed">
                          المكونات: {item.size.perfume1} ({item.size.perfume1Size}مل) × {item.size.perfume2} ({item.size.perfume2Size}مل)
                          {item.size.perfume3 && ` × ${item.size.perfume3} (${item.size.perfume3Size}مل)`}
                        </span>
                      ) : (
                        <>الحجم: <span className="english-num">{item.size.ml}</span> مل</>
                      )}
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      الكمية: <span className="english-num">{item.quantity}</span>
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
                <span>
                  <span className="english-num">{shippingCost}</span> جنيه
                </span>
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

export default function Checkout() {
  return (
    <React.Suspense fallback={
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 gold-text"></i>
        <p>جاري تحميل صفحة الدفع...</p>
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}
