import { neon } from '@neondatabase/serverless';

// التحقق من كافة الروابط المحتملة المرفوعة على Vercel
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_A_SE_URL;

if (!connectionString) {
  console.error("خطأ حرج: لم يتم العثور على أي رابط اتصال بقاعدة البيانات في البيئة الخارجية!");
}

const sql = neon(connectionString!);

export default sql;

