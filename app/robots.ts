import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/register',
        '/profile',
        '/verify',
        '/reset-password',
        '/select-role',
        '/payment/',
      ],
    },
    sitemap: 'https://sayarty.store',
  };
}
