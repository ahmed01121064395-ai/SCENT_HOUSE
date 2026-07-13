'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

function ConfirmationContent() {
  const { lastPlacedOrder, clearCart, setCartOpen } = useApp();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const successParam = searchParams.get('success');

  const txnParam = searchParams.get('txn');

  const [dbOrder, setDbOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Close cart drawer on mount to prevent the transparent backdrop from overlaying and blocking clicks
  useEffect(() => {
    setCartOpen(false);
  }, [setCartOpen]);

  // Clear cart if card payment success is verified
  useEffect(() => {
    if (successParam === 'true') {
      clearCart();
    }
  }, [successParam, clearCart]);

  useEffect(() => {
    async function fetchOrder() {
      if (!lastPlacedOrder && orderIdParam) {
        setLoading(true);
        console.log('[Confirmation] Fetching order from DB:', orderIdParam);
        
        let { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, product:products(*))')
          .eq('orderId', orderIdParam)
          .maybeSingle();
          
        // Backup check: If order is not in DB yet but we have txnParam, verify with Paymob and create order
        if (!data && txnParam) {
          console.log('[Confirmation] Order not found in DB. Triggering verify-and-create API backup...');
          try {
            const verifyRes = await fetch('/api/verify-and-create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderIdParam, txnId: txnParam })
            });
            
            if (verifyRes.ok) {
              console.log('[Confirmation] Verify-and-create API succeeded. Fetching order again...');
              const refetch = await supabase
                .from('orders')
                .select('*, order_items(*, product:products(*))')
                .eq('orderId', orderIdParam)
                .maybeSingle();
              data = refetch.data;
              error = refetch.error;
            } else {
              const errData = await verifyRes.json();
              console.error('[Confirmation] Verify-and-create API failed:', errData.error);
            }
          } catch (err: any) {
            console.error('[Confirmation] Error during verify-and-create API backup call:', err.message);
          }
        }
          
        if (!error && data) {
          const mappedOrder = {
            orderId: data.orderId,
            orderDate: data.orderDate,
            fullname: data.fullname,
            phone: data.phone,
            phone2: data.phone2,
            paymentMethodLabel: data.paymentMethodLabel,
            items: data.order_items.map((oi: any) => ({
              product: oi.product || { name: 'عطر خاص', category: 'custom' },
              size: oi.size,
              quantity: oi.quantity,
              boxType: oi.boxType,
              giftMessage: oi.giftMessage
            })),
            subtotal: data.subtotal,
            discount: data.discount,
            vat: data.vat || 0,
            grandTotal: data.grandTotal
          };
          setDbOrder(mappedOrder);
        } else {
          console.error('[Confirmation] Order not found in DB:', error?.message);
        }
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderIdParam, lastPlacedOrder, txnParam]);

  const order = lastPlacedOrder || dbOrder;
  
  const isKiosk = order?.paymentMethodLabel && order.paymentMethodLabel.includes('كود الدفع:');
  const kioskCode = isKiosk ? order.paymentMethodLabel.split('كود الدفع:')[1]?.trim() : '';

  if (loading) {
    return (
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 gold-text"></i>
        <p className="mb-6">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-receipt text-4xl mb-4 gold-text"></i>
        <p className="mb-6">لا يوجد أي تفاصيل طلب نشط لعرضها حالياً.</p>
        <Link href="/" className="btn-premium">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div id="view-success" className="active">
      <div className="section-wrapper">
        <div className="invoice-success-box text-center">
          <div className="success-icon-badge">
            <i className="fa-solid fa-check"></i>
          </div>
          
          <h2 className="gold-text font-bold text-2xl mb-2">تم تسجيل طلبك بنجاح!</h2>
          <p className="text-gray-300 max-w-lg mx-auto text-sm leading-relaxed mb-6">
            شكراً لاختيارك Scent House. تم إرسال فاتورة تفصيلية ورسالة شحن مؤقتة لهاتفك المحمول وجاري تحضير الباقة العطرية.
          </p>

          {/* Kiosk Cash Payment Instruction Card */}
          {isKiosk && kioskCode && (
            <div className="bg-yellow-950/30 border border-yellow-600/30 text-yellow-500 rounded-lg p-5 max-w-md mx-auto my-6 text-right animate-fadeIn">
              <div className="flex items-center gap-2 mb-2 text-lg font-bold">
                <i className="fa-solid fa-shop gold-text"></i>
                <span>كود الدفع عبر أمان أو مصاري</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                يرجى التوجه إلى أقرب منفذ أمان (Aman) أو مصاري (Masary) خلال 24 ساعة، وإبلاغ البائع برغبتك في دفع خدمة <strong>"مدفوعات Paymob"</strong> برقم الخدمة التالي:
              </p>
              <div className="bg-black/40 border border-yellow-600/20 rounded p-3 text-center text-2xl font-mono font-bold tracking-wider gold-text english-num">
                {kioskCode}
              </div>
              <p className="text-gray-400 text-[10px] mt-2 text-center">
                * سيتم شحن الطلب والبدء في تجهيزه فور تأكيد الدفع تلقائياً.
              </p>
            </div>
          )}
          
          {/* Invoice Info Card */}
          <div className="bg-[var(--bg-secondary)] border border-yellow-600/10 rounded-lg p-6 text-right max-w-md mx-auto my-6">
            <h4 className="gold-text font-bold border-b border-yellow-600/15 pb-2 mb-3 text-lg">
              تفاصيل الفاتورة الإلكترونية:
            </h4>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">رقم الفاتورة:</span>
              <span className="english-num font-bold text-[var(--primary-gold)]">
                #{order.orderId}
              </span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">تاريخ المعاملة:</span>
              <span className="english-num">{order.orderDate}</span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">العميل المستلم:</span>
              <span>{order.fullname}</span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">طريقة الدفع:</span>
              <span>{order.paymentMethodLabel}</span>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto my-6 max-w-2xl mx-auto">
            <table className="invoice-table w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-yellow-600/20 text-gray-300 text-sm">
                  <th className="py-2">العطر</th>
                  <th className="py-2">الحجم</th>
                  <th className="py-2">الكمية</th>
                  <th className="py-2 text-left">السعر</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-yellow-600/5 text-gray-300 text-sm last:border-0"
                  >
                    <td className="py-3 font-medium">
                      {item.product?.name ? item.product.name.split(' - ')[0] : 'عطر خاص'}
                      {item.size?.perfumes ? (
                        <span className="block text-[10px] text-gray-400">
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
                      ) : item.size?.perfume1 ? (
                        <span className="block text-[10px] text-gray-400">
                          المكونات: {item.size.perfume1} ({item.size.perfume1Size}مل) × {item.size.perfume2} ({item.size.perfume2Size}مل)
                          {item.size.perfume3 && ` × ${item.size.perfume3} (${item.size.perfume3Size}مل)`}
                        </span>
                      ) : null}
                      {item.boxType && (
                        <span className="block text-[10px] text-yellow-500/80">
                          تغليف: {item.boxType === 'royal' ? 'ملكي فاخر' : 'بسيط'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 english-num">
                      {item.product?.category === 'gifts' ? 'صندوق فاخر' : item.product?.category === 'offer' ? 'عرض خاص' : `${item.size?.ml || 50}ml`}
                    </td>
                    <td className="py-3 english-num">{item.quantity}</td>
                    <td className="py-3 text-left font-mono english-num">{((item.size?.price_after_discount ?? item.size?.price) || 0) * item.quantity} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Pricing Totals */}
          <div className="max-w-2xl mx-auto border-t border-yellow-600/10 pt-4 flex justify-between items-center text-right font-bold text-[var(--text-primary)] mb-8">
            <span>المجموع الكلي للفاتورة:</span>
            <span className="gold-text text-xl font-mono">
              <span className="english-num">{order.grandTotal}</span> جنيه
            </span>
          </div>

          <Link href="/" className="btn-premium inline-block w-full max-w-md text-center py-3">
            العودة للرئيسية ومتابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Confirmation() {
  return (
    <React.Suspense fallback={
      <div className="text-center py-48 text-gray-400">
        <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 gold-text"></i>
        <p>جاري تحميل تأكيد الطلب...</p>
      </div>
    }>
      <ConfirmationContent />
    </React.Suspense>
  );
}
