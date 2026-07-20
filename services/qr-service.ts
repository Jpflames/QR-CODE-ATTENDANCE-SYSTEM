import crypto from "crypto";
import QRCodeLib from "qrcode";
import { connectToDatabase } from "@/lib/mongodb";
import { QRCode as QRCodeModel } from "@/models/QRCode";
import { LectureSession } from "@/models/LectureSession";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-key-for-qr-signing-and-validation";

export interface QRPayload {
  sessionId: string;
  courseId: string;
  generatedTime: number;
  expiryTime: number;
  randomToken: string;
  signature: string;
  hash: string;
}

/**
 * Generates a cryptographically signed QR code data URL and stores token in DB
 */
export async function generateSecureQRCode(params: {
  sessionId: string;
  courseId: string;
  durationSeconds?: number; // Default 15 seconds validity per rotation
}): Promise<{ qrDataUrl: string; payload: QRPayload }> {
  await connectToDatabase();

  const generatedTime = Date.now();
  const duration = (params.durationSeconds || 30) * 1000;
  const expiryTime = generatedTime + duration;
  const randomToken = crypto.randomBytes(16).toString("hex");

  // 1. Create Base Payload String
  const baseData = `${params.sessionId}:${params.courseId}:${generatedTime}:${expiryTime}:${randomToken}`;

  // 2. Generate HMAC SHA-256 Signature
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(baseData)
    .digest("hex");

  // 3. Generate SHA-256 Hash
  const hash = crypto
    .createHash("sha256")
    .update(`${baseData}:${signature}`)
    .digest("hex");

  const payload: QRPayload = {
    sessionId: params.sessionId,
    courseId: params.courseId,
    generatedTime,
    expiryTime,
    randomToken,
    signature,
    hash,
  };

  const payloadString = JSON.stringify(payload);

  // 4. Generate QR Code Data URL (base64 image)
  const qrDataUrl = await QRCodeLib.toDataURL(payloadString, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: {
      dark: "#0f172a", // Dark slate
      light: "#ffffff",
    },
  });

  // 5. Store in QRCode Collection
  await QRCodeModel.create({
    sessionId: params.sessionId,
    randomToken,
    signature,
    hash,
    expiresAt: new Date(expiryTime),
    isUsed: false,
  });

  return { qrDataUrl, payload };
}

/**
 * Validates a scanned QR payload string
 */
export async function validateQRPayload(payloadString: string): Promise<{
  valid: boolean;
  error?: string;
  payload?: QRPayload;
}> {
  try {
    let payload: QRPayload;
    try {
      payload = JSON.parse(payloadString);
    } catch {
      return { valid: false, error: "Invalid QR code format" };
    }

    const { sessionId, courseId, generatedTime, expiryTime, randomToken, signature, hash } = payload;

    if (!sessionId || !courseId || !randomToken || !signature || !hash) {
      return { valid: false, error: "Malformed QR code payload" };
    }

    // 1. Check Expiration Time
    if (Date.now() > expiryTime) {
      return { valid: false, error: "QR code has expired. Please scan the current code on display." };
    }

    // 2. Verify HMAC SHA-256 Signature
    const baseData = `${sessionId}:${courseId}:${generatedTime}:${expiryTime}:${randomToken}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(baseData)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Digital signature verification failed. Tampered QR code." };
    }

    // 3. Verify SHA-256 Hash
    const expectedHash = crypto
      .createHash("sha256")
      .update(`${baseData}:${signature}`)
      .digest("hex");

    if (hash !== expectedHash) {
      return { valid: false, error: "Hash integrity check failed." };
    }

    // 4. Verify Database Token Record
    await connectToDatabase();
    const qrRecord = await QRCodeModel.findOne({ randomToken });
    if (!qrRecord) {
      return { valid: false, error: "Unrecognized QR code token." };
    }

    // 5. Verify Lecture Session Status
    const session = await LectureSession.findById(sessionId);
    if (!session || session.status !== "active") {
      return { valid: false, error: "Lecture attendance session is currently paused or closed." };
    }

    return { valid: true, payload };
  } catch (error: any) {
    return { valid: false, error: error.message || "Failed to validate QR code" };
  }
}

/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula
 */
export function calculateGeofenceDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}
