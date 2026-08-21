/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
  images: {
    domains: [
      'sayarty.store',
      'vercel-storage.com',
      '**.vercel-storage.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sayarty.store',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
