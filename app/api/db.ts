import { neon } from '@neondatabase/serverless';

// الاتصال المباشر عبر السيرفر بـ Neon
const sql = neon(process.env.DATABASE_URL!);

export default sql;
