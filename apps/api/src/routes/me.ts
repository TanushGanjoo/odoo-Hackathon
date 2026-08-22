import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },
      update: {},
      create: {
        clerkUserId: userId,
        email: `clerk-${userId}@placeholder.local`,
      },
    });

    return res.json({
      user,
    });
  } catch (error) {
    console.error("GET /api/me error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;