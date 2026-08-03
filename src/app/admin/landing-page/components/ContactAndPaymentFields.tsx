import React from "react";

export function ContactAndPaymentFields(props: any) {
  const {
    contactAddress, setContactAddress, contactPhone, setContactPhone, contactEmail, setContactEmail,
    paymentBankName, setPaymentBankName, paymentAccountNumber, setPaymentAccountNumber, paymentAccountName, setPaymentAccountName,
    paymentSppKids, setPaymentSppKids, paymentSppTeens, setPaymentSppTeens, paymentSppCalistung, setPaymentSppCalistung
  } = props;

  return (
    <>
      <div className="portal-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Informasi Kontak & Lokasi Lembaga</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label">Nomor WhatsApp Resmi (+62)</label>
            <input type="text" className="form-input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Alamat Email Resmi</label>
            <input type="email" className="form-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label className="form-label">Alamat Fisik Lengkap Gedung Kursus</label>
          <textarea className="form-input" rows={2} value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
        </div>
      </div>

      <div className="portal-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Pengaturan Rekening Pembayaran & SPP Bulanan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="form-label">Nama Bank / E-Wallet</label>
            <input type="text" className="form-input" value={paymentBankName} onChange={(e) => setPaymentBankName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Nomor Rekening / HP</label>
            <input type="text" className="form-input" value={paymentAccountNumber} onChange={(e) => setPaymentAccountNumber(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Nama Pemilik Rekening (A.N)</label>
            <input type="text" className="form-input" value={paymentAccountName} onChange={(e) => setPaymentAccountName(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="form-label">SPP Kids Program (Rp)</label>
            <input type="number" className="form-input" value={paymentSppKids} onChange={(e) => setPaymentSppKids(e.target.value)} />
          </div>
          <div>
            <label className="form-label">SPP Teens Program (Rp)</label>
            <input type="number" className="form-input" value={paymentSppTeens} onChange={(e) => setPaymentSppTeens(e.target.value)} />
          </div>
          <div>
            <label className="form-label">SPP Fun Calistung (Rp)</label>
            <input type="number" className="form-input" value={paymentSppCalistung} onChange={(e) => setPaymentSppCalistung(e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );
}
