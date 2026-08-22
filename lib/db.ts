import postgres from 'postgres';

let sqlInstance: any = null;

export function getSql() {
  if (sqlInstance) return sqlInstance;
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  console.log('✅ Connecting to Supabase...');
  sqlInstance = postgres(connectionString, { 
    ssl: 'require',
    idle_timeout: 20,
    max_lifetime: 60 * 5,
  });
  
  return sqlInstance;
}

// للتوافق مع الكود القديم
const sql = getSql();
export default sql;
