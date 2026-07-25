/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    domains: ['sayarty.store'],
  },
  // ✅ منع إعادة التوجيه التلقائي
  trailingSlash: false,
  // ✅ إزالة أي redirects غير مرغوب فيها
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
