"use client";

interface StatusMsg {
  text: string | null | undefined;
  type: string;
}

interface Props {
  statusMsg: StatusMsg;
}

export default function ReportStatusBanner({ statusMsg }: Props) {
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
