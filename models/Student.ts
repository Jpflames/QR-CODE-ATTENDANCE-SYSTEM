import mongoose, { Schema } from "mongoose";

export interface IStudent {
  userId: string; // Ref to User._id (String)
  matricNumber: string; // Unique student identifier
  institutionId: string; // Ref to Institution
  departmentId?: any; // Ref to Department
  programmeId?: any; // Ref to Programme
  currentLevel: number; // e.g. 100, 200, 300, 400
  registeredCourses: any[]; // Array of Course IDs
  fingerprintId?: string; // Device fingerprint verification
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    matricNumber: { type: String, required: true, unique: true, index: true },
    institutionId: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    programmeId: { type: Schema.Types.ObjectId, ref: "Programme", index: true },
    currentLevel: { type: Number, required: true, default: 100 },
    registeredCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    fingerprintId: { type: String },
  },
  { timestamps: true }
);

// Search indexing
StudentSchema.index({ matricNumber: "text" });

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
