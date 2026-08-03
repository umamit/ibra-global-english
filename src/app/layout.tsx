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
import { websiteSchema, educationalOrgSchema, faqSchema, breadcrumbSchema } from "./layoutSchemas";
import "./globals.css";

export const dynamic = 'force-dynamic';

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-sans", display: "swap" });

export const viewport: Viewport = { themeColor: "#4a9ba8", colorScheme: "light dark", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLandingSettings();
  const heroTitle = settings.hero_title || "Kursus di Bobong | Ibra Global English";
  const heroSubtitle = settings.hero_subtitle || "Kursus Bahasa Inggris Terbaik";
  const defaultTitle = `${heroTitle} - ${heroSubtitle}`;
  const description = settings.hero_desc || "Kursus di Bobong terbaik di Ibra Global English. Kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Belajar seru lancar bicara!";
  const heroImage = settings.hero_image || "/assets/logo.png";

  return {
    title: { default: defaultTitle, template: `%s | ${heroTitle}` },
    description,
    keywords: ["kursus di bobong", "kursus bahasa inggris bobong", "ibra global english bobong", "kursus inggris taliabu", "les bahasa inggris bobong", "bimbel calistung bobong", "belajar bahasa inggris taliabu"],
    metadataBase: new URL("https://www.ibraglobalenglish.uk"),
    alternates: { canonical: "https://www.ibraglobalenglish.uk" },
    robots: { index: true, follow: true },
    openGraph: { title: defaultTitle, description, url: "https://www.ibraglobalenglish.uk/", siteName: "PT. IBRA Global English", type: "website", images: [{ url: heroImage, width: 512, height: 512, alt: "PT. IBRA Global English Logo" }] },
    manifest: "/manifest.json",
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-code", other: { "facebook-domain-verification": ["7f0myl220gjkh4ndqe6cvvz26h7iyg"] } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="id" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/@flaticon/flaticon-uicons@3.3.1/css/all/all.min.css" rel="stylesheet" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-989GJL5VCF" strategy="afterInteractive" nonce={nonce} />
        <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-989GJL5VCF');`}</Script>
        <CloudflareAnalytics nonce={nonce} />
        {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
          <>
            <Script id="facebook-init" strategy="afterInteractive" nonce={nonce}>{`window.fbAsyncInit = function() { FB.init({ appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}', cookie: true, xfbml: true, version: '${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || "v18.0"}' }); FB.AppEvents.logPageView(); };`}</Script>
            <Script id="facebook-jssdk" src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" nonce={nonce} />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} nonce={nonce} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }} nonce={nonce} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} nonce={nonce} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} nonce={nonce} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createNewsArticleSchema({ title: "Pendaftaran Kursus Bahasa Inggris & Calistung Terbaru di Bobong, Pulau Taliabu", description: "Informasi resmi program belajar bahasa Inggris interaktif untuk Kids, Teens, dan Calistung di Ibra Global English Bobong.", image: "https://www.ibraglobalenglish.uk/assets/logo.png", url: "https://www.ibraglobalenglish.uk/" })) }} nonce={nonce} />
        <Script id="register-sw" strategy="afterInteractive" nonce={nonce}>{`if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(err) { console.log('SW registration failed: ', err); }); }); }`}</Script>
      </head>
      <body>
        <AntiCopyProtection />
        <WebVitals />
        <QueryProvider>{children}</QueryProvider>
        <PromoPopup />
        <Analytics />
      </body>
    </html>
  );
}
