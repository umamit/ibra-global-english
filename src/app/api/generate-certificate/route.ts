import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createAdminClient } from "@/utils/supabase/server";

// ── A4 Landscape: 297mm × 210mm in PDF points (1pt = 1/72 inch) ──
const W = 841.89;
const H = 595.28;

// ── Brand Color Palette ──────────────────────────────────────────
const C_DARK_GREEN = rgb(0.11,  0.239, 0.227);  // #1c3d3a
const C_GOLD       = rgb(0.651, 0.533, 0.286);  // #a68849
const C_DARK       = rgb(0.114, 0.114, 0.122);  // #1d1d1f
const C_WHITE      = rgb(1, 1, 1);
const C_GRAY       = rgb(0.43,  0.43,  0.45);
const C_BG         = rgb(0.992, 0.98,  0.965);  // #fdfaf6
const C_ACCENT_LT  = rgb(0.98,  0.953, 0.91);   // #faf3e8
const C_ROW_EVEN   = rgb(0.97,  0.97,  0.97);
const C_ROW_BORDER = rgb(0.85,  0.85,  0.85);

type PDFPage = ReturnType<PDFDocument["getPage"]>;
type EmbeddedFont = Awaited<ReturnType<PDFDocument["embedFont"]>>;

// Helper: draw horizontally centered text
function drawCentered(page: PDFPage, text: string, y: number, font: EmbeddedFont, size: number, color = C_DARK) {
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (W - tw) / 2, y, font, size, color });
}

