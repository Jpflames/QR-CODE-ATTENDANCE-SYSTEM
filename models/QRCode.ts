import mongoose, { Schema } from "mongoose";

export interface IQRCode {
  sessionId: any; // Ref to LectureSession
  randomToken: string;
  signature: string; // HMAC SHA-256 digital signature
  hash: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt?: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "LectureSession", required: true, index: true },
    randomToken: { type: String, required: true, unique: true },
    signature: { type: String, required: true },
    hash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const QRCode = mongoose.models.QRCode || mongoose.model<IQRCode>("QRCode", QRCodeSchema);
