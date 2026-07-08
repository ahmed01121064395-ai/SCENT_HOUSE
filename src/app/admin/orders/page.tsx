'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, productsDatabase } from '@/data/products';
import Image from 'next/image';
import { getStatusBadgeStyle } from '@/lib/orderStatus';
import { formatPriceVal, formatPriceFull } from '@/lib/formatters';
import Toast from '@/components/Toast';

interface Order {
  id: string;
  orderId: string;
  created_at: string;
  grandTotal: number;
  status: string;
  fullname: string;
  phone: string;
  phone2?: string;
  city: string;
  address: string;
  paymentMethodLabel: string;
  subtotal: number;
  discount: number;
  vat: number;
}

interface OrderItem {
  id: string;
  order_id: string;
  productId: number;
  quantity: number;
  size?: {
    ml: number;
    price: number;
  };
  productName: string;
  productImage: string;
  boxType?: string;
  giftMessage?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Expanded Order State
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch orders and products
  async function fetchOrdersData() {
    try {
      setLoading(true);
      
      // Fetch products first for reference mapping
      const { data: pData } = await supabase.from('products').select('*');
      setProducts(pData || []);

      // Fetch orders sorted by newest created_at first
      const { data: oData, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (oErr) throw oErr;
      setOrders(oData || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrdersData();
  }, []);

  // Update order status instantly in Supabase
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local orders list state
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );

      // If this order is currently expanded in the details modal, update it too
      if (expandedOrder && expandedOrder.id === orderId) {
        setExpandedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      setToast({ message: 'تم تحديث حالة الطلب بنجاح', type: 'success' });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث.';
      setToast({ message: `خطأ في تحديث حالة الطلب: ${errMsg}`, type: 'error' });
    }
  };

