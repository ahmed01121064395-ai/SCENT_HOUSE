'use client';

import React from 'react';

export default function FloatingSocials() {
  return (
    <div className="floating-social-bar">
      <a
        href="https://wa.me/201095363169?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B3%D9%86%D8%AA%20%D9%87%D8%A7%D9%88%D8%B3%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%B9%D8%AA%D9%88%D8%B1%20%D8%A7%D9%84%D9%85%D8%AA%D9%85%D9%8A%D8%B2%D8%A9%20%D9%88%D8%A7%D9%84%D8%B9%D8%B1%D9%88%D8%B6."
        target="_blank"
        rel="noopener noreferrer"
        className="floating-social-btn"
        title="تواصل عبر الواتساب"
        style={{ background: '#25D366', color: '#fff', borderColor: '#25D366' }}
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>
      <a
        href="https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-social-btn"
        title="تابعنا على إنستغرام"
        style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', borderColor: 'transparent' }}
      >
        <i className="fa-brands fa-instagram"></i>
      </a>
      <a
        href="https://www.tiktok.com/@scenthouse06?_r=1&_t=ZS-976Aee7qkxs"
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
