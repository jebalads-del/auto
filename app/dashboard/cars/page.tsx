// أضف هذا الزر المميز والذكي بداخل كود الأزرار في الجدول للأدمن:
<button 
  onClick={async () => {
    const confirmMsg = car.is_featured ? 'هل تريد إلغاء تمييز هذا الإعلان وعودته عادياً؟' : 'هل استلمت 10 د.ك وتريد تمييز هذا الإعلان وعرضه بالأعلى؟';
    if (!confirm(confirmMsg)) return;
    
    const response = await fetch('/api/cars', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: car.id, is_featured: !car.is_featured })
    });
    const data = await response.json();
    if (data.success) {
      alert(car.is_featured ? 'تم إلغاء التميز بنجاح' : '👑 مبروك! تم تمييز الإعلان بنجاح وصعد للأعلى!');
      window.location.reload();
    }
  }} 
  style={{ padding: '8px 16px', backgroundColor: car.is_featured ? '#6b7280' : '#f59e0b', color: car.is_featured ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
>
  {car.is_featured ? '❌ إلغاء التميز' : '👑 اجعله مميز (استلمت 10 د.ك)'}
</button>

