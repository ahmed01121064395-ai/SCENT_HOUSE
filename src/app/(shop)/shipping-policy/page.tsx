import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة التوصيل والشحن | Scent House',
  description: 'سياسة وتفاصيل شحن وتوصيل العطور في دار العطور Scent House.'
};

export default function ShippingPolicy() {
  return (
    <div id="view-shipping-policy" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">سياسة التوصيل والشحن</h1>
        <p>نعمل على توصيل عطوركم المفضلة بأسرع وقت وبأعلى معايير الأمان والسلامة</p>
      </div>

      <div className="section-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="text-right space-y-6 leading-relaxed text-gray-700" style={{ fontSize: '0.95rem' }}>
          <p>
            مرحباً بك في <strong>دار العطور - Scent House</strong>. نحن ملتزمون بتوفير تجربة توصيل سريعة وموثوقة لجميع الطلبات لضمان وصول زجاجات عطوركم النادرة مغلفة بشكل ملكي وبحالة مثالية.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>1. المناطق والمحافظات المشمولة بالشحن</h3>
          <p>
            نقوم حالياً بالشحن والتوصيل المباشر إلى المحافظات والمناطق التالية في جمهورية مصر العربية:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5 font-bold">
            <li>القاهرة والجيزة</li>
            <li>الإسكندرية</li>
            <li>الفيوم</li>
            <li>المنصورة</li>
            <li>طنطا</li>
          </ul>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>2. تكلفة الشحن</h3>
          <p>
            لإرضاء عملائنا وتقديم أفضل خدمة لهم، فإن <strong>جميع طلبات الشراء من متجرنا مؤهلة للشحن المجاني تماماً</strong> دون أي مصاريف إضافية (شحن مجاني 100% لجميع المناطق المذكورة أعلاه).
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>3. المدة المتوقعة للتوصيل</h3>
          <p>
            نسعى جاهدين لتسليم الشحنات بأسرع وقت ممكن. تستغرق مدة التوصيل المتوقعة:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li><strong>القاهرة، الجيزة، والفيوم:</strong> من 2 إلى 3 أيام عمل من تاريخ تأكيد الطلب.</li>
            <li><strong>باقي المحافظات (الإسكندرية، المنصورة، طنطا):</strong> من 3 إلى 5 أيام عمل من تاريخ تأكيد الطلب.</li>
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            * ملاحظة: أيام العمل الرسمية هي من السبت إلى الخميس (أيام الجمعة والعطلات الرسمية لا تحسب ضمن مدة التوصيل).
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>4. تتبع الطلب</h3>
          <p>
            بمجرد إتمام طلبك وتأكيده، سيقوم خبير خدمة العملاء في الدار بالتواصل معك مباشرة عبر الهاتف أو تطبيق واتساب لتزويدك بتفاصيل الشحن وموعد تسليم مندوب التوصيل للتنسيق المسبق معك.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>5. فشل محاولة التوصيل</h3>
          <p>
            في حال تعذر الوصول إليك في موعد التوصيل المحدد، سيقوم مندوب التوصيل بإجراء محاولة ثانية للتسليم في اليوم التالي بعد التنسيق الهاتفي. وفي حال فشل المحاولة الثانية أو تعذر التواصل، سيتم إرجاع الطلب إلى مقر الدار، ويُرجى التواصل معنا عبر البريد الإلكتروني <a href="mailto:scenthouse80@gmail.com" className="gold-text english-num">scenthouse80@gmail.com</a> أو واتساب لإعادة جدولة التوصيل.
          </p>
        </div>
      </div>
    </div>
  );
}
