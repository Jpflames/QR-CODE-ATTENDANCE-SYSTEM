import mongoose, { Schema } from "mongoose";

export interface IInstitution {
  name: string; // e.g. "Antigravity University"
  code: string; // e.g. "AGU"
  type: "university" | "college" | "polytechnic" | "secondary" | "corporate" | "training";
  address?: string;
  logoUrl?: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: {
      type: String,
      enum: ["university", "college", "polytechnic", "secondary", "corporate", "training"],
      required: true,
    },
    address: { type: String },
    logoUrl: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Institution = mongoose.models.Institution || mongoose.model<IInstitution>("Institution", InstitutionSchema);
