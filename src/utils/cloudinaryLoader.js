export default function cloudinaryLoader({ src, width, quality }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  // Jika Cloud Name belum dikonfigurasi, atau gambar adalah file lokal,
  // atau gambar sudah berupa link Cloudinary, atau data: URL, kembalikan asli.
  if (
    !cloudName ||
    src.startsWith('/') ||
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('https://res.cloudinary.com/') ||
    src.startsWith('http://res.cloudinary.com/')
  ) {
    return src;
  }
  
  // Setup parameter optimasi format, kualitas, dan lebar gambar
  const params = ['f_auto', 'q_auto', `w_${width}`];
  if (quality) {
    params.push(`q_${quality}`);
  }
  
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${src}`;
}
