import { defineField, defineType } from "sanity";

export const programType = defineType({
  name: "programItem",
  title: "Program Kelas",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nama Program",
      type: "string",
      options: {
        list: [
          { title: "Kids Program", value: "Kids Program" },
          { title: "Teens Program", value: "Teens Program" },
          { title: "Fun Calistung", value: "Fun Calistung" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ageGroup",
      title: "Kelompok Usia",
      type: "string",
      placeholder: "Contoh: 5-12 tahun",
    }),
    defineField({
      name: "description",
      title: "Deskripsi Kelas",
      type: "text",
    }),
    defineField({
      name: "sppPrice",
      title: "Biaya SPP Bulanan",
      type: "string",
      placeholder: "Contoh: Rp 350.000 / bulan",
    }),
    defineField({
      name: "features",
      title: "Fasilitas & Keunggulan",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
