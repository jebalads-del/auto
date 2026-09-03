                      )}

                      {/* 2. بيانات السيارة الأساسية بتصميم مريح وبسيط */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {car.brand} {car.model}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                          {car.year && <span>📅 {car.year}</span>}
                          {car.kilometers && <span>• 📊 {car.kilometers.toLocaleString()} كم</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>
                            {car.price} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span>
                          </span>
                        </div>
                      </div>

                      {/* 3. زر التفاصيل السفلي الأنيق لزيادة الجمال البصري */}
                      <div style={{ padding: '0 12px 12px 12px' }}>
                        <button style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          تفاصيل الإعلان 👀
                        </button>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* الـ Footer */}
      <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px 0', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0' }}>
        © 2026 سيارتي ستور - جميع الحقوق محفوظة
      </div>
    </div>
  );
}
