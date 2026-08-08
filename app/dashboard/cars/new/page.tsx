
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السنة</label>
          <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={styIn}>
            {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السعر *</label>
          <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styIn} placeholder="السعر" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>💰 العملة</label>
          <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={styIn}>
            {currencies.map(curr => <option key={curr.code} value={curr.code}>{curr.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الكيلومترات</label>
          <input type="number" min="0" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={styIn} placeholder="المسافة" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اللون</label>
          <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={styIn}>
            <option value="">اختر اللون</option>
            {colors.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px', border: '1px dashed #f59e0b', padding: '12px', borderRadius: '8px' }}>
          <input type="checkbox" id="paid-ad" checked={isPaid} onChange={(e) => { setIsPaid(e.target.checked); setImages([]); setImagePreview([]); }} />
          <label htmlFor="paid-ad" style={{ fontWeight: 'bold' }}>👑 إعلان مدفوع</label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📸 صور السيارة</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={styIn} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>وصف إضافي</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...styIn, height: '80px', resize: 'none' }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}>
          {loading ? 'جاري النشر...' : '🚙 نشر الإعلان'}
        </button>
      </form>
    </div>
  );
}
