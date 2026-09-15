  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // التحقق من وجود userId
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      // التحقق من صحة userId (UUID)
      if (!userId.includes('-') || userId.length < 10) {
        setError('معرف المستخدم غير صحيح');
        setLoading(false);
        return;
      }

      if (!formData.brand || !formData.model || !formData.price) {
        setError('الماركة، الموديل، والسعر مطلوبة');
        setLoading(false);
        return;
      }

      console.log('📤 Publishing car with userId:', userId);

      // 1. إنشاء الإعلان
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year.toString()) || null,
        price: parseFloat(formData.price),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
        color: formData.color || null,
        description: formData.description || null,
        images: [],
        user_id: userId,
        currency: formData.currency || 'KWD',
        status: 'pending',
      };

      console.log('📦 Payload:', payload);

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'فشل نشر الإعلان');
        setLoading(false);
        return;
      }

      const carId = data.data?.[0]?.id || data.id;
      console.log('✅ Car created with ID:', carId);

      // 2. رفع الصور إلى Supabase Storage
      if (images.length > 0 && carId) {
        try {
          const uploadedUrls = [];

          for (const file of images) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${carId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            console.log('📤 جاري رفع الصورة:', fileName);

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('car-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
              });

            if (uploadError) {
              console.error('❌ فشل رفع الصورة:', uploadError);
              continue;
            }

            console.log('✅ تم رفع الصورة:', uploadData);

            const { data: urlData } = supabase.storage
              .from('car-images')
              .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
              uploadedUrls.push(urlData.publicUrl);
              console.log('🔗 رابط الصورة:', urlData.publicUrl);
            }
          }

          // 3. تحديث الإعلان بروابط الصور
          if (uploadedUrls.length > 0) {
            const { error: updateError } = await supabase
              .from('cars')
              .update({ images: uploadedUrls })
              .eq('id', carId);

            if (updateError) {
              console.error('❌ فشل تحديث الصور:', updateError);
              setSuccess('⚠️ تم نشر الإعلان لكن فشل حفظ الصور');
            } else {
              setSuccess(`✅ تم نشر الإعلان مع ${uploadedUrls.length} صور!`);
            }
          } else {
            setSuccess('⚠️ تم نشر الإعلان لكن فشل رفع الصور');
          }
        } catch (error) {
          console.error('❌ خطأ في رفع الصور:', error);
          setSuccess('⚠️ تم نشر الإعلان لكن حدث خطأ في رفع الصور');
        }
      } else {
        setSuccess('✅ تم نشر الإعلان بنجاح!');
      }

      // ✅ إعادة تعيين النموذج
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        kilometers: '',
        color: '',
        description: '',
        currency: 'KWD',
      });
      setImages([]);
      setImagePreviews([]);

      // ✅ بدلاً من router.push، ابقَ في نفس الصفحة
      // ✅ فقط ارفع الصفحة للأعلى واخفِ الرسالة بعد 3 ثوان
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      setError('حدث خطأ غير متوقع');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };
