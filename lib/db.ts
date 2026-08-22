import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// قراءة متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// التحقق من وجود المتغيرات
if (!supabaseUrl) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseKey) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

// إنشاء عميل Supabase مع أنواع TypeScript
const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export default supabase;

// تصدير الدالة المساعدة
export const getSupabase = (): SupabaseClient<Database> => supabase;
