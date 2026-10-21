import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sayarty.store'),
  title: {
    template: '%s | سيارتي ستور - سوق السيارات في الكويت',
    default: 'سيارتي ستور - سوق السيارات في الكويت',
  },
  description: 'منصة سيارتي ستور لبيع وشراء السيارات في الكويت. تصفح آلاف الإعلانات للسيارات الجديدة والمستعملة بأفضل الأسعار. اعرض سيارتك للبيع مجاناً.',
  keywords: [
    'سيارات', 
    'بيع سيارات', 
    'شراء سيارات', 
    'سيارات مستعملة', 
    'سيارات جديدة',
    'ابحث عن سيارة', 
    'اعرض سيارتك للبيع مجانا', 
    'سوق السيارات', 
    'الكويت', 
    'سيارتي ستور',
    'سيارات للبيع في الكويت',
    'حراج السيارات'
  ],
  authors: [{ name: 'سيارتي ستور', url: 'https://sayarty.store' }],
  creator: 'سيارتي ستور',
  publisher: 'سيارتي ستور',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    siteName: 'سيارتي ستور',
    title: 'سيارتي ستور - سوق السيارات في الكويت',
    description: 'أكبر منصة لبيع وشراء السيارات في الكويت. تصفح آلاف الإعلانات.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'سيارتي ستور - سوق السيارات في الكويت',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سيارتي ستور - سوق السيارات في الكويت',
    description: 'أكبر منصة لبيع وشراء السيارات في الكويت.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'msvalidate.01': '20453F668171330FD1289C4BB0281491', // ✅ كود التحقق من Bing
    },
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
  // ✅ البيانات المنظمة للموقع (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://sayarty.store/#website',
        url: 'https://sayarty.store',
        name: 'سيارتي ستور',
        description: 'سوق السيارات في الكويت',
        inLanguage: 'ar',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://sayarty.store/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://sayarty.store/#organization',
        name: 'سيارتي ستور',
        url: 'https://sayarty.store',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sayarty.store/logo2.jpg',
          width: 512,
          height: 512,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'admin@sayarty.store',
          contactType: 'customer service',
          availableLanguage: ['Arabic'],
        },
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://uhtjnfeohafpnwcacssk.supabase.co" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin: 0, padding: 0, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        {children}
        {/* ✅ إضافة البيانات المنظمة */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') 
          }}
        />
      </body>
    </html>
  );
}
