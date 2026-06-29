import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Pengaturan Global",
  type: "document",
  icon: () => '⚙️',
  fields: [
    defineField({
      name: "siteName",
      title: "Nama Website / Instansi",
      type: "string",
      initialValue: "Ibra Global English Bobong",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroTitle",
      title: "Judul Utama Hero",
      type: "string",
      initialValue: "Ibra Global English Bobong",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Subjudul Hero",
      type: "string",
      initialValue: "Kursus Bahasa Inggris Terbaik",
    }),
    defineField({
      name: "heroDesc",
      title: "Deskripsi Hero / Ringkasan",
      type: "text",
      initialValue: "Menawarkan kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu.",
    }),
    defineField({
      name: "contactPhone",
      title: "Nomor Telepon / WhatsApp",
      type: "string",
      initialValue: "+62 813-5700-1357",
    }),
    defineField({
      name: "contactEmail",
      title: "Email Kontak",
      type: "string",
      initialValue: "admin@ibraglobalenglish.uk",
    }),
    defineField({
      name: "addressText",
      title: "Alamat Fisik",
      type: "text",
      initialValue: "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah",
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Link Google Maps",
      type: "url",
    }),
    defineField({
      name: "socialInstagram",
      title: "URL Instagram",
      type: "url",
    }),
    defineField({
      name: "socialFacebook",
      title: "URL Facebook",
      type: "url",
    }),
    defineField({
      name: "maintenanceMode",
      title: "Aktifkan Halaman Pemeliharaan (Maintenance Mode)",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
