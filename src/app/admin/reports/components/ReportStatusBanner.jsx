"use client";

export default function ReportStatusBanner({ statusMsg }) {
  if (!statusMsg.text) return null;

  return (
    <div
      className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
      style={{ marginBottom: "2rem" }}
    >
      <span>{statusMsg.text}</span>
    </div>
  );
}