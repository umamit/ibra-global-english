import { defineField, defineType } from "sanity";

export const announcementType = defineType({
  name: "announcement",
  title: "Pengumuman",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Pengumuman",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Isi Pengumuman",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Tanggal Terbit",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "image",
      title: "Gambar Terlampir",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "targetRole",
      title: "Target Pengguna",
      type: "string",
      options: {
        list: [
          { title: "Semua Pengguna", value: "all" },
          { title: "Wali Murid / Orang Tua", value: "parent" },
          { title: "Pengajar / Tutor", value: "tutor" },
          { title: "Siswa / Pelajar", value: "student" },
        ],
      },
      initialValue: "all",
    }),
  ],
});
