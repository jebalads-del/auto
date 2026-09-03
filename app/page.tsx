{!loading && (
  <>
    {cars.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
        <p style={{ fontSize: '18px', color: '#64748b' }}>📭 لا توجد إعلانات متاحة حالياً</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {cars.map((car) => {
          const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
          
          return (
            <div key={car.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              
              {firstImage ? (
                <div style={{ marginBottom: '10px' }}>
                  <img 
                    src={firstImage} 
                    alt={`${car.brand} ${car.model}`}
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '150px', 
                  backgroundColor: '#e2e8f0', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}>
                  🚗
                </div>
              )}

              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '3px' }}>
                {car.brand} {car.model}
              </div>
              <div style={{ color: '#16a34a', fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                {car.price} {car.currency || 'د.ك'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {car.year && <span>📅 {car.year}</span>}
                {car.kilometers && <span style={{ marginRight: '8px' }}>📊 {car.kilometers.toLocaleString()} كم</span>}
                {car.color && <span style={{ marginRight: '8px' }}>🎨 {car.color}</span>}
              </div>
              <Link href={`/car/${car.id}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  🔍 تفاصيل
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    )}
  </>
)}
