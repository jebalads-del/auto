import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سيارتي - Auto App',
  description: 'منصة الإعلانات المتقدمة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
