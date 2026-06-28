import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faqItem",
  title: "Tanya Jawab (FAQ)",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Pertanyaan",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Jawaban",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Urutan Tampilan",
      type: "number",
      initialValue: 0,
      description: "Angka lebih kecil akan tampil lebih dulu di website.",
    }),
  ],
});
