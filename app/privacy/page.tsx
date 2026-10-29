import Link from 'next/link';

export const metadata = {
  title: 'سياسة الخصوصية | سيارتي ستور',
  description: 'سياسة الخصوصية وشروط الاستخدام الخاصة بمتجر سيارتي ستور',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        {/* زر العودة */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>
            ← العودة للرئيسية
          </Link>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
          🔒 سياسة الخصوصية (Privacy Policy)
        </h1>

        <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
          مرحباً بكم في منصة <strong>سيارتي ستور (sayarty.store)</strong>. نحن نلتزم بحماية خصوصية بياناتكم الشخصية وتوفير بيئة آمنة لكل مستخدمينا. توضح هذه الصفحة كيفية جمع المعلومات واستخدامها وحمايتها عند استخدام منصتنا وتحديثاتها.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          1. المعلومات التي نجمعها
        </h2>
        <p style={{ lineHeight: '1.8', color: '#475569' }}>
          عند قيامك بإنشاء حساب عبر البريد الإلكتروني أو تسجيل الدخول باستخدام حساب جوجل (Google OAuth)، فإننا نتعامل مع البيانات الأساسية التالية المصرح بها فقط:
        </p>
        <ul style={{ paddingRight: '20px', lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
          <li>الاسم الكامل (Full Name).</li>
          <li>عنوان البريد الإلكتروني (Email Address).</li>
          <li>صورة الملف الشخصي التعريفية (في حال توفرها عبر جوجل).</li>
        </ul>

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          2. كيف نستخدم معلوماتك؟
        </h2>
        <p style={{ lineHeight: '1.8', color: '#475569' }}>
          نستخدم المعلومات التي نجمعها لأغراض محددة تشمل:
        </p>
        <ul style={{ paddingRight: '20px', lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
          <li>إنشاء وتوثيق حسابك الشخصي وإدارته بسلاسة.</li>
          <li>توفير خدمات إدراج واستعراض السيارات والمعاملات داخل المنصة.</li>
          <li>التواصل معك بشأن تحديثات الحساب أو المعاملات أو الدعم الفني.</li>
          <li>تحسين أداء الجودة والأمان لمنع أي نشاط احتيالي.</li>
        </ul>

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          3. حماية البيانات ومشاركتها
        </h2>
        <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
          نحن نولي اقصى درجات السريه والامان لبياناتك و لا نبيع أو نطلع أو نشارك أي بيانات شخصية للمستخدمين مع أطراف خارجية لأغراض تسويقية. يتم تخزين البيانات وتأمينها عبر سيرفرات مبنية على أعلى معايير التشفير والأمان.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          4. حقوق المستخدم وإلغاء الحساب
        </h2>
        <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
          يحق لك في أي وقت طلب استعراض، تعديل، أو حذف بياناتك الشخصية المسجلة لدينا بشكل نهائي عبر التواصل مع فريق الدعم الفني.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
          5. التواصل معنا
        </h2>
        <p style={{ lineHeight: '1.8', color: '#475569' }}>
          إذا كان لديك أي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني الرسمي:
          <br />
          <a href="mailto:admin@sayarty.store" style={{ color: '#2563eb', fontWeight: 'bold' }}>
            admin@sayarty.store
          </a>
        </p>

        <div style={{ marginTop: '30px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')} - موقع سيارتي ستور الرسمي
        </div>

      </div>
    </div>
  );
}
