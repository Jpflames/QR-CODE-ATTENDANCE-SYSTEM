import { NextRequest, NextResponse } from "next/server";
import { generateSecureQRCode } from "@/services/qr-service";
import { connectToDatabase } from "@/lib/mongodb";
import { LectureSession } from "@/models/LectureSession";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const courseId = searchParams.get("courseId");

    if (!sessionId || !courseId) {
      return NextResponse.json({ error: "sessionId and courseId are required" }, { status: 400 });
    }

    await connectToDatabase();

    const session = await LectureSession.findById(sessionId);
    if (!session || session.status !== "active") {
      return NextResponse.json({ error: "Session is no longer active" }, { status: 400 });
    }

    // Generate fresh signed QR token valid for 1 hour
    const { qrDataUrl, payload } = await generateSecureQRCode({
      sessionId,
      courseId,
      durationSeconds: 3600,
    });

    return NextResponse.json({
      qrDataUrl,
      expiresAt: payload.expiryTime,
      randomToken: payload.randomToken,
    });
  } catch (error: any) {
    console.error("QR rotation endpoint error:", error);
    return NextResponse.json({ error: error.message || "Failed to rotate QR code" }, { status: 500 });
  }
}
