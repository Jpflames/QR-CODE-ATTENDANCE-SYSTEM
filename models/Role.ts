import mongoose, { Schema } from "mongoose";

export interface IRole {
  name: string; // e.g., "super_admin", "institution_admin", "lecturer", "student"
  displayName: string; // e.g., "Super Admin"
  description?: string;
  permissions: string[]; // e.g., ["view_analytics", "manage_users", "record_attendance"]
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
