import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { WebVitals } from "@/components/WebVitals";
import { getLandingSettings } from "@/utils/getLandingSettings";
import "./globals.css";


export const dynamic = 'force-dynamic';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport = {
  themeColor: "#4a9ba8",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata() {
  const settings = await getLandingSettings();
  
  const heroTitle = settings.hero_title || "Kursus di Bobong | Ibra Global English";
  const heroSubtitle = settings.hero_subtitle || "Kursus Bahasa Inggris Terbaik";
  const defaultTitle = `${heroTitle} - ${heroSubtitle}`;

  const description = settings.hero_desc ||
    "Kursus di Bobong terbaik di Ibra Global English. Kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Belajar seru lancar bicara!";

  const heroImage = settings.hero_image || "/assets/logo.png";

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${heroTitle}`,
    },
    description,
    keywords: [
      "kursus di bobong",
      "kursus bahasa inggris bobong",
      "ibra global english bobong",
      "kursus inggris taliabu",
      "les bahasa inggris bobong",
      "bimbel calistung bobong",
      "belajar bahasa inggris taliabu"
    ],
    metadataBase: new URL("https://www.ibraglobalenglish.uk"),
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: defaultTitle,
      description,
      url: "https://www.ibraglobalenglish.uk/",
      type: "website",
      images: [
        {
          url: heroImage,
          width: 512,
          height: 512,
          alt: "Ibra Global English Logo",
        }
      ],
    },
  };
}

const educationalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Ibra Global English Bobong",
  "image": "https://www.ibraglobalenglish.uk/assets/logo.png",
  "url": "https://www.ibraglobalenglish.uk/",
  "telephone": "+6281357001357",
  "email": "admin@ibraglobalenglish.uk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah",
    "addressLocality": "Bobong",
    "addressRegion": "Pulau Taliabu, Maluku Utara",
    "addressCountry": "ID"
  },
  "description": "Kursus Bahasa Inggris offline dan bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu dengan metode interaktif, fun, dan tutor berpengalaman.",
  "sameAs": [
    "https://maps.app.goo.gl/weuM3h6yCu3rK3ov8",
    "https://www.facebook.com/IbraGlobalEnglish",
    "https://www.instagram.com/ibraglobalenglish/"
  ],
  "offers": {
    "@type": "Offer",
    "category": "English Language Course"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Bagaimana jika saya atau anak saya benar-benar pemula (belum bisa bahasa Inggris)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tidak perlu khawatir. Program kami dirancang ramah untuk pemula. Tutor kami akan membimbing secara perlahan dari materi paling dasar (seperti kosa kata dasar dan pelafalan sederhana) dengan metode interaktif tanpa tekanan, sehingga siswa dapat membangun rasa percaya diri terlebih dahulu."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa kali pertemuan dalam seminggu dan berapa durasi setiap kelas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kelas biasanya diadakan 2 hingga 3 kali seminggu, bergantung pada program yang Anda pilih. Setiap sesi pertemuan berlangsung selama 90 menit (1,5 jam), yang merupakan durasi ideal untuk penyampaian materi secara terstruktur sekaligus praktek berbicara (speaking practice) yang maksimal."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana jika siswa berhalangan hadir pada jadwal kelas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kami menyediakan sesi kelas pengganti (make-up class) atau siswa dapat berkonsultasi langsung dengan tutor untuk mengejar materi yang tertinggal agar proses belajar tetap berkelanjutan tanpa hambatan."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah orang tua bisa memantau perkembangan belajar anak?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tentu saja. Kami selalu memberikan laporan perkembangan belajar (Progress Report) secara berkala kepada orang tua siswa di setiap akhir level atau modul. Dengan laporan ini, orang tua dapat melihat perkembangan kosakata, pelafalan, serta keaktifan belajar anak secara transparan."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana metode pembayaran biaya kursus di Ibra Global English Bobong?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pembayaran dapat dilakukan secara tunai langsung di kantor pendaftaran kami, atau melalui transfer bank ke rekening bank kami. Kami juga menawarkan fleksibilitas pembayaran bulanan untuk meringankan beban biaya pendidikan."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah Ibra Global English melayani siswa dari luar kota Bobong (seluruh wilayah Pulau Taliabu)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, tentu saja. Kami melayani seluruh calon peserta kursus bahasa Inggris dan bimbingan belajar dari berbagai wilayah di Kabupaten Pulau Taliabu. Jadwal dan program belajar kami dirancang fleksibel sehingga dapat diikuti oleh siswa yang berdomisili baik di dalam maupun di luar kota Bobong."
      }
    }
  ]
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="id" className={montserrat.variable}>
      <head>
        {/* Flaticon UIcons */}
        <link href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css" rel="stylesheet" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-989GJL5VCF"
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-989GJL5VCF');
          `}
        </Script>

        {/* Cloudflare Web Analytics */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "30b277bf69f4494d94550e9771fe8aa0"}'
          strategy="afterInteractive"
          nonce={nonce}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }}
          nonce={nonce}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          nonce={nonce}
        />
      </head>
      <body>
        <WebVitals />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
