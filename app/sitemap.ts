import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const URL = 'https://sayarty.store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: cars, error } = await supabase
    .from('cars')
    .select('id, updated_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ خطأ في جلب السيارات للـ Sitemap:', error);
    return [];
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const carPages: MetadataRoute.Sitemap = cars?.map((car) => ({
    url: `${URL}/car/${car.id}`,
    lastModified: new Date(car.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  return [...staticPages, ...carPages];
}
