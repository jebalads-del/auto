'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      alert('حدث خطأ أثناء تسجيل الدخول بجوجل');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '12px',
        backgroundColor: '#ffffff',
        color: '#333',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        marginBottom: '15px'
      }}
    >
      {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بواسطة Google'}
    </button>
  );
}
