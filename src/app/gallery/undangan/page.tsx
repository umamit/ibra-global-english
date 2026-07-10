import { Metadata } from 'next';
import UndanganClient from "./UndanganClient";

export const metadata: Metadata = {
  title: "Undangan Pernikahan Online Mike & Lila",
  description: "Undangan Pernikahan Online Resmi Mike dan Lila. Bergabunglah bersama kami untuk merayakan hari bahagia ini secara interaktif.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UndanganPage() {
  return <UndanganClient />;
}
