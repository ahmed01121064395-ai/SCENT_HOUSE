import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع والإلغاء | Scent House',
  description: 'سياسة وشروط استرجاع العطور وإلغاء الطلبات في دار العطور Scent House.'
};

export default function RefundPolicy() {
  return (
    <div id="view-refund-policy" className="active">
      <div className="info-page-header">
        <h1 className="gold-text">سياسة الاسترجاع والإلغاء</h1>
        <p>نضمن رضاكم الكامل ونسعى لتوفير تجربة تسوق مرنة وعادلة</p>
      </div>

      <div className="section-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="text-right space-y-6 leading-relaxed text-gray-700" style={{ fontSize: '0.95rem' }}>
          <p>
            في <strong>دار العطور - Scent House</strong>، نسعى دائماً لتقديم عطور فاخرة تفوق توقعاتكم. نوضح هنا شروط وإجراءات إلغاء الطلبات أو استرجاعها بما يتماشى مع معايير الجودة وسلامة وصحة عملائنا.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>1. إلغاء الطلب قبل الشحن</h3>
          <p>
            يمكن للعميل طلب إلغاء الطلب بالكامل واسترداد قيمته المدفوعة دون فرض أي رسوم في حال تم تقديم طلب الإلغاء <strong>قبل البدء في عملية شحن الطلب وتغير حالته إلى "تم الشحن"</strong>. لتعديل أو إلغاء طلبك، يرجى التواصل معنا فوراً عبر واتساب أو البريد الإلكتروني <a href="mailto:scenthouse80@gmail.com" className="gold-text english-num">scenthouse80@gmail.com</a>.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>2. شروط الاسترجاع والاستبدال</h3>
          <p>
            تخضع عملية الاسترجاع والاستبدال للشروط والأحكام التالية:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li>يجب تقديم طلب الاسترجاع خلال <strong>48 ساعة</strong> كحد أقصى من تاريخ استلام الشحنة.</li>
            <li>يجب أن يكون المنتج في حالته الأصلية تماماً: <strong>غير مفتوح، غير مستخدم، وبكامل تغليفه المذهب والأشرطة والملصقات وسلوفان الحماية الخاص به</strong> دون أي تلف أو تغيير.</li>
            <li>يجب إرفاق فاتورة الشراء الأصلية أو تفاصيل رقم الطلب مع المرتجع.</li>
          </ul>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>3. المنتجات غير القابلة للاسترجاع</h3>
          <p>
            بناءً على طبيعة منتجاتنا وحرصاً على السلامة الصحية العامة لعملائنا، فإن <strong>جميع زجاجات العطور التي تم فتح غلاف سلوفان الحماية الخاص بها أو تم استخدامها/رشها ولو لمرة واحدة غير قابلة للاسترجاع أو الاستبدال نهائياً</strong>. يُستثنى من ذلك فقط الحالات التي يثبت فيها وجود عيب مصنعي في البخاخ أو الزجاجة فور الاستلام.
          </p>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>4. كيفية معالجة وإرجاع المبالغ</h3>
          <p>
            بعد استلام المنتج المرتجع وفحصه من قبل فريق الجودة بالدار والتأكد من مطابقته لشروط الاسترجاع:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li><strong>الدفع الإلكتروني (البطاقات الائتمانية / المحافظ الرقمية):</strong> يتم رد المبلغ المدفوع مباشرة إلى نفس البطاقة المستخدمة في عملية الشراء. قد تستغرق عملية ظهور المبلغ في حسابك البنكي من 7 إلى 14 يوم عمل حسب إجراءات البنك المصدر للبطاقة.</li>
            <li><strong>الدفع عند الاستلام (COD):</strong> يتم رد المبلغ عبر وسيلة تحويل نقدي نتفق عليها مع العميل (مثل محافظ الهاتف الذكي أو التحويل البنكي المباشر).</li>
            <li>* يرجى العلم بأن رسوم الشحن الأصلية (إن وجدت) ورسوم شحن الإرجاع تكون على عاتق العميل إلا إذا كان الإرجاع ناتجاً عن عيب مصنعي أو خطأ في إرسال صنف مختلف من الدار.</li>
          </ul>

          <h3 className="gold-text text-lg font-bold mt-6 mb-3" style={{ color: 'var(--primary-gold)' }}>5. خطوات تقديم طلب الاسترجاع</h3>
          <p>
            لبدء عملية الاسترجاع، يرجى التواصل معنا عبر:
          </p>
          <ul style={{ listStyleType: 'disc', paddingRight: '20px', margin: '10px 0' }} className="space-y-1.5">
            <li>البريد الإلكتروني: <a href="mailto:scenthouse80@gmail.com" className="gold-text english-num">scenthouse80@gmail.com</a></li>
            <li>خدمة عملاء واتساب المباشرة المتاحة على المتجر.</li>
          </ul>
          <p>
            يرجى توضيح رقم الطلب، واسم المنتج، وسبب الإرجاع مع إرفاق صور للمنتج بغلافه الأصلي للمساعدة في تسريع الإجراءات.
          </p>
        </div>
      </div>
    </div>
  );
}
