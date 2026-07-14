'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { settings } = useApp();

  const hasSettings = !!settings;
  const rawPhone1 = hasSettings ? settings.contact_phone_1 : "01095363169";
  const rawPhone2 = hasSettings ? settings.contact_phone_2 : "01005006426";
  const phone1 = rawPhone1?.trim();
  const phone2 = rawPhone2?.trim();
  const address = hasSettings ? settings.contact_address : "القاهرة، مصر";
  const email = (settings as any)?.contact_email || "sayedohod0@gmail.com";

  return (
    <footer>
      {/* Top Footer Section */}
      <div className="footer-container">
        {/* Column 1: Brand details */}
        <div className="footer-column text-right">
          <h4>دار العطور - Scent House</h4>
          <p>
            دار عطور عربية فاخرة تسعى لتقديم أرقى التوليفات العطرية النادرة والروائح الساحرة المصممة خصيصاً لتناسب أرقى الأذواق. نعمل بشغف وعناية فائقة لنمنحك تجربة عطرية لا تُنسى.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column text-right">
          <h4>روابط سريعة</h4>
          <ul>
            <li>
              <Link href="/">الرئيسية</Link>
            </li>
            <li>
              <Link href="/shop">معرض العطور</Link>
            </li>
            <li>
              <Link href="/about">من نحن</Link>
            </li>
            <li>
              <Link href="/contact">تواصل معنا</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Policy Pages */}
        <div className="footer-column text-right">
          <h4>سياساتنا</h4>
          <ul>
            <li>
              <Link href="/privacy-policy">سياسة الخصوصية</Link>
            </li>
            <li>
              <Link href="/shipping-policy">سياسة التوصيل والشحن</Link>
            </li>
            <li>
              <Link href="/refund-policy">سياسة الاسترجاع والإلغاء</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Information */}
        <div className="footer-column text-right">
          <h4>معلومات التواصل</h4>
          <ul className="contact-info-list">
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-envelope"></i>
              <span className="english-num">{email}</span>
            </li>
            {(phone1 || phone2) && (
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone"></i>
                <span className="english-num" style={{ direction: 'ltr' }}>
                  {phone1} {phone2 ? ` - ${phone2}` : ''}
                </span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-location-dot"></i>
              <span>{address}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar copyright */}
      <div className="footer-bottom" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="footer-copy">
          &copy; <span className="english-num">2026</span> جميع الحقوق محفوظة لـ{' '}
          <span className="gold-text">دار العطور - Scent House</span>.
        </div>

        {/* Footer Social Media Links */}
        <div style={{ display: 'flex', gap: '15px', fontSize: '1.1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تابعنا:</span>
          <a
            href={settings?.facebook_url || "https://www.facebook.com/share/14eGj7rQq88/?mibextid=wwXIfr"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1877F2' }}
            title="فيسبوك"
          >
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a
            href={settings?.instagram_url || "https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#E1306C' }}
            title="إنستغرام"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a
            href={settings?.tiktok_url || "https://www.tiktok.com/@scenthouse06?_r=1&_t=ZS-976Aee7qkxs"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FE2C55' }}
            title="تيك توك"
          >
            <i className="fa-brands fa-tiktok"></i>
          </a>
        </div>

        {/* Trust badges / payment mock icons */}
        <div className="footer-payments flex items-center">
          <i className="fa-brands fa-apple-pay" title="Apple Pay"></i>
          <span className="text-[10px] text-gray-500 font-bold border border-gray-800 rounded px-1.5 py-0.5 mr-2">الدفع عند الاستلام (COD)</span>
        </div>
      </div>
    </footer>
  );
}
