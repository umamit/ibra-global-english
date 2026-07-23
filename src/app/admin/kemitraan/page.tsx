import { Metadata } from "next";
import KemitraanAdminClient from "./KemitraanAdminClient";

export const metadata: Metadata = {
  title: "Manajemen Kemitraan & Proposal PDF | Admin Ibra Global English",
  description: "Kelola pengajuan mitra sekolah dan berkas Proposal Kemitraan resmi Ibra Global English Bobong.",
};

export const dynamic = "force-dynamic";

export default function AdminKemitraanPage() {
  return <KemitraanAdminClient />;
}
