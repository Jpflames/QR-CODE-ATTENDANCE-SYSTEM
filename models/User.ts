import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string; // Avatar URL
  role: "super_admin" | "institution_admin" | "lecturer" | "student";
  institutionId?: string; // Optional reference to Institution ID (as string)
  status: "active" | "suspended" | "locked";
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "institution_admin", "lecturer", "student"],
      required: true,
      default: "student",
    },
    institutionId: { type: String }, // Links to Institution schema string ID
    status: {
      type: String,
      enum: ["active", "suspended", "locked"],
      required: true,
      default: "active",
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
UserSchema.index({ name: "text", email: "text" });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "user");
