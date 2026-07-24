import Link from 'next/link';

// داخل عرض السيارة (حلقة cars.map):
<Link href={`/car/${car.id}`} style={{ textDecoration: 'none' }}>
  <div
    key={car.id}
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.transform = 'scale(1.02)')
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.transform = 'scale(1)')
    }
  >
    {/* الصور والعنوان والمعلومات */}
  </div>
</Link>
