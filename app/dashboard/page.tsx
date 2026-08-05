import React from 'react';
import { neon } from '@neondatabase/serverless';
import DashboardClient from './DashboardClient';

async function getNeonData() {
  const databaseUrl = process.env.DATABASE_URL || "";
  if (!databaseUrl) return { realUsers: [], realCars: [] };

  try {
    const sql = neon(databaseUrl);
    // استعلامات حقيقية وآمنة على السيرفر
    const usersData = await sql`SELECT * FROM users ORDER BY id DESC`;
    const carsData = await sql`SELECT * FROM cars ORDER BY id DESC`;
    return { realUsers: usersData || [], realCars: carsData || [] };
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
