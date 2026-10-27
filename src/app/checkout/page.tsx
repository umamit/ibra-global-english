export const dynamic = "force-dynamic";

import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getLandingSettings } from "@/utils/getLandingSettings";
import { createBreadcrumbSchema } from "@/utils/seoHelpers";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Checkout Pembayaran Kursus & SPP | PT. IBRA GLOBAL ENGLISH (IGE) Bobong",
    description:
      "Halaman checkout resmi pembayaran SPP dan biaya bimbingan belajar Bahasa Inggris (Kids & Teens), Fun Calistung, dan Matematika Dasar di PT. IBRA Global English Bobong melalui QRIS dan Virtual Account.",
    alternates: {
      canonical: "https://www.ibraglobalenglish.uk/checkout",
    },
  };
}

export default async function CheckoutPage() {
  const initialSettings = await getLandingSettings();
  const breadcrumb = createBreadcrumbSchema([
    { name: "Beranda", url: "https://www.ibraglobalenglish.uk/" },
    { name: "Checkout Pembayaran", url: "https://www.ibraglobalenglish.uk/checkout" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CheckoutClient initialSettings={initialSettings} />
    </>
  );
}
