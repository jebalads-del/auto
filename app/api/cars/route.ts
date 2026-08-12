export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model, year, price, kilometers, color, description, currency, images } = body;

    // معالجة ذكية لحقل الصور للتأكد من حفظه بصيغة نصية متوافقة وصحيحة داخل Neon PostgreSQL
    let imagesToSave = '';
    if (images) {
      if (Array.isArray(images)) {
        imagesToSave = images.join(',');
      } else if (typeof images === 'string') {
        imagesToSave = images.trim();
      }
    }

    // إدخال البيانات حية داخل قاعدة بياناتك (تأكد من مطابقة أسماء الأعمدة لجدولك)
    const newCar = await sql`
      INSERT INTO cars (brand, model, year, price, kilometers, color, description, currency, images, status)
      VALUES (${brand || ''}, ${model || ''}, ${parseInt(year) || 0}, ${parseFloat(price) || 0}, ${parseInt(kilometers) || 0}, ${color || ''}, ${description || ''}, ${currency || 'KWD'}, ${imagesToSave}, 'pending')
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعلان بنجاح في قاعدة البيانات وينتظر مراجعة الأدمن',
      carId: newCar[0]?.id || newCar[0]?.ID
    });

  } catch (error) {
    console.error('خطأ أثناء حفظ الإعلان الجديد:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في السيرفر أثناء معالجة وحفظ البيانات' },
      { status: 500 }
    );
  }
}
