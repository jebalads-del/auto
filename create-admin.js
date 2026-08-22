const postgres = require('postgres');

// تعديل صياغة اسم المستخدم ليتطابق مع متطلبات Supabase Pooler الصارمة
const sql = postgres({
  host: '://supabase.com',
  port: 5432,
  database: 'postgres',
  username: 'postgres.uhtjnfeoafpnwcacssk', // الصيغة القياسية الأولى
  password: '39899099Asd',
  ssl: 'require',
  connect_timeout: 15
});

async function run() {
  try {
    console.log("⏳ جاري محاولة الاتصال وزرع حساب الأدمن...");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`;
    } catch(e) {}

    await sql`
      INSERT INTO users (email, password, role)
      VALUES ('admin@sayarty.store', '123456', 'admin')
      ON CONFLICT (email) 
      DO UPDATE SET role = 'admin', password = '123456'
    `;

    console.log("✅ مبروك يا بطل! تم الاتصال بنجاح وزرع حساب الأدمن!");
    process.exit(0);
  } catch (error) {
    console.error("❌ فشل الحقن الحالي، جاري محاولة الصيغة البديلة لاسم المستخدم...");
    
    // محاولة الاتصال بالصيغة البديلة لاسم المستخدم (تنتهي بـ .postgres) في حال فشل الأولى
    try {
      const sql2 = postgres({
        host: '://supabase.com',
        port: 5432,
        database: 'postgres',
        username: 'uhtjnfeoafpnwcacssk.postgres', // الصيغة البديلة المعتمدة لبعض خوادم supavisor
        password: '39899099Asd',
        ssl: 'require',
        connect_timeout: 15
      });

      await sql2`
        INSERT INTO users (email, password, role)
        VALUES ('admin@sayarty.store', '123456', 'admin')
        ON CONFLICT (email) DO UPDATE SET role = 'admin', password = '123456'
      `;
      console.log("✅ مبروك يا بطل! نجح الاتصال بالصيغة البديلة وتم زرع حساب الأدمن!");
      process.exit(0);
    } catch (err2) {
      console.error("❌ فشل الحقن بالصيغتين، السبب المباشر هو:", err2.message);
      process.exit(1);
    }
  }
}

run();
