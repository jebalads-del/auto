import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: car } = await supabase
      .from('cars')
      .select('brand, model, year, price, currency, description, images')
      .eq('id', id)
      .single();

    if (!car) {
      return {
        title: 'تفاصيل السيارة',
        alternates: { canonical: `/car/${id}` },
      };
    }

    const carTitle = `${car.brand} ${car.model} ${car.year || ''} للبيع في الكويت`.trim();
    const carPrice = car.price ? ` - السعر ${car.price} ${car.currency || 'د.ك'}` : '';
    const fullTitle = `${carTitle}${carPrice}`;
    const carDescription =
      car.description?.slice(0, 155) ||
      `شاهد تفاصيل وصور سيارة ${carTitle}${carPrice} على منصة سيارتي ستور في الكويت.`;

    // استخراج أول صورة للسيارة لعرضها عند مشاركة الرابط في واتساب وتويتر ومحركات البحث
    let mainImage = '/logo.png';
    if (car.images) {
      if (Array.isArray(car.images) && car.images.length > 0) {
        mainImage = car.images[0];
      } else if (typeof car.images === 'string') {
        const cleanStr = car.images.trim();
        if (cleanStr.startsWith('[') && cleanStr.endsWith(']')) {
          try {
            const parsed = JSON.parse(cleanStr);
            if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
          } catch {}
        } else if (cleanStr.startsWith('http')) {
          mainImage = cleanStr.split(',')[0].trim();
        }
      }
    }

    return {
      title: fullTitle,
      description: carDescription,
      alternates: {
        canonical: `/car/${id}`,
      },
      openGraph: {
        title: fullTitle,
        description: carDescription,
        url: `https://sayarty.store{id}`,
        images: [
          {
            url: mainImage,
            alt: carTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: carDescription,
        images: [mainImage],
      },
    };
  } catch {
    return {
      title: 'تفاصيل السيارة',
      alternates: { canonical: `/car/${id}` },
    };
  }
}

export default function CarDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
