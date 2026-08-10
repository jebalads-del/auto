import { neon } from '@neondatabase/serverless';
import DashboardClient from './DashboardClient';
import Cookies from 'js-cookie';

export const revalidate = 0; // إلغاء كاش السيرفر تماماً

export default async function DashboardPage() {
  const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
  
  let initialUsers: any[] = [];
  let initialCars: any[] = [];

  try {
    // 1. جلب المستخدمين الحقيقيين من Neon
    initialUsers = await sql`SELECT * FROM users ORDER BY id DESC`.catch(() => []);
    
    // 2. جلب السيارات الحقيقية من Neon
    initialCars = await sql`SELECT * FROM cars ORDER BY id DESC`.catch(() => []);
  } catch (e) {
    console.error("Database fetch error:", e);
  }

  // تشغيل المكون المطور وتمرير البيانات الحية إليه لتختفي الأصفار
  return (
    <DashboardClient 
      initialUsers={initialUsers} 
      initialCars={initialCars} 
    />
  );
}
