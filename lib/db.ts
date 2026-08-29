import { createClient } from '@supabase/supabase-js';

// حقن مباشر وصارم لأقوى مفاتيح مشروعك لتجاوز مشاكل ومتاهات خوادم Vercel
const supabaseUrl = 'https://supabase.co'; // الرابط الحقيقي المستخرج من شاشتك الحية
const supabaseAnonKey = 'ضع_هنا_مفتاح_ال_Anon_Key_الرسمي_الخاص_بمشروعك_من_سوبابيس'; // ⚠️ ضع المفتاح الحقيقي الطويل هنا

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;

export const getSupabase = () => supabase;
