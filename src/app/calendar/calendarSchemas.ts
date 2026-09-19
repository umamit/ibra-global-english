// Schema Data Terstruktur Event Kalender Akademik untuk Google Search Console (Rich Results)

export const calendarEventsSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationEvent",
      "name": "Gelombang Pendaftaran Siswa Baru Ibra Global English",
      "description": "Pendaftaran resmi gelombang belajar baru untuk Kids Program, Teens Program, dan Fun Calistung di Bobong, Pulau Taliabu.",
      "startDate": "2026-09-01T08:00:00+09:00",
      "endDate": "2026-10-31T17:00:00+09:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "Kantor Ibra Global English Bobong (Gedung Kost Fitrah Lt 1)",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. TPu Bobong, Belakang Mess Tambang, RT 001, RW 001",
          "addressLocality": "Bobong, Taliabu Barat",
          "addressRegion": "Kabupaten Pulau Taliabu, Maluku Utara",
          "postalCode": "97794",
          "addressCountry": "ID"
        }
      },
      "image": ["https://www.ibraglobalenglish.uk/assets/logo.png"],
      "organizer": {
        "@type": "EducationalOrganization",
        "@id": "https://www.ibraglobalenglish.uk/#organization",
        "name": "PT. IBRA Global English",
        "url": "https://www.ibraglobalenglish.uk/"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://www.ibraglobalenglish.uk/formulir-offline",
        "price": "0",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-09-01T08:00:00+09:00"
      }
    },
    {
      "@type": "EducationEvent",
      "name": "Placement Test & Diagnostic Bahasa Inggris Online Gratis",
      "description": "Tes penempatan level membaca, kosakata, tata bahasa, dan berbicara secara interaktif dengan sertifikat digital instan.",
      "startDate": "2026-09-01T00:00:00+09:00",
      "endDate": "2026-12-31T23:59:59+09:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
      "location": {
        "@type": "VirtualLocation",
        "url": "https://www.ibraglobalenglish.uk/placement-test"
      },
      "image": ["https://www.ibraglobalenglish.uk/assets/logo.png"],
      "organizer": {
        "@type": "EducationalOrganization",
        "@id": "https://www.ibraglobalenglish.uk/#organization",
        "name": "PT. IBRA Global English",
        "url": "https://www.ibraglobalenglish.uk/"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://www.ibraglobalenglish.uk/placement-test",
        "price": "0",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
};
