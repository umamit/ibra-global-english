import { defineField, defineType } from "sanity";

export const curriculumType = defineType({
  name: "curriculum",
  title: "Kurikulum & Silabus",
  type: "document",
  icon: () => '📖',
  preview: {
    select: {
      title: 'levelName',
      program: 'program',
    },
    prepare({ title, program }) {
      return {
        title: title || 'Silabus Baru',
        subtitle: program || 'Program',
      };
    },
  },
  fields: [
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "levelName",
      title: "Nama Level / Tingkatan",
      type: "string",
      placeholder: "Contoh: Basic Speaking 1",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Durasi Kelas",
      type: "string",
      placeholder: "Contoh: 3 Bulan / 24 Pertemuan",
    }),
    defineField({
      name: "topics",
      title: "Topik Pembelajaran",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "syllabusPdf",
      title: "File PDF Silabus",
      type: "file",
      options: {
        accept: ".pdf",
      },
    }),
    defineField({
      name: "isActive",
      title: "Aktif",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
