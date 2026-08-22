import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
};