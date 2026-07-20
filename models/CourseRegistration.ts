import mongoose, { Schema } from "mongoose";

export interface ICourseRegistration {
  studentId: any; // Ref to Student (ObjectId)
  courseId: any; // Ref to Course (ObjectId)
  academicSession: string; // e.g. "2025/2026"
  semester: "first" | "second";
  status: "registered" | "dropped" | "approved";
  createdAt?: Date;
  updatedAt?: Date;
}

const CourseRegistrationSchema = new Schema<ICourseRegistration>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    academicSession: { type: String, required: true, index: true },
    semester: { type: String, enum: ["first", "second"], required: true },
    status: { type: String, enum: ["registered", "dropped", "approved"], default: "registered" },
  },
  { timestamps: true }
);

// Student can only register a course once per session/semester
CourseRegistrationSchema.index({ studentId: 1, courseId: 1, academicSession: 1, semester: 1 }, { unique: true });

export const CourseRegistration = mongoose.models.CourseRegistration || mongoose.model<ICourseRegistration>("CourseRegistration", CourseRegistrationSchema);
