import sql from './app/api/db.js';

async function checkTable() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    console.log("=== بنية وأسماء حقول جدول المستخدمين الحالية ===");
    console.log(JSON.stringify(columns, null, 2));
  } catch (error: any) {
    console.error("خطأ أثناء فحص قاعدة البيانات:", error.message);
  }
}
checkTable();
