import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('cars').select('*').then(({ data }) => {
      setCars(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <h1>جاري التحميل...</h1>;

  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '20px' }}>
      <h1>معرض السيارات - sayarty.store</h1>
      {cars.map(car => (
        <div key={car.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{car.brand} {car.model}</h3>
          <p>{car.price} {car.currency}</p>
        </div>
      ))}
    </div>
  );
}
