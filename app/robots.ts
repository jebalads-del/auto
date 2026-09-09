import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/profile/',
        '/admin/',
        '/api/',
        '/login/',
        '/register/',
        '/forgot-password/',
        '/dashboard/*',
        '/profile/*',
        '/admin/*',
        '/api/*',
      ],
    },
    sitemap: 'https://sayarty.store/sitemap.xml',
  };
}
