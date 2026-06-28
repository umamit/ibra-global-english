/**
 * Struktur sidebar kustom untuk Sanity Studio.
 * Menata item konten secara hierarkis agar lebih mudah dikelola.
 */
export const customStructure = (S) => {
  return S.list()
    .title('Ibra Global English CMS')
    .items([
      // ========================
      // SETTINGS (SINGLETON)
      // ========================
      S.listItem()
        .title('Pengaturan Global')
        .icon(() => '⚙️')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Pengaturan Global')
        ),

      S.divider(),

      // ========================
      // WEBSITE CONTENT
      // ========================
      S.listItem()
        .title('Konten Website')
        .icon(() => '🌐')
        .child(
          S.list()
            .title('Konten Website')
            .items([
              S.listItem()
                .title('Pengumuman')
                .icon(() => '📢')
                .child(
                  S.documentTypeList('announcement')
                    .title('Pengumuman')
                ),
              S.listItem()
                .title('Keunggulan Kursus')
                .icon(() => '🌟')
                .child(
                  S.documentTypeList('benefit')
                    .title('Keunggulan Kursus')
                ),
              S.listItem()
                .title('Testimoni')
                .icon(() => '💬')
                .child(
                  S.documentTypeList('testimonial')
                    .title('Testimoni')
                ),
              S.listItem()
                .title('FAQ')
                .icon(() => '❓')
                .child(
                  S.documentTypeList('faqItem')
                    .title('FAQ')
                ),
            ])
        ),

      // ========================
      // AKADEMIK
      // ========================
      S.listItem()
        .title('Akademik & Kelas')
        .icon(() => '🎓')
        .child(
          S.list()
            .title('Akademik & Kelas')
            .items([
              S.listItem()
                .title('Program Kelas')
                .icon(() => '🎓')
                .child(
                  S.documentTypeList('programItem')
                    .title('Program Kelas')
                ),
              S.listItem()
                .title('Kurikulum & Silabus')
                .icon(() => '📖')
                .child(
                  S.documentTypeList('curriculum')
                    .title('Kurikulum & Silabus')
                ),
            ])
        ),

      // ========================
      // STAFF & TIM
      // ========================
      S.listItem()
        .title('Tim Pengajar')
        .icon(() => '👨‍🏫')
        .child(
          S.documentTypeList('tutorProfile')
            .title('Profil Pengajar')
        ),

      // ========================
      // AI & CHATBOT
      // ========================
      S.listItem()
        .title('Basis Pengetahuan AI')
        .icon(() => '🤖')
        .child(
          S.documentTypeList('ragDocument')
            .title('Basis Pengetahuan AI Chatbot')
        ),

      // ========================
      // MEDIA & ASSETS
      // ========================
      S.listItem()
        .title('Media & Assets')
        .icon(() => '🖼️')
        .child(
          S.list()
            .title('Media & Assets')
            .items([
              S.listItem()
                .title('Galeri Foto')
                .icon(() => '🖼️')
                .child(
                  S.documentTypeList('galleryItem')
                    .title('Galeri Foto')
                ),
            ])
        ),
    ]);
};

