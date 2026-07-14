import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Scent House',
  description: 'سياسة الخصوصية وحماية البيانات الشخصية لعملائنا في دار العطور Scent House.'
};

export default function PrivacyPolicy() {
  return (
    <div id="view-privacy-policy" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">سياسة الخصوصية</h1>
        <p>ملتزمون بحماية خصوصية بياناتك وتوفير تجربة تسوق آمنة وموثوقة</p>
      </div>

      <div className="section-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="text-right space-y-6 leading-relaxed text-gray-700" style={{ fontSize: '0.95rem' }}>
          <p>
            مرحباً بك في <strong>دار العطور - Scent House</strong>. نحن نولي أقصى درجات الأهمية لحماية خصوصية بياناتك الشخصية وأمانها. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند زيارتك لمتجرنا أو الشراء منه.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>1. البيانات التي نجمعها</h3>
          <p>
            عند قيامك بالشراء أو التسجيل في متجرنا، نقوم بجمع بعض البيانات الشخصية الأساسية اللازمة لإتمام طلبك وتقديم الخدمة الملكية التي تليق بك. وتشمل هذه البيانات:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li>الاسم الكامل.</li>
            <li>رقم الهاتف الأساسي ورقم الهاتف البديل (إن وجد).</li>
            <li>عنوان الشحن بالتفصيل (المحافظة، المدينة، اسم الشارع، ورقم البناء).</li>
            <li>تفاصيل الطلب والمنتجات التي قمت بشرائها.</li>
          </ul>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>2. كيف نستخدم بياناتك</h3>
          <p>
            نستخدم البيانات الشخصية التي نجمعها للأغراض التالية فقط:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li>معالجة طلبات الشراء وتأكيدها وتوصيلها إليك.</li>
            <li>تقديم دعم العملاء الفوري والإجابة على استفساراتك عبر واتساب أو الهاتف.</li>
            <li>تحسين جودة وتصميم العطور والخدمات المقدمة في الدار.</li>
            <li>إرسال تحديثات حول حالة شحن طلبك.</li>
          </ul>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>3. حماية وتخزين البيانات</h3>
          <p>
            تُخزن جميع البيانات بشكل آمن ومحمي باستخدام تقنيات قواعد البيانات السحابية المتقدمة والمشفرة (عبر خوادم Supabase الآمنة). نطبق معايير أمنية صارمة لمنع الوصول غير المصرح به أو الكشف عن بيانات عملائنا أو تعديلها. كما أننا نلتزم تماماً <strong>بعدم بيع أو مشاركة أو تأجير</strong> بياناتك لأي طرف ثالث لأغراض تسويقية.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>4. أمان الدفع الإلكتروني</h3>
          <p>
            إن حماية بيانات الدفع الخاصة بك هي أولويتنا القصوى. عند اختيارك الدفع الإلكتروني (مدى، بطاقة ائتمانية، محفظة رقمية)، يتم معالجة وتشفير جميع تفاصيل بطاقتك بأمان كامل مباشرة عبر بوابة الدفع المعتمدة <strong>Paymob</strong>. لا نقوم إطلاقاً بتخزين أو حفظ أي من بيانات بطاقتك الائتمانية أو أرقامها السرية على خوادمنا الخاصة.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>5. حقوقك وحذف البيانات</h3>
          <p>
            لك كامل الحق في طلب مراجعة بياناتك المسجلة لدينا، أو طلب تعديلها. كما يمكنك في أي وقت طلب حذف بياناتك الشخصية تماماً من سجلاتنا عن طريق التواصل مع خدمة عملاء الدار عبر البريد الإلكتروني المعتمد: <a href="mailto:scenthouse80@gmail.com" className="gold-text english-num">scenthouse80@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
