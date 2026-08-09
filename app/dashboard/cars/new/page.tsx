  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.brand || !formData.model || !formData.price) {
        setError('يرجى ملء الحقول الأساسية الإجبارية');
        setLoading(false);
        return;
      }

      // تجهيز البيانات النصية للإعلان لرفعها للمرحلة الأولى
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        kilometers: formData.kilometers,
        color: formData.color,
        description: formData.description,
        user_id: localStorage.getItem('userId') || localStorage.getItem('user_id') || '1',
        payment_method: 'cash',
        is_featured: false
      };

      // 1. نشر الإعلان النصي أولاً
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // تأمين قراءة وفك تشفير الـ JSON بشكل مباشر وصارم لمنع تعليق المعرّف
      const data = await response.json().catch(() => null);

      if (!data || !data.success) {
        setError(data?.message || 'فشل سيرفر قاعدة البيانات في نشر تفاصيل الإعلان النصية');
        setLoading(false);
        return;
      }

      // استخراج معرّف السيارة النقي الذي يعيده السيرفر حالياً
      const carId = data.id || data.carId || (data.data && data.data.id);
      
      if (!carId) {
        setError('تم نشر الإعلان لكن فشل العثور على معرف السيارة الداخلي بالسيرفر');
        setLoading(false);
        return;
      }

      // ============================================================
      // 2. رفع الصور الحقيقية إلى Vercel Blob
      // ============================================================
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        try {
          imageUrls = await uploadImagesToBlob(images, Number(carId));
        } catch (uploadError: any) {
          setError(`تم نشر الإعلان النصي بنجاح، لكن فشل رفع الملفات لـ Blob: ${uploadError.message}`);
          setUploadingImages(false);
          setLoading(false);
          return;
        }
        setUploadingImages(false);
      }

      // ============================================================
      // 3. تحديث الإعلان بروابط الصور النقية فوراً (المرحلة الثالثة والأخيرة)
      // ============================================================
      if (imageUrls.length > 0) {
        // نأخذ رابط الصورة الأول النظيف ونرسله للسيرفر الخلفي
        const finalImgUrl = imageUrls[0];
        
        const updateResponse = await fetch('/api/cars', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(carId), status: 'pending', images: finalImgUrl })
        });
        
        const updateData = await updateResponse.json().catch(() => null);
        if (!updateData || !updateData.success) {
          console.warn("Warning: Temporary failure mapping links on PUT runtime");
        }
      }

      setSuccess('🎉 مبروك! تم نشر إعلان سيارتك بنجاح، وهو الآن بانتظار موافقة الأدمن لتفعيله علناً للزوار!');
      // إعادة تعيين النموذج بعد النجاح الكامل
      setFormData({ brand: '', model: '', year: '', price: '', kilometers: '', color: '', description: '' });
      setImages([]);

    } catch (globalError: any) {
      setError(`حدث خطأ غير متوقع أثناء معالجة الإعلان: ${globalError.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <Link href="/dashboard" style={{ display: 'inline-block', marginBottom: '15px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>← العودة للوحة التحكم</Link>
        <h1 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>➕ إضافة إعلان سيارة جديدة</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>❌ {error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>✅ {success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الماركة *</label>
            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: تويوتا" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الموديل *</label>
            <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: كامري" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>السعر * (د.ك)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: 4500" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>سنة الصنع</label>
              <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: 2022" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الممشى (كم)</label>
              <input type="number" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: 50000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>اللون</label>
              <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="مثال: أبيض" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>وصف الإعلان</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', height: '80px', resize: 'none' }} placeholder="اكتب تفاصيل إضافية وطريقة التواصل..."></textarea>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>تحميل صورة السيارة</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setImages([e.target.files[0]]); }} style={{ fontSize: '12px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? (uploadingImages ? '⏳ جاري رفع الصورة الحية لـ Blob...' : '⏳ جاري نشر تفاصيل الإعلان النصية...') : '🚀 انشر الإعلان الآن'}
          </button>
        </form>
      </div>
    </div>
  );
}
