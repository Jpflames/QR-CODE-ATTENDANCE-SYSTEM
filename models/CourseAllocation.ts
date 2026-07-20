import mongoose, { Schema } from "mongoose";

export interface ICourseAllocation {
  lecturerId: mongoose.Types.ObjectId; // Ref to Lecturer (ObjectId)
  courseId: mongoose.Types.ObjectId; // Ref to Course (ObjectId)
  academicSession: string; // e.g. "2025/2026"
  semester: "first" | "second";
  createdAt?: Date;
  updatedAt?: Date;
}

const CourseAllocationSchema = new Schema<ICourseAllocation>(
  {
    lecturerId: { type: Schema.Types.ObjectId, ref: "Lecturer", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    academicSession: { type: String, required: true, index: true },
    semester: { type: String, enum: ["first", "second"], required: true },
  },
  { timestamps: true }
);

// Unique course allocation per session/semester
CourseAllocationSchema.index({ courseId: 1, academicSession: 1, semester: 1 }, { unique: true });

export const CourseAllocation = mongoose.models.CourseAllocation || mongoose.model<ICourseAllocation>("CourseAllocation", CourseAllocationSchema);
