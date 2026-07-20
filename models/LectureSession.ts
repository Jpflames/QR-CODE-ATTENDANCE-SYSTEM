import mongoose, { Schema } from "mongoose";

export interface ILectureSession {
  courseId: any; // Ref to Course
  lecturerId: any; // Ref to Lecturer
  institutionId: string; // Ref to Institution
  title: string; // e.g. "Lecture 5: Microservices Architecture"
  status: "active" | "paused" | "closed";
  startTime: Date;
  endTime: Date;
  latitude?: number; // Classroom GPS latitude
  longitude?: number; // Classroom GPS longitude
  geofenceRadius: number; // Radius in meters (default 100m)
  totalAttendance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const LectureSessionSchema = new Schema<ILectureSession>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lecturerId: { type: Schema.Types.ObjectId, ref: "Lecturer", required: true, index: true },
    institutionId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["active", "paused", "closed"], default: "active", index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    geofenceRadius: { type: Number, default: 100 }, // 100 meters
    totalAttendance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LectureSession =
  mongoose.models.LectureSession || mongoose.model<ILectureSession>("LectureSession", LectureSessionSchema);
