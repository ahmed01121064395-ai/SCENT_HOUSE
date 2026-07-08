'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';

export default function About() {
  const { aboutContent } = useApp();

  const title = aboutContent?.title || "من نحن | Scent House";
  const subtitle = aboutContent?.subtitle || "تعرف على تاريخ وقيم ورؤية دار العطور الفاخرة";
  const historyBadge = aboutContent?.history_badge || "نبذة تاريخية";
  const historyTitle = aboutContent?.history_title || "قصر يعبر عن جوهر الهوية العطرية الأصيلة";
  const historyDescription = aboutContent?.history_description || "تأسس دار العطور **Scent House** كعلامة تجارية رائدة وُلدت من شغف حقيقي بإنتاج عطور فريدة لا يطويها النسيان. نحن نسعى لنقل العميل في رحلة حسية راقية تربط الشرق بتقاليده الغنية وعبق دهن العود، بالغرب بابتكاراته الكلاسيكية والمنعشة.";
  const visionTitle = aboutContent?.vision_title || "رؤيتنا";
  const visionDescription = aboutContent?.vision_description || "أن نكون الوجهة الأولى لمتذوقي العطور النادرة والنخبة في الشرق الأوسط، بتقديم جودة ومعايير فخامة لا تُنافس، مع ضمان تجربة اقتناء تسوق ممتعة ومبهرة.";
  const missionTitle = aboutContent?.mission_title || "رسالتنا";
  const missionDescription = aboutContent?.mission_description || "ابتكار خلطات عطرية متميزة تثري حضور العميل وتضفي عليه طابعاً ساحراً يمتد تأثيره طويلاً، باستخدام أفضل المستخلصات النقية والتغليف المذهب الفريد.";
  const coverImage = aboutContent?.cover_image || "/images/S1.jpg";
  const values = Array.isArray(aboutContent?.values_list) ? aboutContent?.values_list : [
    { title: "النزاهة والضمان", desc: "نلتزم بنسبة نقاوة 100% لكافة الخلاصات والزيوت العطرية وضمان الثبات الممتد لأيام.", icon: "fa-award" },
    { title: "الابتكار والحرفية", desc: "أخصائيو العطور لدينا يمزجون العناصر يدوياً لضمان توليفة حصرية لا تتوفر لدى أي دار آخر.", icon: "fa-wand-magic-sparkles" },
    { title: "الخدمة الملكية", desc: "تغليف البوكسات وتصميم الرسائل والردود تتم بمستوى خدمة يليق بنخبة عملائنا الكرام.", icon: "fa-ribbon" }
  ];

  return (
    <div id="view-about" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">{title}</h1>
        <p>{subtitle}</p>
      </div>
      
      <div className="section-wrapper">
        <div className="about-panel-container">
          <div className="about-panel-text text-right">
            <span className="gold-text">{historyBadge}</span>
            <h3 className="gold-text">{historyTitle}</h3>
            <p style={{ fontSize: '0.95rem' }}>
              {historyDescription}
            </p>
            
            <h4 className="gold-text" style={{ marginTop: '20px', fontWeight: 700 }}>{visionTitle}</h4>
            <p style={{ fontSize: '0.95rem' }}>
              {visionDescription}
            </p>
            
            <h4 className="gold-text" style={{ marginTop: '20px', fontWeight: 700 }}>{missionTitle}</h4>
            <p style={{ fontSize: '0.95rem' }}>
              {missionDescription}
            </p>
          </div>
          <div className="about-panel-img-box">
            <Image
              src={coverImage}
              alt="دار عطور Scent House"
              width={500}
              height={400}
              className="about-panel-img"
            />
          </div>
        </div>
        
        {/* Core Values Cards */}
        <div className="about-values-grid text-right">
          {values.map((v: any, idx: number) => (
            <div className="value-card" key={idx}>
              <div className="value-icon"><i className={`fa-solid ${v.icon}`}></i></div>
              <h4 className="value-title gold-text">{v.title}</h4>
              <p className="value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
