import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | سيارتي - سوق السيارات في الكويت',
    default: 'سيارتي - سوق السيارات في الكويت',
  },
  description: 'أكبر منصة لبيع وشراء السيارات في الكويت. تصفح آلاف الإعلانات للسيارات الجديدة والمستعملة.',
  keywords: ['سيارات', 'بيع سيارات', 'شراء سيارات', 'سوق السيارات', 'الكويت', 'سيارتي'],
  authors: [{ name: 'سيارتي' }],
  creator: 'سيارتي',
  publisher: 'سيارتي',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_KW',
    url: 'https://sayarty.store',
    siteName: 'سيارتي',
    title: 'سيارتي - سوق السيارات في الكويت',
    description: 'أكبر منصة لبيع وشراء السيارات في الكويت.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'سيارتي - سوق السيارات في الكويت',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سيارتي - سوق السيارات في الكويت',
    description: 'أكبر منصة لبيع وشراء السيارات في الكويت.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://sayarty.store',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
