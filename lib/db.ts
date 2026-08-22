import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';

// الاتصال المباشر والمستقر بمحرك قاعدة بيانات Supabase الجديدة لإنهاء الأعطال
const sql = postgres(connectionString, { ssl: 'require' });

export default sql;
