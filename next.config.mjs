/** @type {import('next').NextConfig} */
const nextConfig = {
  // السماح لـ Next.js بقراءة وعرض صور السيرفر والـ Blob دون حظر الأمان
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
        port: '',
        pathname: '/**',
      }
    ],
    // حماية إضافية تضمن عدم انهيار الفلتر لو كانت الصيغة نصية بحتة
    unoptimized: true, 
  },
};

export default nextConfig;
