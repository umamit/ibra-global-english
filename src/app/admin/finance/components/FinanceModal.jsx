"use client";

export default function FinanceModal({
  isModalOpen,
  modalStudent,
  selectedMonth,
  modalAmount,
  setModalAmount,
  modalStatus,
  setModalStatus,
  modalMethod,
  setModalMethod,
  modalReceiptUrl,
  setModalReceiptUrl,
  savingPayment,
  getMonthName,
  getStudentPayment,
  fileInputRef,
  handleUploadReceipt,
  handleSavePayment,
  handlePrintReceipt,
  onClose
}) {
  if (!isModalOpen || !modalStudent) return null;

  const payObj = {
    amount: modalAmount,
    month: selectedMonth,
    payment_method: modalMethod,
    payment_date: getStudentPayment(modalStudent.id, [], [], selectedMonth, {}).payment_date
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11, 15, 23, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        className="portal-modal"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "var(--shadow-2xl)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-gray-100)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--color-primary-light)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Pembayaran SPP</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>{modalStudent.name} ({modalStudent.program})</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--color-gray-500)", cursor: "pointer" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSavePayment} style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* Periode Tagihan */}
            <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
              <div>
                <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Bulan Tagihan</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem", background: "var(--color-gray-50)", opacity: 0.8 }}
                  value={getMonthName(selectedMonth)}
                  disabled
                />
              </div>
              <div>
                <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Nominal Pembayaran (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Metode Pembayaran & Status */}
            <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
              <div>
                <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Metode Pembayaran</label>
                <select
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                  value={modalMethod}
                  onChange={(e) => setModalMethod(e.target.value)}
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Tunai">Tunai / Cash</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>Status Pembayaran</label>
                <select
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                >
                  <option value="belum_bayar">Belum Membayar</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
            </div>

            {/* Bukti Transfer */}
            <div style={{ borderTop: "1px solid var(--color-gray-100)", paddingTop: "1rem" }}>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
                Berkas Bukti Transfer (Receipt)
              </label>
              
              {modalReceiptUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ width: "100%", maxHeight: "160px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-gray-200)", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
                    <img src={modalReceiptUrl} alt="Bukti Transfer" style={{ maxHeight: "160px", objectFit: "contain" }} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <a
                      href={modalReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-portal-outline"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textAlign: "center", flex: 1 }}
                    >
                      Buka Gambar Penuh ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => setModalReceiptUrl("")}
                      className="btn-portal-danger"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    >
                      Hapus Berkas
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", border: "2px dashed var(--color-gray-200)", borderRadius: "8px", background: "var(--color-gray-50)", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontWeight: "600" }}>Pilih berkas foto bukti pembayaran</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)", marginTop: "2px" }}>Format PNG/JPG/JPEG maks. 5MB</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadReceipt}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Modal Actions */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              borderTop: "1px solid var(--color-gray-100)",
              paddingTop: "1rem",
            }}
          >
            {modalStatus === "lunas" && (
              <button
                type="button"
                onClick={() => handlePrintReceipt(modalStudent, payObj)}
                className="btn-portal-outline"
                style={{ padding: "0.5rem 1.2rem", fontWeight: "600", color: "#10b981", borderColor: "#10b981", marginRight: "auto" }}
              >
                🖨️ Cetak Kuitansi
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-portal-outline"
              style={{ padding: "0.5rem 1.2rem", fontWeight: "600" }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-portal-primary"
              style={{ padding: "0.5rem 1.5rem", fontWeight: "700" }}
              disabled={savingPayment}
            >
              {savingPayment ? "Menyimpan..." : "Simpan Status SPP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}