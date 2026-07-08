'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function Home() {
  const { products, settings, homepageFeatures, testimonials: dbTestimonials, specialOffers } = useApp();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Video volume state
  const [video1Muted, setVideo1Muted] = useState(true);
  const [video2Muted, setVideo2Muted] = useState(true);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // Best Sellers list
  const bestSellers = products.filter(p => p.isBestSeller);

  // New Arrivals list (Newest first)
  const newArrivals = products
    .filter(p => p.isNew)
    .sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

  const scrollReviews = (direction: number) => {
    if (scrollerRef.current) {
      const scrollAmount = 300;
      scrollerRef.current.scrollBy({
        left: direction * -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleSound = (videoNum: number) => {
    if (videoNum === 1 && video1Ref.current) {
      const current = video1Ref.current.muted;
      video1Ref.current.muted = !current;
      setVideo1Muted(!current);
    } else if (videoNum === 2 && video2Ref.current) {
      const current = video2Ref.current.muted;
      video2Ref.current.muted = !current;
      setVideo2Muted(!current);
    }
  };

  // Testimonials Images
  const testimonials = dbTestimonials && dbTestimonials.length > 0
    ? dbTestimonials.map((t: any) => t.image_url)
    : [
        "/images/WhatsApp%20Image%202026-06-11%20at%202.09.04%20PM.jpeg",
        "/images/WhatsApp%20Image%202026-06-11%20at%202.09.04%20PMtryutu.jpeg",
        "/images/WhatsApp%20Image%202026-06-11%20at%202.09.05%20PM.jpeg",
        "/images/WhatsApp%20Image%202026-06-11%20at%202.09.05%20PMrewteewr.jpeg",
        "/images/WhatsApp%20Image%202026-06-11%20at%202.09.06%20PM.jpeg",
        "/images/WhatsApp%20Image%202026-06-21%20at%203.18.59%20AM.jpeg",
        "/images/WhatsApp%20Image%202026-06-21%20at%203.19.00%20AM.jpeg",
        "/images/890.jpeg",
        "/images/ertget.jpeg",
        "/images/m.jpeg",
        "/images/n.jpeg",
        "/images/wqe.jpeg"
      ];

  return (
    <div id="view-home" className="active">
      {/* Premium Fullscreen Hero Banner */}
      <div className="hero-section" style={{ backgroundImage: "url('/images/background.jpg')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title gold-text">{settings?.hero_title || "عطرٌ يليقُ بفخامتِك"}</h1>
          <p className="hero-slogan">{settings?.hero_subtitle || "اكتشف أرقى زجاجات العطور النادرة والروائح الساحرة المصممة خصيصاً لذوقك الرفيع"}</p>
          <div className="hero-buttons">
            <Link href="/shop" className="btn-premium inline-block text-center">
              تسوق الآن
            </Link>
            <Link href="/shop" className="btn-outline-gold inline-block text-center">
              اكتشف المجموعة
            </Link>
          </div>
        </div>
        
        {/* Bottom Feature Bar */}
        <div className="hero-features-bar">
          <div className="hero-features-container">
            {homepageFeatures && homepageFeatures.length > 0 ? (
              homepageFeatures.map((f: any, idx: number) => (
                <div className="feature-item" key={f.id || idx}>
                  <i className={`fa-solid ${f.icon} font-gold`}></i>
                  <span>{f.title}</span>
                </div>
              ))
            ) : (
              <>
                <div className="feature-item">
                  <i className="fa-solid fa-gem font-gold"></i>
                  <span>مكونات طبيعية نادرة ومختارة</span>
                </div>
                <div className="feature-item">
                  <i className="fa-solid fa-crown font-gold"></i>
                  <span>فخامة وروائح لا تضاهى</span>
                </div>
                <div className="feature-item">
                  <i className="fa-solid fa-hourglass-half font-gold"></i>
                  <span>ثبات وتأثير عالي يدوم طويلاً</span>
                </div>
                <div className="feature-item">
                  <i className="fa-solid fa-truck-fast font-gold"></i>
                  <span>شحن وتوصيل فاخر وسريع</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <div className="section-wrapper">
        <div className="section-header">
          <h2>الفئات الفاخرة</h2>
          <p>تسوق حسب تصاميم المجموعات العطرية الملائمة لذوقك</p>
        </div>
        <div className="categories-grid">
          {/* Category Men */}
          <Link href="/shop?category=men" className="category-card block">
            <div className="category-card-bg" style={{ backgroundImage: "url('/images/MEN.jpg')" }}></div>
            <div className="category-card-overlay">
              <h3 className="category-card-title">العطور الرجالية</h3>
              <p className="category-card-desc">قوة، ثقة وجاذبية عطرية كلاسيكية</p>
              <span className="category-card-link">تسوق الآن <i className="fa-solid fa-chevron-left"></i></span>
            </div>
          </Link>
          {/* Category Women */}
          <Link href="/shop?category=women" className="category-card block">
            <div className="category-card-bg" style={{ backgroundImage: "url('/images/WOMEN.jpg')" }}></div>
            <div className="category-card-overlay">
              <h3 className="category-card-title">العطور النسائية</h3>
              <p className="category-card-desc">سحر، نعومة ورقة في كل التفاصيل</p>
              <span className="category-card-link">تسوق الآن <i className="fa-solid fa-chevron-left"></i></span>
            </div>
          </Link>
          {/* Category Gifts */}
          <Link href="/shop?category=gifts" className="category-card block">
            <div className="category-card-bg" style={{ backgroundImage: "url('/images/GIFT%20BOX.jpg')" }}></div>
            <div className="category-card-overlay">
              <h3 className="category-card-title">بوكسات الهدايا</h3>
              <p className="category-card-desc">تغليف فاخر وبوكسات مناسبات مخصصة لأحبائك</p>
              <span className="category-card-link">اكتشف التغليف <i className="fa-solid fa-chevron-left"></i></span>
            </div>
          </Link>
        </div>
      </div>

      {/* Best Sellers Grid */}
      <div className="section-wrapper">
        <div className="section-header">
          <h2>الأكثر مبيعاً</h2>
          <p>العطور الأكثر تفضيلاً وطلباً من قبل متذوقي الفخامة</p>
        </div>
        <div className="product-grid">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Special Offers Section */}
      <section className="offers-section" id="special-offers">
        <div className="offers-container">
          <div className="section-header">
            <h2 className="gold-text">🎁 عروض سنت هاوس</h2>
            <p>اغتنم الفرصة قبل نفاد الكمية — عروض حصرية لفترة محدودة</p>
          </div>

          <div className="offers-grid">
            {specialOffers && specialOffers.length > 0 ? (
              specialOffers.filter((o: any) => o.is_active).map((offer: any, idx: number) => {
                const details = Array.isArray(offer.details_list) ? offer.details_list : [];
                return (
                  <div className={`offer-card ${idx === 1 ? 'featured' : ''}`} key={offer.id || idx}>
                    {offer.badge_text && (
                      <span className={`offer-badge ${idx === 1 ? 'hot' : offer.badge_text.includes('300') ? 'save' : ''}`}>{offer.badge_text}</span>
                    )}
                    <div className="offer-img-wrapper">
                      <Image
                        src={offer.image_url || "/images/1.jpg"}
                        alt={offer.title}
                        fill
                        className="offer-img"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="offer-card-body">
                      <h3 className="offer-title gold-text">{offer.title}</h3>
                      <div className="offer-details">
                        {details.map((detail: string, dIdx: number) => (
                          <p className="detail-item" key={dIdx}>
                            <i className="fa-solid fa-circle-check"></i> {detail}
                          </p>
                        ))}
                      </div>
                      <div className="offer-pricing">
                        {offer.old_price && <span className="old-price">{offer.old_price} جنيه</span>}
                        <span className="new-price gold-text">{offer.new_price} جنيه</span>
                      </div>
                      <a
                        href={buildWhatsAppLink(offer.whatsapp_text || `أرغب في طلب ${offer.title}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-premium btn-offer"
                      >
                        اطلب الآن
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Offer 1 */}
                <div className="offer-card">
                  <span className="offer-badge">وفر 200 جنيه!</span>
                  <div className="offer-img-wrapper">
                    <Image
                      src="/images/1.jpg"
                      alt="العرض الأول"
                      fill
                      className="offer-img"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="offer-card-body">
                    <h3 className="offer-title gold-text">🔥 العرض الأول</h3>
                    <div className="offer-details">
                      <p className="detail-item"><i className="fa-solid fa-circle-check"></i> 2 × 50 مل</p>
                      <p className="detail-item"><i className="fa-solid fa-gift"></i> بوكس التسترات هدية</p>
                    </div>
                    <div className="offer-pricing">
                      <span className="old-price">1100 جنيه</span>
                      <span className="new-price gold-text">900 جنيه</span>
                    </div>
                    <a
                      href={buildWhatsAppLink('أرغب في طلب العرض الأول')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium btn-offer"
                    >
                      اطلب الآن
                    </a>
                  </div>
                </div>

                {/* Offer 2 */}
                <div className="offer-card featured">
                  <span className="offer-badge hot">☀️ الأكثر طلباً</span>
                  <div className="offer-img-wrapper">
                    <Image
                      src="/images/2.jpeg"
                      alt="عرض الصيف"
                      fill
                      className="offer-img"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="offer-card-body">
                    <h3 className="offer-title gold-text">☀️ عرض الصيف</h3>
                    <div className="offer-details">
                      <p className="detail-item"><i className="fa-solid fa-circle-check"></i> بوكس 30 مل</p>
                      <p className="detail-item"><i className="fa-solid fa-gift"></i> بوكس التسترات هدية</p>
                    </div>
                    <div className="offer-pricing">
                      <span className="old-price">950 جنيه</span>
                      <span className="new-price gold-text">800 جنيه</span>
                    </div>
                    <a
                      href={buildWhatsAppLink('أرغب في طلب عرض الصيف')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium btn-offer"
                    >
                      اطلب الآن
                    </a>
                  </div>
                </div>

                {/* Offer 3 */}
                <div className="offer-card">
                  <span className="offer-badge save">وفر 300 جنيه!</span>
                  <div className="offer-img-wrapper">
                    <Image
                      src="/images/3.jpeg"
                      alt="عرض سنت هاوس الجبار"
                      fill
                      className="offer-img"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="offer-card-body">
                    <h3 className="offer-title gold-text">👑 عرض سنت هاوس الجبار</h3>
                    <div className="offer-details">
                      <p className="detail-item"><i className="fa-solid fa-circle-check"></i> 4 × 50 مل</p>
                      <p className="detail-item"><i className="fa-solid fa-gift"></i> بوكس التسترات هدية</p>
                    </div>
                    <div className="offer-pricing">
                      <span className="old-price">1600 جنيه</span>
                      <span className="new-price gold-text">1300 جنيه</span>
                    </div>
                    <a
                      href={buildWhatsAppLink('أرغب في طلب عرض سنت هاوس الجبار')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium btn-offer"
                    >
                      اطلب الآن
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom of the Section */}
          <div className="offers-bottom-bar text-center">
            <div className="bottom-item">
              <span className="emoji">📦</span>
              <span>شحن لجميع محافظات مصر</span>
            </div>
            <div className="bottom-item">
              <span className="emoji">⏳</span>
              <span>الكمية محدودة والعروض سارية لفترة محدودة.</span>
            </div>
            <a href={buildWhatsAppLink('')} target="_blank" rel="noopener noreferrer" className="bottom-cta-btn inline-flex items-center justify-center">
              <span className="emoji">📞</span>
              <span>للطلب: {settings?.contact_phone_1 || "01095363169"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <div className="section-wrapper">
        <div className="section-header">
          <h2>آراء عملاء Scent House</h2>
          <p>ثقة عملائنا هي سر نجاح الدار — لقطات من محادثات وآراء عملائنا الراقين</p>
        </div>
        
        {/* Horizontal Scrollable Review Screenshots */}
        <div className="reviews-scroller-container">
          <div className="reviews-scroller" ref={scrollerRef}>
            {testimonials.map((src, i) => (
              <div className="review-screenshot-card" key={i}>
                <Image
                  src={src}
                  alt={`رأي عميل ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="280px"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div className="scroller-nav-buttons">
            <button className="scroller-btn btn-prev" onClick={() => scrollReviews(-1)}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button className="scroller-btn btn-next" onClick={() => scrollReviews(1)}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </div>
      </div>

      {/* New Arrivals Grid */}
      <div className="section-wrapper">
        <div className="section-header">
          <h2>أحدث الإصدارات</h2>
          <p>روائح جديدة تنضم لأسطول عطورنا الفاخرة، استكشف التميز الآن</p>
        </div>
        <div className="product-grid">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Social Media Engagement Section */}
      <div className="social-section" style={{ padding: '25px 0' }}>
        <div className="section-header" style={{ marginBottom: '15px' }}>
          <h3 className="gold-text" style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '5px' }}>
            تابعنا على مواقع التواصل
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          {/* Facebook Card */}
          <div className="value-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', minHeight: '140px' }}>
            <div className="value-icon" style={{ color: '#1877F2', fontSize: '2rem', marginBottom: '5px' }}>
              <i className="fa-brands fa-facebook"></i>
            </div>
            <h4 className="value-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>Scent House</h4>
            <a
              href={settings?.facebook_url || "https://www.facebook.com/share/14eGj7rQq88/?mibextid=wwXIfr"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
              style={{ width: '100%', textAlign: 'center', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none', display: 'block' }}
            >
              متابعة الصفحة <i className="fa-solid fa-arrow-up-right" style={{ marginRight: '5px', fontSize: '0.7rem' }}></i>
            </a>
          </div>
          
          {/* Instagram Card */}
          <div className="value-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', minHeight: '140px' }}>
            <div className="value-icon" style={{ color: '#E1306C', fontSize: '2rem', marginBottom: '5px' }}>
              <i className="fa-brands fa-instagram"></i>
            </div>
            <h4 className="value-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>scent.house9</h4>
            <a
              href={settings?.instagram_url || "https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
              style={{ width: '100%', textAlign: 'center', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none', display: 'block' }}
            >
              متابعة الحساب <i className="fa-solid fa-arrow-up-right" style={{ marginRight: '5px', fontSize: '0.7rem' }}></i>
            </a>
          </div>
          
          {/* TikTok Card */}
          <div className="value-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', minHeight: '140px' }}>
            <div className="value-icon" style={{ color: 'var(--text-primary)', fontSize: '2rem', marginBottom: '5px' }}>
              <i className="fa-brands fa-tiktok"></i>
            </div>
            <h4 className="value-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>@scenthouse06</h4>
            <a
              href={settings?.tiktok_url || "https://www.tiktok.com/@scenthouse06?_r=1&_t=ZS-976Aee7qkxs"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
              style={{ width: '100%', textAlign: 'center', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none', display: 'block' }}
            >
              متابعة القناة <i className="fa-solid fa-arrow-up-right" style={{ marginRight: '5px', fontSize: '0.7rem' }}></i>
            </a>
          </div>
        </div>
      </div>

      {/* Instagram Feed Grid Section */}
      <div className="section-wrapper" style={{ marginTop: '60px' }}>
        <div className="section-header">
          <h2>إلهام وفخامة يومية</h2>
          <p>
            أبرز لقطات عطورنا وجلسات التصوير الحصرية عبر إنستغرام{' '}
            <a
              href={settings?.instagram_url || "https://www.instagram.com/scent.house9?igsh=MThtbXFzODVuYzNhZg%3D%3D&utm_source=qr"}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-text"
              style={{ textDecoration: 'none' }}
            >
              @scent.house9
            </a>
          </p>
        </div>

        {/* Inspiration Videos Row (Grande Fragrances style) */}
        <div className="hero-videos-row" style={{ marginTop: '25px' }}>
          <div className="hero-video-card">
            <video
              ref={video1Ref}
              src={settings?.hero_video_1_url || "/videos/v1.mp4"}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/background.jpg"
              onClick={() => handleToggleSound(1)}
              style={{ cursor: 'pointer' }}
            ></video>
            <button className="sound-toggle-btn" onClick={() => handleToggleSound(1)}>
              <i className={`fa-solid ${video1Muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
          </div>
          <div className="hero-video-card">
            <video
              ref={video2Ref}
              src={settings?.hero_video_2_url || "/videos/v2.mp4"}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/background.jpg"
              onClick={() => handleToggleSound(2)}
              style={{ cursor: 'pointer' }}
            ></video>
            <button className="sound-toggle-btn" onClick={() => handleToggleSound(2)}>
              <i className={`fa-solid ${video2Muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
