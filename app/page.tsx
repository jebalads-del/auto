  const getFirstImage = (imgData: any): string | null => {
    if (!imgData) return null;
    if (Array.isArray(imgData) && imgData.length > 0) {
      return typeof imgData[0] === 'string' ? imgData[0] : null;
    }
    if (typeof imgData === 'string') {
      const clean = imgData.trim();
      if (clean.startsWith('[') && clean.endsWith(']')) {
        try {
          const parsed = JSON.parse(clean);
          return parsed.length > 0 ? parsed[0] : null;
        } catch { return null; }
      }
      if (clean.startsWith('http')) return clean;
      const splitArr = clean.split(',').map(s => s.trim()).filter(Boolean);
      return splitArr.length > 0 ? splitArr[0] : null;
    }
    return null;
  };
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.description && car.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesYear = filterYear ? car.year?.toString() === filterYear : true;
    const matchesColor = filterColor ? car.color === filterColor : true;

    return matchesSearch && matchesYear && matchesColor;
  });
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* تكبير حجم صورة اللوجو / البانر بشكل ملحوظ ومنسق */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo2.jpg" alt="سيارتي ستور" style={{ height: '55px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* زر البريد الإلكتروني الدائري للدعم الفني متوافق مع الهاتف */}
          <a 
            href="mailto:admin@sayarty.store?subject=إستفسار بخصوص موقع سيارتي&body=مرحباً إدارة موقع سيارتي،" 
            title="الدعم الفني"
            style={{ 
              textDecoration: 'none',
              backgroundColor: '#475569',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
          >
            ✉️
          </a>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '36px'
            }}>
              <span>➕</span> أعلن مجاناً
            </button>
          </Link>
          
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '34px'
            }}>
              <span>🔑</span> دخول
            </button>
          </Link>
        </div>
      </header>
