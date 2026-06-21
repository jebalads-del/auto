import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCars() {
      try {
        const { data, error } = await supabase.from('cars').select('*');
        if (error) throw error;
        setCars(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  if (loading) return <div>جاري تحميل السيارات...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h1>عدد السيارات: {cars.length}</h1>
      {cars.map(car => (
        <div key={car.id}>
          <h3>{car.brand} {car.model}</h3>
          <p>{car.price} {car.currency}</p>
        </div>
      ))}
    </div>
  );
}
