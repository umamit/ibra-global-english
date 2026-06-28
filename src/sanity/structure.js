import { S } from 'sanity/structure';

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
              S.documentTypeList('announcement')
                .title('📢 Pengumuman')
                .icon(() => '📢'),
              S.documentTypeList('testimonial')
                .title('💬 Testimoni')
                .icon(() => '💬'),
              S.documentTypeList('faqItem')
                .title('❓ FAQ')
                .icon(() => '❓'),
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
              S.documentTypeList('programItem')
                .title('Program Kelas')
                .icon(() => '🎓'),
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
              S.documentTypeList('galleryItem')
                .title('Galeri Foto')
                .icon(() => '🖼️'),
            ])
        ),
    ]);
};
