import { defineField, defineType } from "sanity";

export const tutorProfileType = defineType({
  name: "tutorProfile",
  title: "Profil Pengajar",
  type: "document",
  icon: () => '👨‍🏫',
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Nama Pengajar',
        subtitle: subtitle || 'Tutor',
        media,
      };
    },
  },
  fields: [
    defineField({
      name: "name",
      title: "Nama Lengkap Tutor",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Peran / Spesialisasi",
      type: "string",
      placeholder: "Contoh: Head Tutor / Kids Program Specialist",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Biografi Singkat",
      type: "text",
    }),
    defineField({
      name: "photo",
      title: "Foto Resmi",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "order",
      title: "Urutan Tampilan",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "isActive",
      title: "Aktif",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
