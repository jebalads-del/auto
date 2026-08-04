/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  },
  // تعطيل SWC تماماً واستخدام Babel
  webpack: (config, { isServer }) => {
    // إضافة دعم Babel
    return config;
  }
}

module.exports = nextConfig
