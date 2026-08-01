import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { WebVitals } from "@/components/WebVitals";
import { getLandingSettings } from "@/utils/getLandingSettings";
import PromoPopup from "@/components/PromoPopup";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import QueryProvider from "./QueryProvider";
import AntiCopyProtection from "@/components/AntiCopyProtection";
import { createNewsArticleSchema } from "@/utils/seoHelpers";
import "./globals.css";
// landing.css di-import di HomeClient.jsx agar hanya aktif di halaman landing


export const dynamic = 'force-dynamic';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4a9ba8",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
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
      siteName: "PT. IBRA Global English",
      type: "website",
      images: [
        {
          url: heroImage,
          width: 512,
          height: 512,
          alt: "PT. IBRA Global English Logo",
        }
      ],
    },
    manifest: "/manifest.json",
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-code",
      other: {
        "facebook-domain-verification": ["7f0myl220gjkh4ndqe6cvvz26h7iyg"],
      },
    },
  };
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PT. IBRA Global English",
  "alternateName": ["PT IBRA Global English", "Ibra Global English Bobong", "Ibra Global English"],
  "url": "https://www.ibraglobalenglish.uk/"
};

const educationalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "PT. IBRA Global English",
  "alternateName": "Ibra Global English Bobong",
  "image": "https://www.ibraglobalenglish.uk/assets/logo.png",
  "url": "https://www.ibraglobalenglish.uk/",
  "telephone": "+6281357001357",
  "email": "admin@ibraglobalenglish.uk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001",
    "addressLocality": "Bobong, Taliabu Barat",
    "addressRegion": "Kabupaten Pulau Taliabu, Maluku Utara",
    "postalCode": "97794",
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Beranda",
      "item": "https://www.ibraglobalenglish.uk/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Kemitraan Sekolah",
      "item": "https://www.ibraglobalenglish.uk/kemitraan"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Placement Test",
      "item": "https://www.ibraglobalenglish.uk/placement-test"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Galeri Kegiatan",
      "item": "https://www.ibraglobalenglish.uk/gallery"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Tentang Kami",
      "item": "https://www.ibraglobalenglish.uk/about"
    }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="id" className={montserrat.variable} suppressHydrationWarning>
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
        <CloudflareAnalytics nonce={nonce} />

        {/* Facebook SDK */}
        {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
          <>
            <Script id="facebook-init" strategy="afterInteractive" nonce={nonce}>
              {`
                window.fbAsyncInit = function() {
                  FB.init({
                    appId      : '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                    cookie     : true,
                    xfbml      : true,
                    version    : '${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || "v18.0"}'
                  });
                  FB.AppEvents.logPageView();
                };
              `}
            </Script>
            <Script
              id="facebook-jssdk"
              src="https://connect.facebook.net/en_US/sdk.js"
              strategy="afterInteractive"
              nonce={nonce}
            />
          </>
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          nonce={nonce}
        />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          nonce={nonce}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              createNewsArticleSchema({
                title: "Pendaftaran Kursus Bahasa Inggris & Calistung Terbaru di Bobong, Pulau Taliabu",
                description: "Informasi resmi program belajar bahasa Inggris interaktif untuk Kids, Teens, dan Calistung di Ibra Global English Bobong.",
                image: "https://www.ibraglobalenglish.uk/assets/logo.png",
                url: "https://www.ibraglobalenglish.uk/",
              })
            ),
          }}
          nonce={nonce}
        />
        <Script id="register-sw" strategy="afterInteractive" nonce={nonce}>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </head>
      <body>
        <AntiCopyProtection />
        <WebVitals />
        <QueryProvider>
          {children}
        </QueryProvider>
        <PromoPopup />
        <Analytics />
      </body>
    </html>
  );
}
