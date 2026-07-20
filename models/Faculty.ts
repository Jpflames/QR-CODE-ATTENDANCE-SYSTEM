import mongoose, { Schema } from "mongoose";

export interface IFaculty {
  name: string; // e.g. "Faculty of Science"
  code: string; // e.g. "FOS"
  institutionId: string; // Ref to Institution
  createdAt?: Date;
  updatedAt?: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true },
    institutionId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Unique faculty code per institution
FacultySchema.index({ institutionId: 1, name: 1 }, { unique: true });
FacultySchema.index({ institutionId: 1, code: 1 }, { unique: true });

export const Faculty = mongoose.models.Faculty || mongoose.model<IFaculty>("Faculty", FacultySchema);
