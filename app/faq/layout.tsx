import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description: 'إجابات على الأسئلة الشائعة حول التسجيل، ونشر إعلانات السيارات، والتواصل مع البائعين في منصة سيارتي ستور.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
