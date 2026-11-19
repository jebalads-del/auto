import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // تحديث الخريطة تلقائياً كل ساعة

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sayarty.store';

  // 1. الصفحات الثابتة الأساسية
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 2. جلب جميع إعلانات السيارات المقبولة من Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !cars) {
      return staticPages;
    }

    const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
      url: `${baseUrl}/car/${car.id}`,
      lastModified: car.created_at ? new Date(car.created_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    return [...staticPages, ...carPages];
  } catch {
    return staticPages;
  }
}
