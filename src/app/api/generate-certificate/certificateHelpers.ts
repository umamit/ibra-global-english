import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const W = 841.89;
const H = 595.28;

const C_DARK_GREEN = rgb(0.129, 0.424, 0.494);
const C_TEAL_DARK  = rgb(0.086, 0.302, 0.341);
const C_GOLD       = rgb(0.651, 0.533, 0.286);
const C_DARK       = rgb(0.114, 0.114, 0.122);
const C_GRAY       = rgb(0.43,  0.43,  0.45);
const C_ROW_BORDER = rgb(0.80,  0.84,  0.85);

export const sanitize = (s: string) => (s || "").replace(/[\r\n\t]+/g, " ").trim();

export function drawCentered(page: any, text: string, y: number, font: any, size: number, color = C_DARK) {
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (W - tw) / 2, y, font, size, color });
}

export async function fetchCertificateData(supabase: any, certId: string) {
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("*, students(*), reports(*)")
    .eq("id", certId)
    .single();

  if (error || !cert) return null;

  let report = cert.reports as Record<string, number | string> | null;
  if (!report && cert.student_id) {
    const { data: repData } = await supabase
      .from("reports")
      .select("speaking_score,grammar_score,vocabulary_score,active_score,tutor_notes")
      .eq("student_id", cert.student_id)
      .ilike("module_name", cert.module_name)
      .limit(1)
      .maybeSingle();
    report = repData;
  }
  return { cert, report };
}

