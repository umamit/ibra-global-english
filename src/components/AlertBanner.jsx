"use client";

/**
 * Komponen AlertBanner Reusable
 * Menampilkan pesan konfirmasi (sukses/gagal) pada portal admin
 */
export default function AlertBanner({
  message,
  type = "success", // success, error
  style = {}
}) {
  if (!message) return null;

  const className = type === "success" ? "auth-success-banner" : "auth-error-banner";

  return (
    <div
      className={className}
      style={{ 
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        ...style 
      }}
    >
      <span>{message}</span>
    </div>
  );
}
