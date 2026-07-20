import mongoose, { Schema } from "mongoose";

export interface IAuditLog {
  userId?: mongoose.Types.ObjectId; // Optional user who performed the action
  action: string; // e.g. "LOGIN", "LOGOUT", "ATTENDANCE_RECORDED", "QR_GENERATED"
  status: "SUCCESS" | "FAILURE";
  details: string; // JSON or plain description of the event details
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    status: { type: String, enum: ["SUCCESS", "FAILURE"], required: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time for logs
  }
);

// Compound indexing for analytics queries
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
