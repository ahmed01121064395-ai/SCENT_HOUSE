'use client';

import React from 'react';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useApp } from '@/context/AppContext';

export default function FloatingSocials() {
  const { settings } = useApp();

  return (
    <div className="floating-social-bar">
      <a
        href={buildWhatsAppLink('مرحباً سنت هاوس، أود الاستفسار عن العطور المتميزة والعروض.')}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-social-btn"
        title="تواصل عبر الواتساب"
        style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>
      <a
        href={settings?.instagram_url || "https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-social-btn"
        title="تابعنا على إنستغرام"
        style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', borderColor: 'transparent' }}
      >
        <i className="fa-brands fa-instagram"></i>
      </a>
      <a
        href={settings?.tiktok_url || "https://www.tiktok.com/@scenthouse06?_r=1&_t=ZS-976Aee7qkxs"}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-social-btn"
        title="تابعنا على تيك توك"
        style={{ background: '#010101', color: '#fff', borderColor: '#010101' }}
      >
        <i className="fa-brands fa-tiktok"></i>
      </a>
    </div>
  );
}
