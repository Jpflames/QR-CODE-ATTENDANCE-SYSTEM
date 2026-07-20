import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { connectToDatabase } from "./mongodb";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dummy";
const client = new MongoClient(MONGODB_URI);
const db = client.db();

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: false,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_development_only_please_change_in_production",
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Require manual sign in (allows verification checks)
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      institutionId: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      failedLoginAttempts: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      lockoutUntil: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session age every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes caching
    },
  },
  trustedOrigins: [
    getBaseURL(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    process.env.NEXT_PUBLIC_APP_URL || ""
  ].filter(Boolean),
  baseURL: getBaseURL(),
});
