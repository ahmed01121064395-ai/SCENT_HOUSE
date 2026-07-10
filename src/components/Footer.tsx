'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { settings } = useApp();

  return (
    <footer>
      {/* Bottom bar copyright */}
      <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="footer-copy">
          &copy; <span className="english-num">2026</span> جميع الحقوق محفوظة لـ{' '}
          <span className="gold-text">دار العطور - Scent House</span>.
        </div>

        {/* Footer Social Media Links and Phone numbers */}
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

          {/* Conditional Phones & Separator */}
          {(() => {
            const hasSettings = !!settings;
            const rawPhone1 = hasSettings ? settings.contact_phone_1 : "01095363169";
            const rawPhone2 = hasSettings ? settings.contact_phone_2 : "01005006426";
            const phone1 = rawPhone1?.trim();
            const phone2 = rawPhone2?.trim();

            if (!phone1 && !phone2) return null;

            return (
              <>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '10px', marginLeft: '10px' }}>|</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', display: 'flex', gap: '10px', direction: 'ltr' }}>
                  {phone1 && (
                    <a href={`tel:${phone1}`} className="english-num" style={{ color: 'var(--primary-gold)' }}>
                      {phone1}
                    </a>
                  )}
                  {phone1 && phone2 && <span>-</span>}
                  {phone2 && (
                    <a href={`tel:${phone2}`} className="english-num" style={{ color: 'var(--primary-gold)' }}>
                      {phone2}
                    </a>
                  )}
                </span>
              </>
            );
          })()}
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
