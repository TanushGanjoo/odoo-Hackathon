import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/calendar
 * Get all calendar events for a trip.
 */
router.get("/:tripId/calendar", async (req: Request, res: Response) => {
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

    const stops = await prisma.tripStop.findMany({
      where: {
        tripId: trip.id,
      },
      orderBy: {
        orderIndex: "asc",
      },
      include: {
        city: true,
        activities: {
          include: {
            activity: true,
          },
          orderBy: {
            scheduledDate: "asc",
          },
        },
      },
    });

    const events = [];

    // Add trip stops as calendar events.
    for (const stop of stops) {
      events.push({
        type: "stop",
        id: stop.id,
        title: stop.city.name,
        startDate: stop.startDate,
        endDate: stop.endDate,
        city: stop.city,
      });

      // Add scheduled activities.
      for (const stopActivity of stop.activities) {
        if (!stopActivity.scheduledDate) {
          continue;
        }

        events.push({
          type: "activity",
          id: stopActivity.id,
          title: stopActivity.activity.name,
          startDate: stopActivity.scheduledDate,
          endDate: stopActivity.scheduledDate,
          scheduledTime: stopActivity.scheduledTime,
          city: stop.city,
          activity: stopActivity.activity,
          notes: stopActivity.notes,
          cost: stopActivity.customCost ?? stopActivity.activity.cost,
        });
      }
    }

    return res.json({
      trip: {
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
      },
      events,
    });
  } catch (error) {
    console.error("GET calendar error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;