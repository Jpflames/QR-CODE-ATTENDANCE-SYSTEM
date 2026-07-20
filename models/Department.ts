import mongoose, { Schema } from "mongoose";

export interface IDepartment {
  name: string; // e.g. "Computer Science"
  code: string; // e.g. "CSC"
  institutionId: string; // Ref to Institution
  facultyId?: any; // Ref to Faculty
  createdAt?: Date;
  updatedAt?: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true },
    institutionId: { type: String, required: true, index: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", index: true },
  },
  { timestamps: true }
);

// Ensure name/code is unique per institution
DepartmentSchema.index({ institutionId: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ institutionId: 1, code: 1 }, { unique: true });

export const Department = mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);
