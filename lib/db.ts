import { createClient } from '@supabase/supabase-js';

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

// إنشاء عميل Supabase (بدون أنواع)
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export default supabase;

// تصدير الدالة المساعدة
export const getSupabase = () => supabase;
