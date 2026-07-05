'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Confirmation() {
  const { lastPlacedOrder } = useApp();

  if (!lastPlacedOrder) {
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
          
          {/* Invoice Info Card */}
          <div className="bg-[#121212] border border-yellow-600/10 rounded-lg p-6 text-right max-w-md mx-auto my-6">
            <h4 className="gold-text font-bold border-b border-yellow-600/15 pb-2 mb-3 text-lg">
              تفاصيل الفاتورة الإلكترونية:
            </h4>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">رقم الفاتورة:</span>
              <span className="english-num font-bold text-[#D4AF37]">
                #{lastPlacedOrder.orderId}
              </span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">تاريخ المعاملة:</span>
              <span className="english-num">{lastPlacedOrder.orderDate}</span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">العميل المستلم:</span>
              <span>{lastPlacedOrder.fullname}</span>
            </div>
            
            <div className="cart-summary-line flex justify-between py-1 text-sm">
              <span className="text-gray-400">طريقة الدفع:</span>
              <span>{lastPlacedOrder.paymentMethodLabel}</span>
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
                {lastPlacedOrder.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-yellow-600/5 text-gray-300 text-sm last:border-0"
                  >
                    <td className="py-3 font-medium">
                      {item.product.name.split(' - ')[0]}
                      {item.boxType && (
                        <span className="block text-[10px] text-yellow-500/80">
                          تغليف: {item.boxType === 'royal' ? 'ملكي فاخر' : 'بسيط'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 english-num">
                      {item.product.category === 'gifts' ? 'صندوق فاخر' : `${item.size.ml}ml`}
                    </td>
                    <td className="py-3 english-num">{item.quantity}</td>
                    <td className="py-3 text-left font-mono english-num">{item.size.price * item.quantity} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Pricing Totals */}
          <div className="max-w-2xl mx-auto border-t border-yellow-600/10 pt-4 flex justify-between items-center text-right font-bold text-white mb-8">
            <span>المجموع الكلي للفاتورة:</span>
            <span className="gold-text text-xl font-mono">
              <span className="english-num">{lastPlacedOrder.grandTotal}</span> جنيه
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
