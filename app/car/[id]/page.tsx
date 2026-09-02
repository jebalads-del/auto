{/* معلومات البائع */}
<div style={styles.sellerSection}>
  <h3 style={styles.sectionTitle}>👤 معلومات البائع</h3>
  <div style={styles.sellerInfo}>
    <span style={styles.sellerName}>{sellerName}</span>
    {sellerEmail && <span style={styles.sellerEmail}>📧 {sellerEmail}</span>}
    {sellerPhone && (
      <span style={styles.sellerPhoneHidden}>
        📞 رقم الهاتف متاح عبر أزرار التواصل أدناه
      </span>
    )}
  </div>
</div>
