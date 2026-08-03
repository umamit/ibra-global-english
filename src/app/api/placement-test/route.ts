import { NextResponse } from "next/server";
import { placementSchema } from "@/lib/schemas/placementSchema";
import { savePlacementSubmission, sendPlacementWaNotification } from "./placementTestHelpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = placementSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
    }

    const { data, error } = await savePlacementSubmission(validation.data);
    if (error) {
      console.error("Gagal menyimpan hasil tes penempatan:", error);
      return NextResponse.json({ error: "Gagal menyimpan hasil tes. Silakan coba lagi." }, { status: 500 });
    }

    const { full_name, whatsapp_number, score, level } = validation.data;
    sendPlacementWaNotification(full_name, whatsapp_number, score, level);

    return NextResponse.json({ message: "Hasil tes berhasil disimpan", data }, { status: 201 });
  } catch (err: any) {
    console.error("API error pada tes penempatan:", err);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
