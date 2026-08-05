import React from 'react';
import { neon } from '@neondatabase/serverless';
import DashboardClient from './DashboardClient';

// إجبار الصفحة على العمل بشكل ديناميكي حي لقراءة الداتابيز دائماً
export const dynamic = 'force-dynamic';

async function getNeonData() {
  const databaseUrl = process.env.DATABASE_URL || "";
  if (!databaseUrl) return { realUsers: [], realCars: [] };

  try {
    const sql = neon(databaseUrl);
    
    // جلب المستخدمين بشكل مؤكد
    const usersData = await sql`SELECT * FROM users ORDER BY id DESC LIMIT 100`;
    
    // جلب السيارات مع حماية برمجية في حال كان اسم الجدول مختلفاً
    let carsData: any[] = [];
    try {
      carsData = await sql`SELECT * FROM cars ORDER BY id DESC LIMIT 50`;
    } catch (e) {
      console.log("جدول cars غير موجود أو يحمل اسماً آخر، تم تصفيره لحماية البناء");
    }

    return { 
      realUsers: JSON.parse(JSON.stringify(usersData || [])), 
      realCars: JSON.parse(JSON.stringify(carsData || [])) 
    };
  } catch (error) {
    console.error("Neon DB Fetch Error:", error);
    return { realUsers: [], realCars: [] };
  }
}

export default async function DashboardPage() {
  const { realUsers, realCars } = await getNeonData();

  return (
    <DashboardClient 
      initialUsers={realUsers} 
      initialCars={realCars} 
    />
  );
}
