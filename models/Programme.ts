import mongoose, { Schema } from "mongoose";

export interface IProgramme {
  name: string; // e.g. "B.Sc. Computer Science"
  code: string; // e.g. "BSC-CSC"
  departmentId: any; // Ref to Department
  durationYears: number; // e.g. 4
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgrammeSchema = new Schema<IProgramme>(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    durationYears: { type: Number, required: true, default: 4 },
  },
  { timestamps: true }
);

// Unique code per department
ProgrammeSchema.index({ departmentId: 1, code: 1 }, { unique: true });

export const Programme = mongoose.models.Programme || mongoose.model<IProgramme>("Programme", ProgrammeSchema);
