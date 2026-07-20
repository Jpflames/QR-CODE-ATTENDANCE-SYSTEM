import mongoose, { Schema } from "mongoose";

export interface ILecturer {
  userId: string; // Ref to User._id (String)
  staffId: string; // Unique staff identifier
  institutionId: string; // Ref to Institution
  departmentId?: any; // Ref to Department
  assignedCourses: any[]; // Course IDs
  createdAt?: Date;
  updatedAt?: Date;
}

const LecturerSchema = new Schema<ILecturer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    staffId: { type: String, required: true, unique: true, index: true },
    institutionId: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// Search indexing
LecturerSchema.index({ staffId: "text" });

export const Lecturer = mongoose.models.Lecturer || mongoose.model<ILecturer>("Lecturer", LecturerSchema);
