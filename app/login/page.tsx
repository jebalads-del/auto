'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // محاكاة طلب تسجيل الدخول
      if (email && password) {
        console.log('تسجيل دخول:', { email, password })
        // سيتم إضافة Logic التسجيل الحقيقي لاحقاً
        alert('تم تسجيل الدخول بنجاح!')
        setEmail('')
        setPassword('')
      } else {
        setError('الرجاء ملء جميع الحقول')
      }
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: '#0070f3', fontWeight: 'bold' }}>← العودة للمنزل</Link>
      </header>

      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>تسجيل الدخول</h1>
        
        {error && (
          <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '5px', color: '#c33', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>البريد الإلكتروني:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
              placeholder="example@email.com"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>كلمة المرور:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#0070f3', 
              color: 'white',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'جاري التسجيل...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}