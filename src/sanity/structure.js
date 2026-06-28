/**
 * Struktur sidebar kustom untuk Sanity Studio.
 * Menata item konten secara hierarkis agar lebih mudah dikelola.
 */
export const customStructure = (S) => {
  return S.list()
    .title('Ibra Global English CMS')
    .items([
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
        .title('Akademik')
        .icon(() => '🎓')
        .child(
          S.list()
            .title('Akademik')
            .items([
              S.listItem()
                .title('Program Kelas')
                .icon(() => '🎓')
                .child(
                  S.documentTypeList('programItem')
                    .title('Program Kelas')
                ),
            ])
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
