import { clerkMiddleware, getAuth } from "@clerk/express";
import { env } from "../config/env";

export const clerkAuth = clerkMiddleware({
  publishableKey: env.clerkPublishableKey,
  secretKey: env.clerkSecretKey,
});

export { getAuth };