import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimoni Siswa",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nama Siswa / Orang Tua",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Ulasan / Testimoni",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Foto Profil / Avatar",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "program",
      title: "Program Kelas",
      type: "string",
      options: {
        list: [
          { title: "Kids Program", value: "Kids Program" },
          { title: "Teens Program", value: "Teens Program" },
          { title: "Fun Calistung", value: "Fun Calistung" },
        ],
      },
    }),
  ],
});