// Helper: wrap text to fit maxWidth
function wrapText(text: string, font: EmbeddedFont, size: number, maxWidth: number): string[] {
  // Replace newlines with spaces before wrapping
  const flat  = text.replace(/[\r\n]+/g, " ").trim();
  const words = flat.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Strip newlines and control characters — WinAnsi (StandardFonts) cannot encode them
const sanitize = (s: string) => (s || "").replace(/[\r\n\t]+/g, " ").trim();


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get("id");
    const origin = searchParams.get("origin") || "https://ibraglobalenglish.com";

    if (!certId) {
      return NextResponse.json({ error: "Certificate ID required" }, { status: 400 });
    }

    // ── Fetch certificate + related data ────────────────────────
    const supabase = createAdminClient();
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("*, students(*), reports(*)")
      .eq("id", certId)
      .single();

    if (error || !cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Fallback: fetch report separately if relation not populated
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

    // ── Fetch Canva template PDF ─────────────────────────────────
    const TEMPLATE_URL =
      "https://uszukipvrvjrgrikxfwh.supabase.co/storage/v1/object/public/certificate-templates/Salinan%20dari%20Blue%20and%20Gold%20Simple%20Elegant%20Certificate%20of%20Appreciation.pdf";
    const tplRes = await fetch(TEMPLATE_URL);
    if (!tplRes.ok) throw new Error("Gagal mengambil template PDF dari Supabase Storage");
    const templateBytes = await tplRes.arrayBuffer();

    // ── Load PDF & embed Standard fonts (no fontkit needed) ──────
    // StandardFonts are built into every PDF viewer — guaranteed to render correctly.
    const pdfDoc   = await PDFDocument.load(templateBytes);
    const fRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ── Derived data ─────────────────────────────────────────────
    const isCalistung  = cert.students?.program?.toLowerCase()?.includes("calistung");
    const studentName  = sanitize(((cert.students?.name  as string) || "")).toUpperCase();
    const tutorName    = sanitize((cert.tutor_name  as string) || "");
    const moduleName   = sanitize((cert.module_name as string) || "");
    const certNumber   = sanitize((cert.cert_number as string) || "");
    const grade        = sanitize((cert.grade       as string) || "");

    const issueDate    = new Date(cert.issue_date as string);

    const formattedDate = issueDate.toLocaleDateString(
      isCalistung ? "id-ID" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
    const completionText = isCalistung
      ? `telah menyelesaikan program Calistung ${moduleName}`
      : `for successfully completing the ${moduleName}`;
    const datePrefixText = isCalistung
      ? `Diterbitkan tanggal: ${formattedDate}`
      : `Issued on: ${formattedDate}`;

    const scores = {
      speaking:   Number(report?.speaking_score   || 0),
      grammar:    Number(report?.grammar_score    || 0),
      vocabulary: Number(report?.vocabulary_score || 0),
      active:     Number(report?.active_score     || 0),
    };
    const avgScore = Math.round(
      (scores.speaking + scores.grammar + scores.vocabulary + scores.active) / 4
    );
    const getGrade = (s: number) => (s >= 85 ? "A" : s >= 75 ? "B" : "C");

    // ═══════════════════════════════════════════════════════════
    // PAGE 1 — Overlay dynamic text on Canva template
    // CSS top% → pdf-lib y: y = H × (1 - top%)
    // ═══════════════════════════════════════════════════════════
    const page1 = pdfDoc.getPage(0);

    // Certificate number  (CSS top: 29%)
    if (certNumber) {
      drawCentered(page1, certNumber, H * 0.71, fBold, 12, C_DARK);
    }

    // Student name — large  (CSS top: 60.2%, transform: translate(-50%,-100%))
    drawCentered(page1, studentName, H * 0.42, fBold, 40, C_DARK_GREEN);

    // Completion text  (CSS top: 61.5%)
    drawCentered(page1, completionText, H * 0.385, fRegular, 16, C_DARK);

    // Date  (CSS top: 66%)
    drawCentered(page1, datePrefixText, H * 0.34, fRegular, 14, C_DARK);

    // Tutor name  (CSS top: 79.5%, left: 29.5%)
    if (tutorName) {
      const tutorCX = W * 0.295;
      page1.drawText(tutorName, {
        x: tutorCX - fBold.widthOfTextAtSize(tutorName, 13) / 2,
        y: H * 0.205,
        font: fBold, size: 13, color: C_DARK_GREEN,
      });
      page1.drawText("TUTOR", {
        x: tutorCX - fRegular.widthOfTextAtSize("TUTOR", 8) / 2,
        y: H * 0.168,
        font: fRegular, size: 8, color: C_GRAY,
      });
    }

    // QR code  (CSS bottom: 9%, center at left: 78.5%)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${origin}/verify/${cert.id}`)}`;
    const qrRes = await fetch(qrUrl);
    if (qrRes.ok) {
      const qrBytes = await qrRes.arrayBuffer();
      const qrImage = await pdfDoc.embedPng(new Uint8Array(qrBytes));
      const QR_SIZE = 72;
      page1.drawImage(qrImage, {
        x: W * 0.785 - QR_SIZE / 2,
        y: H * 0.085,
        width: QR_SIZE, height: QR_SIZE,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // PAGE 2 — Academic Transcript, generated from scratch
    // ═══════════════════════════════════════════════════════════
    const page2 = pdfDoc.addPage([W, H]);

    // Background
    page2.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C_BG });

    // Inner borders
    const BM = 11;
    page2.drawRectangle({ x: BM, y: BM, width: W - BM * 2, height: H - BM * 2, borderColor: C_DARK_GREEN, borderWidth: 1.4, color: undefined });
    const GM = 17;
    page2.drawRectangle({ x: GM, y: GM, width: W - GM * 2, height: H - GM * 2, borderColor: C_GOLD, borderWidth: 0.5, color: undefined });

    const CX = 44;
    const CW = W - 88;
    let cy = H - 46;

    // ── Header ──────────────────────────────────────────────────
    drawCentered(page2, "IBRA GLOBAL ENGLISH", cy, fBold, 17, C_DARK_GREEN);
    cy -= 14;
    drawCentered(page2, "Lembaga Kursus & Pelatihan (LKP) Dinas Pendidikan Bobong", cy, fRegular, 8.5, C_GOLD);
    cy -= 12;
    drawCentered(page2, "TRANSKRIP EVALUASI AKADEMIK (ACADEMIC TRANSCRIPT)", cy, fBold, 10.5, C_DARK);
    cy -= 7;
    page2.drawLine({ start: { x: CX, y: cy }, end: { x: W - CX, y: cy }, thickness: 1.1, color: C_GOLD });
    cy -= 14;

    // ── Metadata grid (2 columns) ────────────────────────────────
    const COL2X   = W / 2 + 10;
    const META_S  = 8.2;
    const LINE_H  = 13;
    const LABEL_W = 82;

    const drawMeta = (label: string, value: string, x: number, y: number) => {
      page2.drawText(label,       { x,              y, font: fBold,    size: META_S, color: C_DARK });
      page2.drawText(`: ${value}`,{ x: x + LABEL_W, y, font: fRegular, size: META_S, color: C_DARK });
    };

    drawMeta("Nama Siswa",      cert.students?.name || "-",                    CX,    cy);
    drawMeta("Nomor Sertifikat", certNumber || "-",                             COL2X, cy);
    cy -= LINE_H;
    drawMeta("Program Belajar", cert.students?.program || "-",                 CX,    cy);
    drawMeta("Tanggal Terbit",  issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), COL2X, cy);
    cy -= 16;

    // ── Grade table ──────────────────────────────────────────────
    const ROW_H  = 20;
    const CELL_S = 7.5;
    const colW   = [28, CW - 28 - 82 - 82, 82, 82];
    const colX   = [CX, CX + colW[0], CX + colW[0] + colW[1], CX + colW[0] + colW[1] + colW[2]];

    const subjects = isCalistung
      ? ["Kemampuan Membaca (Reading Skill)", "Kemampuan Menulis (Writing Skill)", "Kemampuan Berhitung (Math Skill)", "Keaktifan Siswa (Class Participation)"]
      : ["Speaking & Pronunciation", "Grammar & Structure", "Vocabulary & Comprehension", "Keaktifan Siswa (Class Participation)"];
    const scoreValues = [scores.speaking, scores.grammar, scores.vocabulary, scores.active];

    // Table header
    page2.drawRectangle({ x: CX, y: cy - 4, width: CW, height: ROW_H, color: C_DARK_GREEN });
    ["No", "Kompetensi Belajar (Subjects)", "Skor", "Predikat"].forEach((h, i) => {
      const hw = fBold.widthOfTextAtSize(h, CELL_S);
      page2.drawText(h, { x: colX[i] + colW[i] / 2 - hw / 2, y: cy + 2, font: fBold, size: CELL_S, color: C_WHITE });
    });
    cy -= ROW_H;

    // Table rows
    subjects.forEach((subj, idx) => {
      page2.drawRectangle({ x: CX, y: cy - 4, width: CW, height: ROW_H, color: idx % 2 === 0 ? C_ROW_EVEN : C_WHITE, borderColor: C_ROW_BORDER, borderWidth: 0.4 });
      const noW = fRegular.widthOfTextAtSize(`${idx + 1}`, CELL_S);
      page2.drawText(`${idx + 1}`, { x: colX[0] + colW[0] / 2 - noW / 2, y: cy + 2, font: fRegular, size: CELL_S, color: C_DARK });
      page2.drawText(subj,          { x: colX[1] + 4,                       y: cy + 2, font: fBold,    size: CELL_S, color: C_DARK });
      const sc  = `${scoreValues[idx]}`;
      const scW = fBold.widthOfTextAtSize(sc, CELL_S);
      page2.drawText(sc, { x: colX[2] + colW[2] / 2 - scW / 2, y: cy + 2, font: fBold, size: CELL_S, color: C_DARK });
      const gr  = getGrade(scoreValues[idx]);
      const grW = fBold.widthOfTextAtSize(gr, CELL_S);
      page2.drawText(gr, { x: colX[3] + colW[3] / 2 - grW / 2, y: cy + 2, font: fBold, size: CELL_S, color: C_DARK });
      cy -= ROW_H;
    });

    // Average row
    page2.drawRectangle({ x: CX, y: cy - 4, width: CW, height: ROW_H, color: C_ACCENT_LT, borderColor: C_GOLD, borderWidth: 0.5 });
    const avgLabel = "RATA-RATA / AVERAGE";
    page2.drawText(avgLabel, { x: colX[2] - fBold.widthOfTextAtSize(avgLabel, CELL_S) - 8, y: cy + 2, font: fBold, size: CELL_S, color: C_DARK_GREEN });
    const avgStr = `${avgScore}`;
    page2.drawText(avgStr, { x: colX[2] + colW[2] / 2 - fBold.widthOfTextAtSize(avgStr, CELL_S) / 2, y: cy + 2, font: fBold, size: CELL_S, color: C_DARK_GREEN });
    const finalGrade = grade || getGrade(avgScore);
    page2.drawText(finalGrade, { x: colX[3] + colW[3] / 2 - fBold.widthOfTextAtSize(finalGrade, CELL_S) / 2, y: cy + 2, font: fBold, size: CELL_S, color: C_DARK_GREEN });
    cy -= ROW_H + 10;

    // ── Footer: Notes | Sign-off ─────────────────────────────────
    const FOOTER_BOTTOM = 36;
    const FOOTER_H      = cy - FOOTER_BOTTOM;
    const NOTE_W        = CW * 0.62;
    const SIGN_X        = CX + NOTE_W + 16;
    const SIGN_W        = CW - NOTE_W - 16;
    const SIGN_CX       = SIGN_X + SIGN_W / 2;

    // Notes box
    page2.drawRectangle({ x: CX, y: FOOTER_BOTTOM, width: NOTE_W, height: FOOTER_H, color: C_WHITE, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
    page2.drawRectangle({ x: CX, y: FOOTER_BOTTOM, width: 3,      height: FOOTER_H, color: C_GOLD });
    page2.drawText("Catatan Guru (Tutor Review Notes)", { x: CX + 8, y: FOOTER_BOTTOM + FOOTER_H - 13, font: fBold, size: 6.8, color: C_DARK_GREEN });

    const noteText  = sanitize((report?.tutor_notes as string) ||
      "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus tingkatkan kompetensi bahasa Inggrisnya!");

    const noteLines = wrapText(`"${noteText}"`, fRegular, 7, NOTE_W - 20);
    noteLines.slice(0, 5).forEach((ln, i) => {
      page2.drawText(ln, { x: CX + 8, y: FOOTER_BOTTOM + FOOTER_H - 26 - i * 10, font: fRegular, size: 7, color: C_GRAY });
    });

    // Sign-off
    const signDate = `Bobong, ${issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    page2.drawText(signDate, { x: SIGN_CX - fRegular.widthOfTextAtSize(signDate, 7.5) / 2, y: FOOTER_BOTTOM + FOOTER_H - 14, font: fRegular, size: 7.5, color: C_GRAY });
    if (tutorName) {
      page2.drawText(tutorName, { x: SIGN_CX - fBold.widthOfTextAtSize(tutorName, 9) / 2, y: FOOTER_BOTTOM + 18, font: fBold, size: 9, color: C_DARK });
      page2.drawLine({ start: { x: SIGN_CX - 55, y: FOOTER_BOTTOM + 14 }, end: { x: SIGN_CX + 55, y: FOOTER_BOTTOM + 14 }, thickness: 0.6, color: C_ROW_BORDER });
      page2.drawText("Tutor Pendamping", { x: SIGN_CX - fRegular.widthOfTextAtSize("Tutor Pendamping", 7) / 2, y: FOOTER_BOTTOM + 4, font: fRegular, size: 7, color: C_GRAY });
    }

    // ── Serialize & return ───────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sertifikat-ige-${certNumber || cert.id}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[generate-certificate] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
