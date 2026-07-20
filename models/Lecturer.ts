import mongoose, { Schema } from "mongoose";

export interface ILecturer {
  userId: mongoose.Types.ObjectId; // Ref to User._id
  staffId: string; // Unique staff identifier
  institutionId: string; // Ref to Institution
  departmentId?: mongoose.Types.ObjectId; // Ref to Department
  assignedCourses: mongoose.Types.ObjectId[]; // Course IDs
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
