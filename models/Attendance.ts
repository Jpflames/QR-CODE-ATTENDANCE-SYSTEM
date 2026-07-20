import mongoose, { Schema } from "mongoose";

export interface IAttendance {
  sessionId: any; // Ref to LectureSession
  courseId: any; // Ref to Course
  studentId: any; // Ref to Student
  institutionId: string;
  status: "PRESENT" | "LATE";
  deviceFingerprint?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  scannedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "LectureSession", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    institutionId: { type: String, required: true, index: true },
    status: { type: String, enum: ["PRESENT", "LATE"], default: "PRESENT" },
    deviceFingerprint: { type: String },
    ipAddress: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    distanceMeters: { type: Number },
    scannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to ensure ONE student cannot scan twice for the same session!
AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
