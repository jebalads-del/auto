// حل مؤقت للتأكد من وجود المتغيرات
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://uhtjnfeohafpnwcacssk.supabase.co';
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_Js69Lv_DD1bhV1Q...';
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:398990099Asd@db.uhtjnfeohafpnwcacssk.supabase.co:5432/postgres';
}

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

// الاتصال المباشر والمستقر بمحرك قاعدة بيانات Supabase الجديدة لإنهاء الأعطال
const sql = postgres(connectionString, { ssl: 'require' });

export default sql;
