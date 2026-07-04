'use client';

import React from 'react';

export default function About() {
  return (
    <div id="view-about" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">من نحن | Scent House</h1>
        <p>تعرف على تاريخ وقيم ورؤية دار العطور الفاخرة</p>
      </div>
      
      <div className="section-wrapper">
        <div className="about-panel-container">
          <div className="about-panel-text text-right">
            <span className="gold-text">نبذة تاريخية</span>
            <h3 className="gold-text">قصر يعبر عن جوهر الهوية العطرية الأصيلة</h3>
            <p style={{ fontSize: '0.95rem' }}>
              تأسس دار العطور **Scent House** كعلامة تجارية رائدة وُلدت من شغف حقيقي بإنتاج عطور فريدة لا يطويها النسيان. نحن نسعى لنقل العميل في رحلة حسية راقية تربط الشرق بتقاليده الغنية وعبق دهن العود، بالغرب بابتكاراته الكلاسيكية والمنعشة.
            </p>
            
            <h4 className="gold-text" style={{ marginTop: '20px', fontWeight: 700 }}>رؤيتنا</h4>
            <p style={{ fontSize: '0.95rem' }}>
              أن نكون الوجهة الأولى لمتذوقي العطور النادرة والنخبة في الشرق الأوسط، بتقديم جودة ومعايير فخامة لا تُنافس، مع ضمان تجربة اقتناء تسوق ممتعة ومبهرة.
            </p>
            
            <h4 className="gold-text" style={{ marginTop: '20px', fontWeight: 700 }}>رسالتنا</h4>
            <p style={{ fontSize: '0.95rem' }}>
              ابتكار خلطات عطرية متميزة تثري حضور العميل وتضفي عليه طابعاً ساحراً يمتد تأثيره طويلاً، باستخدام أفضل المستخلصات النقية والتغليف المذهب الفريد.
            </p>
          </div>
          <div className="about-panel-img-box">
            <img
              src="/images/S1.jpg"
              alt="دار عطور Scent House"
              className="about-panel-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/500x480/121212/D4AF37?text=About+Us';
              }}
            />
          </div>
        </div>
        
        {/* Core Values Cards */}
        <div className="about-values-grid text-right">
          <div className="value-card">
            <div className="value-icon"><i className="fa-solid fa-award"></i></div>
            <h4 className="value-title gold-text">النزاهة والضمان</h4>
            <p className="value-desc">نلتزم بنسبة نقاوة 100% لكافة الخلاصات والزيوت العطرية وضمان الثبات الممتد لأيام.</p>
          </div>
          
          <div className="value-card">
            <div className="value-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
            <h4 className="value-title gold-text">الابتكار والحرفية</h4>
            <p className="value-desc">أخصائيو العطور لدينا يمزجون العناصر يدوياً لضمان توليفة حصرية لا تتوفر لدى أي دار آخر.</p>
          </div>
          
          <div className="value-card">
            <div className="value-icon"><i className="fa-solid fa-ribbon"></i></div>
            <h4 className="value-title gold-text">الخدمة الملكية</h4>
            <p className="value-desc">تغليف البوكسات وتصميم الرسائل والردود تتم بمستوى خدمة يليق بنخبة عملائنا الكرام.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
