import sys

def create_simple_pdf(filename):
    # Constructing a valid minimal PDF 1.4 file with text
    content = """
================================================================================
                    PROPOSAL KEMITRAAN REKOMENDASI RESMI
                         IBRA GLOBAL ENGLISH BOBONG
                 Kabupaten Pulau Taliabu, Provinsi Maluku Utara
================================================================================

1. LATAR BELAKANG
Ibra Global English Bobong mengundang Sekolah (SD/SMP/SMA) dan Instansi/Dinas di
Kabupaten Pulau Taliabu untuk bergabung dalam Program Mitra Rekomendasi Resmi.
Program ini bertujuan meningkatkan kemampuan Bahasa Inggris generasi muda di Bobong
secara terstruktur, akurat, dan berstandar CEFR.

2. TRANSPARANSI BIAYA (100% BEBAS BIAYA UNTUK SEKOLAH)
- Pihak Sekolah/Instansi TIDAK mengeluarkan anggaran sekolah / Dana BOS sepeser pun.
- Sekolah hanya bertindak sebagai fasilitator rujukan resmi.
- Biaya kursus dibayarkan secara mandiri oleh orang tua murid.
- Siswa rujukan dari Sekolah Mitra berhak atas Bebas Biaya Admin Pendaftaran
  dan Voucher Potongan Khusus.

3. KEUNTUNGAN DAN FASILITAS MITRA SEKOLAH
a. Diagnostic Test Gratis: Pemetaan level bahasa Inggris awal bagi siswa mitra.
b. Voucher Pendaftaran: Bebas biaya pendaftaran awal bagi seluruh murid sekolah mitra.
c. Laporan Prestasi Berkala: Sekolah menerima laporan hasil belajar siswa
   (Skor Speaking, Kehadiran, Evaluasi Grammar, & Level CEFR) untuk akreditasi.

4. ALUR KERJA SAMA
Step 1: Diskusi & Penandatanganan MoU Bebas Biaya (100% Gratis).
Step 2: Pelaksanaan Sesi Diagnostic Test Gratis untuk siswa.
Step 3: Pembelajaran di Gedung Ibra Global English & Pengiriman Laporan Berkala.

5. KONTAK PENGAJUAN KEMITRAAN
Gedung Ibra Global English Bobong
Kabupaten Pulau Taliabu, Maluku Utara
Website: https://ibraglobalenglish.uk/kemitraan
================================================================================
"""

    lines = content.strip().split('\n')
    
    pdf_text_cmds = []
    y = 750
    for line in lines:
        # Escape parenthesis
        safe_line = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        pdf_text_cmds.append(f"1 0 0 1 50 {y} Tm ({safe_line}) Tj")
        y -= 14
        if y < 50:
            y = 750

    stream_content = "BT\n/F1 10 Tf\n" + "\n".join(pdf_text_cmds) + "\nET"
    stream_len = len(stream_content)

    pdf_body = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 6 0 R >> >>
endobj
5 0 obj
<< /Length {stream_len} >>
stream
{stream_content}
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
"""
    
    # Calculate xref
    header = "%PDF-1.4\n"
    o1 = len(header)
    o2 = o1 + len(f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    o3 = o2 + len(f"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    o4 = o3 + len(f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >>\nendobj\n")
    o5 = o4 + len(f"4 0 obj\n<< /Font << /F1 6 0 R >> >>\nendobj\n")
    o6 = o5 + len(f"5 0 obj\n<< /Length {stream_len} >>\nstream\n{stream_content}\nendstream\nendobj\n")

    xref_pos = o6 + len(f"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n")

    xref = f"""xref
0 7
0000000000 65535 f 
{o1:010d} 00000 n 
{o2:010d} 00000 n 
{o3:010d} 00000 n 
{o4:010d} 00000 n 
{o5:010d} 00000 n 
{o6:010d} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
{xref_pos}
%%EOF"""

    full_pdf = pdf_body + xref

    with open(filename, "wb") as f:
        f.write(full_pdf.encode('latin1'))

    print(f"PDF successfully written to {filename}")

if __name__ == "__main__":
    create_simple_pdf("public/docs/Proposal_Kemitraan_Ibra_Global_English.pdf")
