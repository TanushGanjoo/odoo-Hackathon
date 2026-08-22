import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * PATCH /api/trips/:tripId/sharing
 * Enable or disable public sharing for a trip.
 */
router.patch("/:tripId/sharing", async (req: Request, res: Response) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: String(req.params.tripId),
        userId: user.id,
      },
    });

    if (!trip) {
      return res.status(404).json({
        error: "Trip not found",
      });
    }

    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        error: "isPublic must be a boolean",
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id: trip.id,
      },
      data: {
        isPublic,
      },
    });

    return res.json({
      sharing: {
        isPublic: updatedTrip.isPublic,
        shareToken: updatedTrip.isPublic
          ? updatedTrip.shareToken
          : null,
      },
    });
  } catch (error) {
    console.error("PATCH sharing error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/shared/trips/:shareToken
 * Get a publicly shared trip.
 *
 * This endpoint does not require authentication.
 */
router.get("/public/:shareToken", async (req: Request, res: Response) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        shareToken: String(req.params.shareToken),
        isPublic: true,
      },
      include: {
        stops: {
          orderBy: {
            orderIndex: "asc",
          },
          include: {
            city: true,
            activities: {
              include: {
                activity: true,
              },
            },
          },
        },
        expenses: true,
        checklist: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        error: "Shared trip not found",
      });
    }

    return res.json({
      trip,
    });
  } catch (error) {
    console.error("GET shared trip error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;