import { Metadata } from "next";
import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "Kalender Akademik & Jadwal KBM | Ibra Global English Bobong",
  description: "Jadwal resmi kalender akademik, pembukaan gelombang pendaftaran baru, ujian progress evaluation, placement test, dan agenda kegiatan belajar mengajar di Ibra Global English Bobong.",
  alternates: {
    canonical: "https://www.ibraglobalenglish.uk/calendar",
  },
  openGraph: {
    title: "Kalender Akademik & Jadwal KBM | Ibra Global English Bobong",
    description: "Jadwal resmi kalender akademik, pembukaan gelombang pendaftaran baru, ujian progress evaluation, dan agenda KBM di Pulau Taliabu.",
    url: "https://www.ibraglobalenglish.uk/calendar",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "Ibra Global English Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalender Akademik & Jadwal KBM | Ibra Global English Bobong",
    description: "Jadwal resmi kalender akademik, pembukaan gelombang pendaftaran baru, ujian progress evaluation, dan agenda KBM di Pulau Taliabu.",
    images: ["/assets/logo.png"],
  }
};

export default function CalendarPage() {
  return <CalendarClient />;
}
