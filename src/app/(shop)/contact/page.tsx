'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Contact() {
  const { settings } = useApp();

  const hasSettings = !!settings;
  const rawPhone1 = hasSettings ? settings.contact_phone_1 : "01095363169";
  const rawPhone2 = hasSettings ? settings.contact_phone_2 : "01005006426";
  const phone1 = rawPhone1?.trim();
  const phone2 = rawPhone2?.trim();

  return (
    <div id="view-contact" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">تواصل معنا</h1>
        <p>يسعدنا دائماً سماع آرائكم والإجابة على استفساراتكم على مدار الساعة</p>
      </div>
      
      <div className="section-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Card 1: Phone & Customer Service */}
          {(phone1 || phone2) && (
            <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
                <i className="fa-solid fa-phone"></i>
              </div>
              <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>الهاتف وخدمة العملاء</h3>
              {phone1 && (
                <a href={`tel:${phone1}`} className="english-num" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', direction: 'ltr', display: 'block', marginBottom: '5px' }}>
                  {phone1}
                </a>
              )}
              {phone2 && (
                <a href={`tel:${phone2}`} className="english-num" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', direction: 'ltr', display: 'block' }}>
                  {phone2}
                </a>
              )}
            </div>
          )}

          {/* Card 2: Social Media */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-share-nodes"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>تابعنا على وسائل التواصل</h3>
            <div style={{ display: 'flex', gap: '20px', fontSize: '1.8rem', marginTop: '10px' }}>
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
          </div>

          {/* Card 3: Address & Hours */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>الموقع ومقر الدار</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '8px' }}>
              {settings?.contact_address || "القاهرة، مصر"}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {settings?.working_hours || "السبت - الخميس: 9:00 ص - 10:00 م"}
            </p>
          </div>

          {/* Card 4: Email & Support */}
          <div className="value-card" style={{ padding: '30px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              <i className="fa-solid fa-envelope"></i>
            </div>
            <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px' }}>البريد الإلكتروني</h3>
            <a href={`mailto:${settings?.contact_email || 'scenthouse80@gmail.com'}`} className="english-num" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', direction: 'ltr', display: 'block' }}>
              {settings?.contact_email || 'scenthouse80@gmail.com'}
            </a>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              سنقوم بالرد عليك خلال 24 ساعة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