export async function renderCertificatePdf(cert: any, report: any, origin: string) {
  const TEMPLATE_URL =
    "https://uszukipvrvjrgrikxfwh.supabase.co/storage/v1/object/public/certificate-templates/Salinan%20dari%20Blue%20and%20Gold%20Simple%20Elegant%20Certificate%20of%20Appreciation.pdf";
  const tplRes = await fetch(TEMPLATE_URL);
  if (!tplRes.ok) throw new Error("Gagal mengambil template PDF dari Supabase Storage");
  const templateBytes = await tplRes.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const fRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const isCalistung = cert.students?.program?.toLowerCase()?.includes("calistung");
  const studentName = sanitize(((cert.students?.name as string) || "")).toUpperCase();
  const tutorName = sanitize((cert.tutor_name as string) || "");
  const moduleName = sanitize((cert.module_name as string) || "");
  const certNumber = sanitize((cert.cert_number as string) || "");
  const grade = sanitize((cert.grade as string) || "");
  const issueDate = new Date(cert.issue_date as string);

  const formattedDate = issueDate.toLocaleDateString(isCalistung ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  const completionText = isCalistung ? `telah menyelesaikan program Calistung ${moduleName}` : `for successfully completing the ${moduleName}`;
  const datePrefixText = isCalistung ? `Diterbitkan tanggal: ${formattedDate}` : `Issued on: ${formattedDate}`;

  const page1 = pdfDoc.getPage(0);
  if (certNumber) drawCentered(page1, `Nomor : ${certNumber}`, H * 0.675, fRegular, 12, C_DARK);
  drawCentered(page1, studentName, H * 0.42, fBold, 40, C_DARK);
  drawCentered(page1, completionText, H * 0.355, fRegular, 15, C_DARK);
  drawCentered(page1, datePrefixText, H * 0.305, fRegular, 13, C_DARK);

  if (tutorName) {
    const tutorCX = W * 0.295;
    page1.drawText(tutorName, { x: tutorCX - fBold.widthOfTextAtSize(tutorName, 13) / 2, y: H * 0.205, font: fBold, size: 13, color: C_DARK });
    page1.drawText("DIREKTUR", { x: tutorCX - fRegular.widthOfTextAtSize("DIREKTUR", 8) / 2, y: H * 0.168, font: fRegular, size: 8, color: C_GRAY });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${origin}/verify/${cert.id}`)}`;
  const qrRes = await fetch(qrUrl);
  if (qrRes.ok) {
    const qrBytes = await qrRes.arrayBuffer();
    const qrImage = await pdfDoc.embedPng(new Uint8Array(qrBytes));
    const QR_SIZE = 72;
    page1.drawImage(qrImage, { x: W * 0.785 - QR_SIZE / 2, y: H * 0.085, width: QR_SIZE, height: QR_SIZE });
  }

  // Page 2 - Transcript
  const page2 = pdfDoc.addPage([W, H]);
  const bgPath = path.join(process.cwd(), "public/assets/Salinan dari Salinan dari Blue and Gold Simple Elegant Certificate of Appreciation.png");
  const bgBytes = fs.readFileSync(bgPath);
  const bgImage = await pdfDoc.embedPng(new Uint8Array(bgBytes));
  page2.drawImage(bgImage, { x: 0, y: 0, width: W, height: H });

  const TM = 70;
  const TW = W - 140;
  let cy = H - 85;

  const hdr1 = "IBRA GLOBAL ENGLISH";
  page2.drawText(hdr1, { x: (W - fBold.widthOfTextAtSize(hdr1, 24)) / 2, y: cy, font: fBold, size: 24, color: C_DARK_GREEN });
  cy -= 15;
  const hdr2 = "Lembaga Kursus & Pelatihan (LKP)";
  page2.drawText(hdr2, { x: (W - fRegular.widthOfTextAtSize(hdr2, 9.5)) / 2, y: cy, font: fRegular, size: 9.5, color: C_DARK });
  cy -= 14;
  const hdr3 = "TRANSKRIP EVALUASI AKADEMIK  /  ACADEMIC TRANSCRIPT";
  page2.drawText(hdr3, { x: (W - fBold.widthOfTextAtSize(hdr3, 10.5)) / 2, y: cy, font: fBold, size: 10.5, color: C_TEAL_DARK });
  cy -= 26;

  const COL2X2 = W / 2 + 10;
  const IS = 10.5;
  const LW2 = 108;
  const drawInfo = (label: string, val: string, x: number, y: number) => {
    page2.drawText(label, { x, y, font: fBold, size: IS, color: C_DARK });
    page2.drawText(`: ${val}`, { x: x + LW2, y, font: fRegular, size: IS, color: C_DARK });
  };
  drawInfo("Nama Siswa", cert.students?.name || "-", TM + 12, cy - 18);
  drawInfo("Program Belajar", cert.students?.program || "-", TM + 12, cy - 36);
  drawInfo("No. Sertifikat", certNumber || "-", COL2X2, cy - 18);
  drawInfo("Tanggal Terbit", issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), COL2X2, cy - 36);

  const scores = { speaking: Number(report?.speaking_score || 0), grammar: Number(report?.grammar_score || 0), vocabulary: Number(report?.vocabulary_score || 0), active: Number(report?.active_score || 0) };
  const avgScore = Math.round((scores.speaking + scores.grammar + scores.vocabulary + scores.active) / 4);
  const getGrade = (s: number) => (s >= 85 ? "A" : s >= 75 ? "B" : "C");

  const ROW_H = 30;
  const CELL_S = 11;
  const colW = [36, TW - 36 - 96 - 96, 96, 96];
  const colX = [TM, TM + colW[0], TM + colW[0] + colW[1], TM + colW[0] + colW[1] + colW[2]];
  const subjects = isCalistung
    ? ["Kemampuan Membaca (Reading Skill)", "Kemampuan Menulis (Writing Skill)", "Kemampuan Berhitung (Math Skill)", "Keaktifan Siswa (Class Participation)"]
    : ["Speaking & Pronunciation", "Grammar & Structure", "Vocabulary & Comprehension", "Keaktifan Siswa (Class Participation)"];
  const scoreValues = [scores.speaking, scores.grammar, scores.vocabulary, scores.active];

  let ty = cy - 52 - 22;
  page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
  ["No", "Kompetensi Belajar (Subjects)", "Skor", "Predikat"].forEach((h, i) => {
    page2.drawText(h, { x: colX[i] + colW[i] / 2 - fBold.widthOfTextAtSize(h, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
  });
  ty -= ROW_H;

  subjects.forEach((subj, idx) => {
    page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
    page2.drawText(`${idx + 1}`, { x: colX[0] + colW[0] / 2 - fRegular.widthOfTextAtSize(`${idx + 1}`, CELL_S) / 2, y: ty - ROW_H + 15, font: fRegular, size: CELL_S, color: C_DARK });
    page2.drawText(subj, { x: colX[1] + 8, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
    page2.drawText(`${scoreValues[idx]}`, { x: colX[2] + colW[2] / 2 - fBold.widthOfTextAtSize(`${scoreValues[idx]}`, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
    const gr = getGrade(scoreValues[idx]);
    page2.drawText(gr, { x: colX[3] + colW[3] / 2 - fBold.widthOfTextAtSize(gr, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
    ty -= ROW_H;
  });

  page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_GOLD, borderWidth: 0.8 });
  const avgLabel = "NILAI RATA-RATA / AVERAGE";
  page2.drawText(avgLabel, { x: colX[2] - fBold.widthOfTextAtSize(avgLabel, CELL_S) - 10, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
  page2.drawText(`${avgScore}`, { x: colX[2] + colW[2] / 2 - fBold.widthOfTextAtSize(`${avgScore}`, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
  const finalGrade = grade || getGrade(avgScore);
  page2.drawText(finalGrade, { x: colX[3] + colW[3] / 2 - fBold.widthOfTextAtSize(finalGrade, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
  ty -= ROW_H;

  const FOOT_TOP = ty - 14;
  const FOOT_BOT = 50;
  const FOOT_H = FOOT_TOP - FOOT_BOT;
  const NOTE_W = TW * 0.58;
  const SIGN_X2 = TM + NOTE_W + 20;
  const SIGN_W2 = TW - NOTE_W - 20;
  const SIGN_CX2 = SIGN_X2 + SIGN_W2 / 2;
  const signDate = `Bobong, ${issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
  const SIGN_MID = FOOT_BOT + FOOT_H / 2;

  page2.drawText(signDate, { x: SIGN_CX2 - fRegular.widthOfTextAtSize(signDate, 9.5) / 2, y: SIGN_MID + 42, font: fRegular, size: 9.5, color: C_DARK });
  if (tutorName) {
    page2.drawText(tutorName, { x: SIGN_CX2 - fBold.widthOfTextAtSize(tutorName, 12) / 2, y: SIGN_MID - 6, font: fBold, size: 12, color: C_DARK });
    page2.drawLine({ start: { x: SIGN_CX2 - 72, y: SIGN_MID - 15 }, end: { x: SIGN_CX2 + 72, y: SIGN_MID - 15 }, thickness: 0.8, color: C_ROW_BORDER });
    page2.drawText("Direktur", { x: SIGN_CX2 - fRegular.widthOfTextAtSize("Direktur", 9) / 2, y: SIGN_MID - 28, font: fRegular, size: 9, color: C_GRAY });
  }

  return await pdfDoc.save();
}
