import { Metadata } from 'next';
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Masuk ke LMS Portal | Ibra Global English Bobong",
  description: "Masuk ke Portal Akademik Ibra Global English Bobong untuk mengakses detail kelas, jadwal belajar, absensi harian, laporan hasil belajar, kuis, dan sertifikat kelulusan digital.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Masuk ke LMS Portal | Ibra Global English Bobong",
    description: "Masuk ke Portal Akademik Ibra Global English Bobong untuk mengakses detail kelas, jadwal belajar, absensi harian, laporan hasil belajar, kuis, dan sertifikat kelulusan digital.",
    url: "https://www.ibraglobalenglish.uk/login",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "Ibra Global English Logo",
      }
    ],
  }
};

export default function LoginPage() {
  return <LoginClient />;
}
