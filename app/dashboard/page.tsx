'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'create_ad' | 'payment'>('ads')

  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [paypalEmail, setPaypalEmail] = useState('jebal.payments@gmail.com')
  const [westernName, setWesternName] = useState('Jebal Ads Company')
  const [westernCountry, setWesternCountry] = useState('Yemen')

  const fetchAds = () => {
    setLoading(true)
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return alert('Error: Title and Price are required')
    setFormLoading(true)

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, price: Number(newPrice), description: newDesc })
      })
      const result = await res.json()
      if (result.success) {
        alert('Success!')
        setNewTitle('')
        setNewPrice('')
        setNewDesc('')
        fetchAds()
        setActiveTab('ads')
      } else {
        alert('Failed')
      }
    } catch (err) {
      console.error(err)
      alert('Network Error')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8', fontSize: '20px' }}>Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            Ads ({ads.length})
          </button>
          <button onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            + Create Ad
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => setActiveTab('payment')} style={{ padding: '10px', backgroundColor: activeTab === 'payment' ? '#f59e0b' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            Payments
          </button>
          <Link href="/" style={{ padding: '10px', textAlign: 'center', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
            Exit
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {activeTab === 'ads' && (
          <div>
            <h3 style={{ color: '#334155', margin: '0 0 15px 0' }}>Manage Ads</h3>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
            ) : ads.length === 0 ? (
              <div>
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No ads available.</p>
                <button onClick={() => setActiveTab('create_ad')} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Create First Ad</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#334155', fontWeight: 'bold' }}>{ad.title}</div>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}>{ad.price} $</div>
                    </div>
                    <button onClick={() => router.push(`/dashboard/edit/${ad.id}`)} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>Edit</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create_ad' && (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#334155', margin: 0 }}>Create New Ad</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Title:</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Price ($):</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Description:</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}></textarea>
            </div>
            <button type="submit" disabled={formLoading} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', opacity: formLoading ? 0.7 : 1 }}>
              {formLoading ? 'Saving...' : 'Publish Ad 🚀'}
            </button>
          </form>
        )}

        {activeTab === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#334155', margin: 0 }}>Payment Gateways</h3>
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#003087' }}>PayPal</h4>
              <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ffb300' }}>Western Union</h4>
              <input type="text" value={westernName} onChange={(e) => setWesternName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }} />
              <input type="text" value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => alert('Saved!')} style={{ padding: '12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', width: '100%' }}>
              Save Settings
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
