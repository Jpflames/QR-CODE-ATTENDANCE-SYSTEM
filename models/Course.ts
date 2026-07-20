import mongoose, { Schema } from "mongoose";

export interface ICourse {
  name: string; // e.g. "Software Engineering"
  code: string; // e.g. "CSC401"
  institutionId: string; // Ref to Institution
  departmentId: any; // Ref to Department
  level: number; // e.g. 400
  semester: "first" | "second";
  creditUnits: number; // e.g. 3
  createdAt?: Date;
  updatedAt?: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true, index: true },
    institutionId: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    level: { type: Number, required: true },
    semester: { type: String, enum: ["first", "second"], required: true },
    creditUnits: { type: Number, required: true, default: 3 },
  },
  { timestamps: true }
);

// Course code unique per institution
CourseSchema.index({ institutionId: 1, code: 1 }, { unique: true });

export const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
