import { defineField, defineType } from "sanity";

export const ragDocumentType = defineType({
  name: "ragDocument",
  title: "Basis Pengetahuan AI",
  type: "document",
  icon: () => '🤖',
  preview: {
    select: {
      title: 'title',
      source: 'source',
    },
    prepare({ title, source }) {
      return {
        title: title || 'Dokumen AI Tanpa Judul',
        subtitle: `Sumber: ${source || 'manual'}`,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Judul Dokumen",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Isi Dokumen Pengetahuan",
      type: "text",
      description: "Berikan penjelasan detail mengenai informasi ini agar dapat dipahami dan dijawab oleh chatbot AI secara akurat.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Kategori Sumber",
      type: "string",
      options: {
        list: [
          { title: "Manual (Umum)", value: "manual" },
          { title: "FAQ (Tanya Jawab)", value: "faq" },
          { title: "Materi Kelas (Course Material)", value: "course_material" },
          { title: "Website Resmi", value: "website" },
          { title: "Lain-lain", value: "other" },
        ],
      },
      initialValue: "manual",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "keywords",
      title: "Kata Kunci Pencarian (Keywords)",
      type: "array",
      of: [{ type: "string" }],
      description: "Kata kunci pembantu untuk memperkuat relevansi pencarian.",
    }),
  ],
});
