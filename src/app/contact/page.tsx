'use client';

import React from 'react';

export default function Contact() {
  return (
    <div id="view-contact" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">تواصل معنا</h1>
        <p>يسعدنا دائماً سماع آرائكم والإجابة على استفساراتكم على مدار الساعة</p>
      </div>
      
      <div className="section-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Card 1: Phone & Customer Service */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-phone"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>الهاتف وخدمة العملاء</h3>
            <a href="tel:01095363169" className="english-num" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', direction: 'ltr', display: 'block', marginBottom: '5px' }}>01095363169</a>
            <a href="tel:01005006426" className="english-num" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', direction: 'ltr', display: 'block' }}>01005006426</a>
          </div>

          {/* Card 2: Social Media */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-share-nodes"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>تابعنا على وسائل التواصل</h3>
            <div style={{ display: 'flex', gap: '20px', fontSize: '1.8rem', marginTop: '10px' }}>
              <a
                href="https://www.facebook.com/share/14eGj7rQq88/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1877F2' }}
                title="فيسبوك"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#E1306C' }}
                title="إنستغرام"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://www.tiktok.com/@scenthouse06?_r=1&_t=ZS-976Aee7qkxs"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#FE2C55' }}
                title="تيك توك"
              >
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Card 3: Address & Hours */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>الموقع ومقر الدار</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '8px' }}>الفيوم مركز طامية خلف مسجد النصر</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>السبت - الخميس: 9:00 ص - 10:00 م</p>
          </div>
        </div>
      </div>
    </div>
  );
}
