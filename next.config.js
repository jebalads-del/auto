/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
  images: {
    domains: ['sayarty.store'],
  },
}

module.exports = nextConfig
