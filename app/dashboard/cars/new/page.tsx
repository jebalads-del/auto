const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    if (!formData.brand || !formData.model || !formData.price) {
      setError('الماركة، الموديل، والسعر مطلوبة');
      setLoading(false);
      return;
    }

    // ✅ جلب userId من localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber) || userIdNumber === 0) {
      setError('معرف المستخدم غير صالح، يرجى تسجيل الدخول مرة أخرى');
      setLoading(false);
      return;
    }

    // تحويل الصور إلى Base64
    const imageBase64 = await Promise.all(
      images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    const payload = {
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year.toString()) || null,
      price: parseFloat(formData.price),
      kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
      color: formData.color || null,
      description: formData.description || null,
      images: imageBase64,
      user_id: userIdNumber, // ✅ userId صحيح
      payment_method: formData.payment_method || 'western_union',
      is_featured: isPaid,
      featured_price: isPaid ? parseFloat(formData.price) * 0.1 : null,
      currency: 'USD',
    };

    console.log('📤 جاري إرسال:', payload);

    const response = await fetch('/api/admin/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSuccess('✅ تم إرسال الإعلان للمراجعة بنجاح!');
      setTimeout(() => {
        router.push('/dashboard/cars');
      }, 2000);
    } else {
      setError(data.message || 'حدث خطأ أثناء نشر الإعلان');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    setError('خطأ في الاتصال بالخادم');
  } finally {
    setLoading(false);
  }
};