  // Expand order detail & load its items
  const handleExpandOrder = async (order: Order) => {
    setExpandedOrder(order);
    setOrderItems([]);
    setItemsLoading(true);

    try {
      const { data: itemsData, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (itemsErr) throw itemsErr;
      
      // Map item productIds to product catalog for name and image resolution
      const mappedItems = (itemsData || []).map(item => {
        const prod = products.find(p => Number(p.id) === Number(item.productId)) ||
                     productsDatabase.find(p => Number(p.id) === Number(item.productId));
        return {
          ...item,
          productName: prod ? prod.name.split(' - ')[0] : `عطر (كود: ${item.productId})`,
          productImage: prod ? prod.image : 'https://placehold.co/100x100/121212/D4AF37?text=Perfume'
        };
      });

      setOrderItems(mappedItems);
    } catch (err) {
      console.error('Error loading order items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Helper to format Egyptian phone numbers for WhatsApp
  const formatCustomerPhoneForWhatsApp = (phoneStr: string): string => {
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('01')) {
      digits = '20' + digits.substring(1);
    } else if (digits.startsWith('1') && digits.length === 10) {
      digits = '20' + digits;
    }
    return digits;
  };

  // Helper to load order items and open WhatsApp confirmation link
  const handleSendWhatsApp = async (order: Order, phoneStr: string) => {
    if (!phoneStr) return;

    try {
      // 1. Fetch order items for accurate itemization
      const { data: itemsData, error: itemsErr } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (itemsErr) throw itemsErr;

      const mappedItems = (itemsData || []).map(item => {
        const prod = products.find(p => Number(p.id) === Number(item.productId)) ||
                     productsDatabase.find(p => Number(p.id) === Number(item.productId));
        return {
          ...item,
          productName: prod ? prod.name.split(' - ')[0] : `عطر (كود: ${item.productId})`
        };
      });

      // 2. Generate Arabic text message
      const customerName = order.fullname;
      const invoiceNumber = order.orderId;
      const total = order.grandTotal;

      let itemListText = '';
      mappedItems.forEach((item) => {
        const sizeStr = item.size?.ml ? `${item.size.ml} مل` : '';
        const name = item.productName || '';
        const qty = item.quantity || 1;
        const price = item.size?.price || 0;
        itemListText += `• ${name} ${sizeStr ? `(${sizeStr})` : ''} - العدد: ${qty} - السعر: ${price} جنيه\n`;
      });

      const message = `مرحباً ${customerName} 🌸

نود تأكيد طلبك من دار العطور (Scent House)
رقم الفاتورة: ${invoiceNumber}

تفاصيل الطلب:
${itemListText}
الإجمالي الكلي: ${total} جنيه

للتأكيد يرجى الرد بكلمة: تأكيد
لإلغاء الطلب يرجى الرد بكلمة: إلغاء

شكراً لثقتكم في دار العطور 🤍`;

      const waPhone = formatCustomerPhoneForWhatsApp(phoneStr);
      const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating WhatsApp message:', err);
      setToast({ message: 'حدث خطأ أثناء تجهيز رسالة الواتساب', type: 'error' });
    }
  };

  // Filter orders
  const getFilteredOrders = () => {
    let list = [...orders];

    // Status Filter
    if (selectedStatus !== 'all') {
      list = list.filter(o => o.status === selectedStatus);
    }

    // Search Query Filter (name, phone, invoice orderId)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => 
        o.fullname.toLowerCase().includes(q) || 
        o.phone.toLowerCase().includes(q) || 
        o.phone2?.toLowerCase().includes(q) || 
        o.orderId.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredOrders = getFilteredOrders();



  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] flex items-center gap-2">
          <i className="fa-solid fa-receipt"></i> سجل طلبات الشراء بالدار
        </h1>
        <p className="text-xs text-gray-400 mt-1">عرض ومتابعة شحنات العملاء، تغيير حالات التسليم والبحث عن الفواتير</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#121212] border border-gray-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="بحث باسم العميل، رقم الهاتف، أو كود الفاتورة (SH-XXXXX)..."
            className="w-full bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-right pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-3.5 text-gray-500 text-xs"></i>
        </div>

        {/* Status Filter */}
        <select
          className="bg-[#1A1A1A] border border-gray-800 focus:border-[#D4AF37] rounded-xl py-2.5 px-3 outline-none text-xs md:text-sm text-gray-300 focus:ring-1 focus:ring-[#D4AF37] focus:ring-opacity-20 text-right"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="جديد">جديد (بانتظار المراجعة)</option>
          <option value="قيد التجهيز">قيد التجهيز</option>
          <option value="تم الشحن">تم الشحن</option>
          <option value="تم التسليم">تم التسليم</option>
          <option value="ملغي">ملغي</option>
        </select>
      </div>

      {/* Orders Table/Cards */}
      {loading ? (
        <div className="text-center py-20 text-[#D4AF37]">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl"></i>
          <p className="text-xs text-gray-400 mt-3">جاري تحميل سجل الطلبات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          <i className="fa-solid fa-receipt text-4xl text-gray-700 mb-3"></i>
          <p className="text-sm">لم يتم العثور على طلبات مطابقة لخيارات التصفية</p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP ORDERS TABLE ── */}
          <div className="hidden md:block bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-gray-800 text-gray-400 text-xs font-bold">
                  <th className="py-4 px-6 w-28">كود الفاتورة</th>
                  <th className="py-4 px-6">العميل المستلم</th>
                  <th className="py-4 px-6">رقم الهاتف</th>
                  <th className="py-4 px-6">المدينة</th>
                  <th className="py-4 px-6 text-center">الإجمالي الكلي</th>
                  <th className="py-4 px-6">طريقة الدفع</th>
                  <th className="py-4 px-6 text-center w-40">الحالة</th>
                  <th className="py-4 px-6 text-center w-28">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    {/* Invoice ID */}
                    <td className="py-4 px-6 font-bold text-[#D4AF37] font-english">{o.orderId}</td>
                    {/* Customer Name */}
                    <td className="py-4 px-6 font-bold text-gray-200">{o.fullname}</td>
                    {/* Phone */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 justify-center">
                        <div className="flex items-center gap-2">
                          {o.phone ? (
                            <>
                              <span className="text-gray-300 font-english text-xs md:text-sm">{o.phone}</span>
                              <button
                                onClick={() => handleSendWhatsApp(o, o.phone)}
                                className="text-green-500 hover:text-green-400 cursor-pointer flex items-center justify-center p-0.5 hover:bg-green-500/10 rounded"
                                title="تأكيد الهاتف الأول عبر واتساب"
                                type="button"
                              >
                                <i className="fa-brands fa-whatsapp text-sm"></i>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-500 text-xs">لا يوجد رقم هاتف</span>
                          )}
                        </div>
                        {o.phone2 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-english text-[11px] md:text-xs">{o.phone2}</span>
                            <button
                              onClick={() => handleSendWhatsApp(o, o.phone2!)}
                              className="text-emerald-500 hover:text-emerald-400 cursor-pointer flex items-center justify-center p-0.5 hover:bg-emerald-500/10 rounded"
                              title="تأكيد الهاتف الثاني عبر واتساب"
                              type="button"
                            >
                              <i className="fa-brands fa-whatsapp text-xs"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* City */}
                    <td className="py-4 px-6 text-gray-400">{o.city}</td>
                    {/* Grand Total */}
                    <td className="py-4 px-6 text-center font-black text-gray-200">
                      <span className="font-english ml-0.5">{formatPriceVal(o.grandTotal)}</span>
                      <span className="text-[10px] text-gray-500 font-normal">جنيه</span>
                    </td>
                    {/* Payment Method */}
                    <td className="py-4 px-6 text-xs text-gray-400">{o.paymentMethodLabel}</td>
                    {/* Status inline change */}
                    <td className="py-4 px-6 text-center">
                      <select
                        className={`text-xs font-bold rounded-lg py-1.5 px-2 outline-none border cursor-pointer w-full text-center ${getStatusBadgeStyle(o.status)}`}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      >
                        <option value="جديد" className="bg-[#121212] text-yellow-400">جديد</option>
                        <option value="قيد التجهيز" className="bg-[#121212] text-blue-400">قيد التجهيز</option>
                        <option value="تم الشحن" className="bg-[#121212] text-purple-400">تم الشحن</option>
                        <option value="تم التسليم" className="bg-[#121212] text-green-400">تم التسليم</option>
                        <option value="ملغي" className="bg-[#121212] text-red-400">ملغي</option>
                      </select>
                    </td>
                    {/* Open Details Button */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleExpandOrder(o)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        عرض الطلب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS LIST ── */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-[#121212] border border-gray-800 rounded-2xl p-4 flex flex-col gap-4 relative">
                
                {/* Header Row */}
                <div className="flex justify-between items-center border-b border-gray-800/80 pb-2.5">
                  <span className="text-xs font-extrabold text-[#D4AF37] font-english">{o.orderId}</span>
                  <span className="text-[10px] text-gray-500 font-semibold font-english">
                    {new Date(o.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">العميل:</span>
                    <span className="font-bold text-gray-200">{o.fullname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الجوال:</span>
                    <span className="font-bold text-gray-300 font-english">{o.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الموقع:</span>
                    <span className="font-bold text-gray-300">{o.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">طريقة الدفع:</span>
                    <span className="text-gray-400">{o.paymentMethodLabel}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-800/40">
                    <span className="text-gray-500">إجمالي الفاتورة:</span>
                    <span className="font-black text-[#D4AF37] font-english text-sm">
                      {formatPriceFull(o.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Inline Status Dropdown & Details click button */}
                <div className="flex gap-2 pt-2 border-t border-gray-800/40">
                  <select
                    className={`flex-1 text-xs font-bold rounded-xl py-2 px-3 outline-none border cursor-pointer text-center ${getStatusBadgeStyle(o.status)}`}
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="جديد" className="bg-[#121212] text-yellow-400">جديد</option>
                    <option value="قيد التجهيز" className="bg-[#121212] text-blue-400">قيد التجهيز</option>
                    <option value="تم الشحن" className="bg-[#121212] text-purple-400">تم الشحن</option>
                    <option value="تم التسليم" className="bg-[#121212] text-green-400">تم التسليم</option>
                    <option value="ملغي" className="bg-[#121212] text-red-400">ملغي</option>
                  </select>
                  <button
                    onClick={() => handleExpandOrder(o)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 py-2 px-4 rounded-xl text-xs font-bold text-center cursor-pointer"
                  >
                    عرض التفاصيل
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* ── EXPANDED ORDER DETAILS DIALOG MODAL ── */}
      {expandedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto select-none backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#D4AF37] border-opacity-30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slideUp max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#1A1A1A] border-b border-gray-800 p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                  <i className="fa-solid fa-receipt"></i>
                  <span>تفاصيل طلب الشراء الفنية</span>
                </h3>
                <span className="text-xs font-bold font-english text-gray-400">{expandedOrder.orderId}</span>
              </div>
              <button onClick={() => setExpandedOrder(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-right text-xs md:text-sm">
              
              {/* Status Indicator */}
              <div className="flex items-center justify-between bg-[#1A1A1A] border border-gray-800 p-4 rounded-2xl">
                <div>
                  <span className="text-gray-400 block mb-1">الحالة الحالية للطلب</span>
                  <span className={`inline-block text-xs font-black rounded-lg py-1 px-3 border ${getStatusBadgeStyle(expandedOrder.status)}`}>
                    {expandedOrder.status}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-gray-400 block mb-1">تاريخ المعاملة</span>
                  <span className="font-semibold text-gray-200 font-english">
                    {new Date(expandedOrder.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="bg-[#1A1A1A] border border-gray-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-[#D4AF37] font-bold border-b border-gray-800 pb-2 flex items-center gap-2">
                  <i className="fa-solid fa-truck"></i> معلومات العميل والتوصيل
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block mb-0.5">اسم المستلم الكامل</span>
                    <span className="font-bold text-gray-200">{expandedOrder.fullname}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">المدينة والمنطقة</span>
                    <span className="font-bold text-gray-200">{expandedOrder.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">رقم الهاتف الأول</span>
                    <div className="flex items-center gap-2 mt-1">
                      {expandedOrder.phone ? (
                        <>
                          <span className="font-bold text-gray-200 font-english">{expandedOrder.phone}</span>
                          <button
                            onClick={() => handleSendWhatsApp(expandedOrder, expandedOrder.phone)}
                            className="text-green-500 hover:text-green-400 flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 py-1.5 px-3 rounded-xl border border-green-500/20 transition-all cursor-pointer font-bold"
                            title="تأكيد الهاتف الأول عبر واتساب"
                            type="button"
                          >
                            <i className="fa-brands fa-whatsapp text-sm"></i>
                            <span>تأكيد الطلب</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">لا يوجد رقم هاتف</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">رقم الهاتف الثاني (whats app)</span>
                    <div className="flex items-center gap-2 mt-1">
                      {expandedOrder.phone2 ? (
                        <>
                          <span className="font-bold text-gray-200 font-english">{expandedOrder.phone2}</span>
                          <button
                            onClick={() => handleSendWhatsApp(expandedOrder, expandedOrder.phone2!)}
                            className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 px-3 rounded-xl border border-emerald-500/20 transition-all cursor-pointer font-bold"
                            title="تأكيد الهاتف الثاني عبر واتساب"
                            type="button"
                          >
                            <i className="fa-brands fa-whatsapp text-sm"></i>
                            <span>تأكيد الطلب</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 font-bold">—</span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500 block mb-0.5">العنوان السكني المفصل</span>
                    <span className="font-bold text-gray-300 bg-[#121212] p-2.5 rounded-xl border border-gray-800/80 block mt-1">
                      {expandedOrder.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Order Products */}
              <div className="bg-[#1A1A1A] border border-gray-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-[#D4AF37] font-bold border-b border-gray-800 pb-2">العطور والبوكسات المطلوبة في الفاتورة</h4>
                
                {itemsLoading ? (
                  <div className="text-center py-6 text-gray-500">
                    <i className="fa-solid fa-circle-notch animate-spin ml-2"></i> جاري تحميل تفاصيل الشراء...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-[#121212] border border-gray-800 p-3 rounded-xl">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-gray-200 block truncate">{item.productName}</span>
                          
                          {/* Size label */}
                          <span className="text-[10px] text-gray-500 font-bold font-english">
                            {item.size?.ml} ML
                          </span>

                          {/* Gift Customization Packets if present */}
                          {(item.boxType || item.giftMessage) && (
                            <div className="mt-2 bg-[#1A1A1A] border border-yellow-600/10 p-2.5 rounded-lg space-y-1">
                              <span className="text-[9px] font-black text-[#D4AF37] block">
                                <i className="fa-solid fa-gift ml-1"></i> تخصيص هدايا سنت هاوس
                              </span>
                              {item.boxType && (
                                <p className="text-[10px] text-gray-300">
                                  <strong>نوع البوكس:</strong> {item.boxType}
                                </p>
                              )}
                              {item.giftMessage && (
                                <p className="text-[10px] text-gray-300 leading-relaxed">
                                  <strong>رسالة الإهداء:</strong> "{item.giftMessage}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-xs font-bold text-gray-400 block font-english">{formatPriceVal(item.size?.price)}ج × {item.quantity}</span>
                          <span className="text-xs font-black text-[#D4AF37] block mt-1 font-english">{formatPriceFull(item.size?.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cost Summary Box */}
              <div className="bg-[#1A1A1A] border border-gray-800 p-4 rounded-2xl space-y-2.5 font-english">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>سعر المنتجات الفرعي:</span>
                  <span>{formatPriceFull(expandedOrder.subtotal)}</span>
                </div>
                {expandedOrder.discount > 0 && (
                  <div className="flex justify-between text-xs text-green-400">
                    <span>خصم الكوبون المطبق:</span>
                    <span>-{formatPriceFull(expandedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{formatPriceFull(expandedOrder.vat)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>رسوم التغليف الفاخر والشحن:</span>
                  <span className="text-green-500 font-bold">مجاني</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2.5 border-t border-gray-800">
                  <span className="font-cairo">الإجمالي الكلي للفاتورة:</span>
                  <span className="text-[#D4AF37] text-base">{formatPriceFull(expandedOrder.grandTotal)}</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-800 p-5 flex gap-3 shrink-0 justify-end">
              <button
                onClick={() => setExpandedOrder(null)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 px-6 rounded-xl text-xs md:text-sm border border-gray-700 cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
