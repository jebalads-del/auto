    const result = await sql`
      INSERT INTO commercial_ads (
        user_id, position, status, price, duration_days,
        start_date, end_date, image_url, link_url, payment_status
      ) VALUES (
        ${user_id}, ${position}, 'pending_payment', ${price}, ${durationDays},
        ${startDate}, ${endDate}, ${image || null}, ${link_url || null}, 'unpaid'
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الإعلان بنجاح، في انتظار الموافقة',
      ad: result[0],
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال طلب الإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إرسال الطلب' },
      { status: 500 }
    );
  }
}
