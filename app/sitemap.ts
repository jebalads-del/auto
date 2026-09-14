import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sayarty.store';

  // تأسيس اتصال سريع مع السوبابيز لجلب السيارات النشطة
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let carUrls: any[] = [];
  try {
    const { data: cars } = await supabase
      .from('cars')
      .select('id, updated_at')
      .eq('status', 'approved');

    if (cars) {
      carUrls = cars.map((car) => ({
        url: `${baseUrl}/car/${car.id}`,
        lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error('Sitemap fetch error:', err);
  }
  // الروابط الثابتة والأساسية لمنصتك الفاخرة
  const mainUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...mainUrls, ...carUrls];
}
