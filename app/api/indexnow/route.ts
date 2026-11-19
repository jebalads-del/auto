import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { carId } = await request.json();

    if (!carId) {
      return NextResponse.json({ error: 'رقم الإعلان مطلوب' }, { status: 400 });
    }

    const apiKey = '78468cd12155457c9fd4034d818ceb01';
    const host = 'sayarty.store';
    const urlToSubmit = `https://${host}/car/${carId}`;

    const response = await fetch('https://indexnow.org', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: host,
        key: apiKey,
        keyLocation: `https://${host}/${apiKey}.txt`,
        urlList: [urlToSubmit],
      }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'تم إرسال الرابط إلى IndexNow بنجاح' });
    } else {
      return NextResponse.json({ error: 'فشل الإرسال إلى IndexNow' }, { status: response.status });
    }
  } catch {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
