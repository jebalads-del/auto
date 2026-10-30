const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (authError || !authData?.user) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      localStorage.setItem('userId', authData.user.id);

      // 🔍 جلب بيانات الحساب من جدول profiles وعمود account_type
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, role')
        .eq('id', authData.user.id)
        .single();

      // 🛑 حارس التوجيه: إذا لم يكن قد حدد نوع حسابه بعد (account_type غير موجود)
      if (!profile || !profile.account_type) {
        router.push('/select-role');
      } else if (profile.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (profile.account_type === 'dealer') {
        router.push('/dashboard/dealer');
      } else {
        router.push('/profile');
      }

      router.refresh();

    } catch (err: any) {
      setError('حدث خطأ أثناء الاتصال');
      setLoading(false);
    }
  };
