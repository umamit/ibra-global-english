import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createAdminClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

// ── A4 Landscape: 297mm × 210mm in PDF points (1pt = 1/72 inch) ──
const W = 841.89;
const H = 595.28;

// ── Brand Color Palette (matches logo teal: --color-primary #216c7e) ──
const C_DARK_GREEN = rgb(0.129, 0.424, 0.494);  // #216c7e  — brand primary teal
const C_TEAL_DARK  = rgb(0.086, 0.302, 0.341);  // #164d57  — brand primary dark
const C_GOLD       = rgb(0.651, 0.533, 0.286);  // #a68849  — gold accent (unchanged)
const C_DARK       = rgb(0.114, 0.114, 0.122);  // #1d1d1f
const C_WHITE      = rgb(1, 1, 1);
const C_GRAY       = rgb(0.43,  0.43,  0.45);
const C_BG         = rgb(0.933, 0.965, 0.973);  // #eef6f8  — teal-50 light bg
const C_ACCENT_LT  = rgb(0.839, 0.929, 0.945);  // #d6edf2  — teal-100
const C_ROW_EVEN   = rgb(0.961, 0.980, 0.984);  // teal-25 subtle
const C_ROW_BORDER = rgb(0.80,  0.84,  0.85);

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

    // Certificate number — kecil, abu-abu, tidak mencolok
    if (certNumber) {
      drawCentered(page1, `Nomor : ${certNumber}`, H * 0.675, fRegular, 12, C_DARK);
    }

    // Student name — large
    drawCentered(page1, studentName, H * 0.42, fBold, 40, C_DARK);

    // Completion text — dekat di bawah garis horizontal
    drawCentered(page1, completionText, H * 0.355, fRegular, 15, C_DARK);

    // Date
    drawCentered(page1, datePrefixText, H * 0.305, fRegular, 13, C_DARK);

    // Tutor name  (CSS top: 79.5%, left: 29.5%)
    if (tutorName) {
      const tutorCX = W * 0.295;
      page1.drawText(tutorName, {
        x: tutorCX - fBold.widthOfTextAtSize(tutorName, 13) / 2,
        y: H * 0.205,
        font: fBold, size: 13, color: C_DARK,
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
    // PAGE 2 — Academic Transcript (redesigned)
    // ═══════════════════════════════════════════════════════════
    const page2 = pdfDoc.addPage([W, H]);

    // Load background image for Page 2
    const bgPath = path.join(
      process.cwd(),
      "public/assets/Salinan dari Salinan dari Blue and Gold Simple Elegant Certificate of Appreciation.png"
    );
    const bgBytes = fs.readFileSync(bgPath);
    const bgImage = await pdfDoc.embedPng(new Uint8Array(bgBytes));

    // Draw background image
    page2.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: W,
      height: H,
    });

    const TM     = 44;
    const TW     = W - 88;

    // Header starting y position
    let cy = H - 65;

    const hdr1 = "IBRA GLOBAL ENGLISH";
    page2.drawText(hdr1, { x: (W - fBold.widthOfTextAtSize(hdr1, 24)) / 2, y: cy, font: fBold, size: 24, color: C_DARK_GREEN });
    cy -= 15;

    const hdr2 = "Lembaga Kursus & Pelatihan (LKP)  —  Dinas Pendidikan Bobong";
    page2.drawText(hdr2, { x: (W - fRegular.widthOfTextAtSize(hdr2, 9)) / 2, y: cy, font: fRegular, size: 9, color: C_DARK });
    cy -= 14;

    const hdr3 = "TRANSKRIP EVALUASI AKADEMIK  /  ACADEMIC TRANSCRIPT";
    page2.drawText(hdr3, { x: (W - fBold.widthOfTextAtSize(hdr3, 10.5)) / 2, y: cy, font: fBold, size: 10.5, color: C_TEAL_DARK });
    cy -= 26;

    // ── Student info panel (no background) ──
    const COL2X2 = W / 2 + 10;
    const IS     = 10.5;
    const LW2    = 108;

    const drawInfo = (label: string, val: string, x: number, y: number) => {
      page2.drawText(label,      { x,          y, font: fBold,    size: IS, color: C_DARK });
      page2.drawText(`: ${val}`, { x: x + LW2, y, font: fRegular, size: IS, color: C_DARK });
    };
    drawInfo("Nama Siswa",      cert.students?.name    || "-", TM + 12, cy - 18);
    drawInfo("Program Belajar", cert.students?.program || "-", TM + 12, cy - 36);
    drawInfo("No. Sertifikat",  certNumber             || "-", COL2X2,  cy - 18);
    drawInfo("Tanggal Terbit",  issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), COL2X2,  cy - 36);

    // ── Grade table ───────────────────────────────────────────
    const ROW_H  = 30;
    const CELL_S = 11;
    const colW   = [36, TW - 36 - 96 - 96, 96, 96];
    const colX   = [TM, TM + colW[0], TM + colW[0] + colW[1], TM + colW[0] + colW[1] + colW[2]];

    const subjects = isCalistung
      ? ["Kemampuan Membaca (Reading Skill)", "Kemampuan Menulis (Writing Skill)", "Kemampuan Berhitung (Math Skill)", "Keaktifan Siswa (Class Participation)"]
      : ["Speaking & Pronunciation", "Grammar & Structure", "Vocabulary & Comprehension", "Keaktifan Siswa (Class Participation)"];
    const scoreValues = [scores.speaking, scores.grammar, scores.vocabulary, scores.active];

    let ty = cy - 52 - 22;

    // Table header row (no fill, just border, dark text)
    page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
    ["No", "Kompetensi Belajar (Subjects)", "Skor", "Predikat"].forEach((h, i) => {
      const hw = fBold.widthOfTextAtSize(h, CELL_S);
      page2.drawText(h, { x: colX[i] + colW[i] / 2 - hw / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
    });
    ty -= ROW_H;

    // Data rows (no background fill)
    subjects.forEach((subj, idx) => {
      page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
      const noStr = `${idx + 1}`;
      page2.drawText(noStr, { x: colX[0] + colW[0] / 2 - fRegular.widthOfTextAtSize(noStr, CELL_S) / 2, y: ty - ROW_H + 15, font: fRegular, size: CELL_S, color: C_DARK });
      page2.drawText(subj,  { x: colX[1] + 8, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
      const sc = `${scoreValues[idx]}`;
      page2.drawText(sc, { x: colX[2] + colW[2] / 2 - fBold.widthOfTextAtSize(sc, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
      const gr = getGrade(scoreValues[idx]);
      page2.drawText(gr, { x: colX[3] + colW[3] / 2 - fBold.widthOfTextAtSize(gr, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_DARK });
      ty -= ROW_H;
    });

    // Average row (no background fill)
    page2.drawRectangle({ x: TM, y: ty - ROW_H + 8, width: TW, height: ROW_H, borderColor: C_GOLD, borderWidth: 0.8 });
    const avgLabel = "NILAI RATA-RATA / AVERAGE";
    page2.drawText(avgLabel, { x: colX[2] - fBold.widthOfTextAtSize(avgLabel, CELL_S) - 10, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
    const avgStr = `${avgScore}`;
    page2.drawText(avgStr, { x: colX[2] + colW[2] / 2 - fBold.widthOfTextAtSize(avgStr, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
    const finalGrade = grade || getGrade(avgScore);
    page2.drawText(finalGrade, { x: colX[3] + colW[3] / 2 - fBold.widthOfTextAtSize(finalGrade, CELL_S) / 2, y: ty - ROW_H + 15, font: fBold, size: CELL_S, color: C_TEAL_DARK });
    ty -= ROW_H;

    // ── Footer: Notes (left) + Sign-off (right) ───────────────
    const FOOT_TOP = ty - 14;
    const FOOT_BOT = 28;
    const FOOT_H   = FOOT_TOP - FOOT_BOT;
    const NOTE_W   = W * 0.60;
    const SIGN_X2  = NOTE_W + 6;
    const SIGN_W2  = W - NOTE_W - 6;
    const SIGN_CX2 = SIGN_X2 + SIGN_W2 / 2;

    // Notes: outline only, no solid backgrounds
    page2.drawRectangle({ x: TM, y: FOOT_BOT, width: NOTE_W - TM, height: FOOT_H, borderColor: C_ROW_BORDER, borderWidth: 0.5 });
    page2.drawText("Catatan Guru (Tutor Review Notes)", { x: TM + 12, y: FOOT_BOT + FOOT_H - 17, font: fBold, size: 10, color: C_TEAL_DARK });

    const noteText = sanitize((report?.tutor_notes as string) ||
      "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus tingkatkan kompetensi bahasa Inggrisnya!");
    const noteLines = wrapText(`"${noteText}"`, fRegular, 9.5, NOTE_W - TM - 26);
    noteLines.slice(0, 10).forEach((ln, i) => {
      page2.drawText(ln, { x: TM + 12, y: FOOT_BOT + FOOT_H - 33 - i * 14, font: fRegular, size: 9.5, color: C_DARK });
    });

    // Sign-off
    const signDate = `Bobong, ${issueDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    const SIGN_MID = FOOT_BOT + FOOT_H / 2;

    page2.drawText(signDate, {
      x: SIGN_CX2 - fRegular.widthOfTextAtSize(signDate, 9.5) / 2,
      y: SIGN_MID + 28,
      font: fRegular, size: 9.5, color: C_DARK,
    });
    if (tutorName) {
      page2.drawText(tutorName, {
        x: SIGN_CX2 - fBold.widthOfTextAtSize(tutorName, 12) / 2,
        y: SIGN_MID - 6,
        font: fBold, size: 12, color: C_DARK,
      });
      page2.drawLine({
        start: { x: SIGN_CX2 - 72, y: SIGN_MID - 15 },
        end:   { x: SIGN_CX2 + 72, y: SIGN_MID - 15 },
        thickness: 0.8, color: C_ROW_BORDER,
      });
      page2.drawText("Tutor Pendamping", {
        x: SIGN_CX2 - fRegular.widthOfTextAtSize("Tutor Pendamping", 9) / 2,
        y: SIGN_MID - 28,
        font: fRegular, size: 9, color: C_GRAY,
      });
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
