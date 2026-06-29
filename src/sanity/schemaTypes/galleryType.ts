import { defineField, defineType } from "sanity";

export const galleryType = defineType({
  name: "galleryItem",
  title: "Galeri Foto",
  type: "document",
  icon: () => '🖼️',
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'image',
    },
    prepare({ title, category, media }) {
      return {
        title: title || 'Foto Tanpa Judul',
        subtitle: category || 'Galeri',
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "Nama / Judul Foto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Keterangan / Deskripsi",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Kegiatan Belajar", value: "Kegiatan" },
          { title: "Fasilitas Kelas", value: "Fasilitas" },
          { title: "Lain-lain", value: "Lain-lain" },
        ],
      },
      initialValue: "Kegiatan",
    }),
  ],
});
