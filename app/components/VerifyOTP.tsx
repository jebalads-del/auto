'use client'

import { useState } from 'react'

interface VerifyOTPProps {
  email: string
  onVerifySuccess: () => void
  onBack: () => void
}

export default function VerifyOTP({ email, onVerifySuccess, onBack }: VerifyOTPProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await res.json()

      if (res.ok) {
        onVerifySuccess()
      } else {
        setError(data.error || 'الكود غير صحيح')
      }
    } catch (err) {
      setError('خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerify}>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '15px' }}>
        الكود أُرسل إلى: <strong>{email}</strong>
      </p>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      <input
        type="text"
        placeholder="أدخل الكود (6 أرقام)"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        maxLength={6}
        required
        disabled={loading}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#93c5fd' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
      >
        {loading ? 'جاري التحقق...' : '✅ تحقق'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{ width: '100%', padding: '12px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        ← العودة
      </button>
    </form>
  )
}
