import { defineField, defineType } from "sanity";

export const benefitType = defineType({
  name: "benefit",
  title: "Keunggulan Kursus",
  type: "document",
  icon: () => '🌟',
  preview: {
    select: {
      title: 'title',
      order: 'order',
    },
    prepare({ title, order }) {
      return {
        title: title || 'Keunggulan Tanpa Judul',
        subtitle: `Urutan: #${order ?? 0}`,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Judul Keunggulan",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "desc",
      title: "Deskripsi",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "iconKey",
      title: "Ikon",
      type: "string",
      options: {
        list: [
          { title: "Pengguna (Group)", value: "users" },
          { title: "Sertifikat / Penghargaan", value: "award" },
          { title: "Waktu / Jam", value: "clock" },
          { title: "Piala / Kemenangan", value: "trophy" },
          { title: "Pesan / Percakapan", value: "message" },
          { title: "Centang (Umum)", value: "check" },
        ],
      },
      initialValue: "check",
    }),
    defineField({
      name: "order",
      title: "Urutan Tampilan",
      type: "number",
      initialValue: 0,
      description: "Angka lebih kecil tampil lebih awal.",
    }),
  ],
});
