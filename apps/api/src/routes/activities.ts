import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/stops/:stopId/activities
 * Get all activities scheduled for a trip stop.
 */
router.get(
  "/:tripId/stops/:stopId/activities",
  async (req: Request, res: Response) => {
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

      const stop = await prisma.tripStop.findFirst({
        where: {
          id: String(req.params.stopId),
          tripId: trip.id,
        },
      });

      if (!stop) {
        return res.status(404).json({
          error: "Stop not found",
        });
      }

      const activities = await prisma.stopActivity.findMany({
        where: {
          stopId: stop.id,
        },
        orderBy: [
          {
            scheduledDate: "asc",
          },
          {
            scheduledTime: "asc",
          },
        ],
        include: {
          activity: true,
        },
      });

      return res.json({
        activities,
      });
    } catch (error) {
      console.error("GET activities error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/trips/:tripId/stops/:stopId/activities
 * Add an activity to a trip stop.
 */
router.post(
  "/:tripId/stops/:stopId/activities",
  async (req: Request, res: Response) => {
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

      const stop = await prisma.tripStop.findFirst({
        where: {
          id: String(req.params.stopId),
          tripId: trip.id,
        },
      });

      if (!stop) {
        return res.status(404).json({
          error: "Stop not found",
        });
      }

      const {
        activityId,
        scheduledDate,
        scheduledTime,
        customCost,
        notes,
      } = req.body;

      if (!activityId) {
        return res.status(400).json({
          error: "activityId is required",
        });
      }

      const activity = await prisma.activity.findUnique({
        where: {
          id: Number(activityId),
        },
      });

      if (!activity) {
        return res.status(404).json({
          error: "Activity not found",
        });
      }

      const stopActivity = await prisma.stopActivity.create({
        data: {
          stopId: stop.id,
          activityId: Number(activityId),
          scheduledDate: scheduledDate
            ? new Date(scheduledDate)
            : null,
          scheduledTime: scheduledTime
            ? scheduledTime
            : null,
          customCost:
            customCost !== undefined ? customCost : null,
          notes: notes ?? null,
        },
        include: {
          activity: true,
        },
      });

      return res.status(201).json({
        activity: stopActivity,
      });
    } catch (error) {
      console.error("POST activities error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

/**
 * PATCH /api/trips/:tripId/stops/:stopId/activities/:activityId
 * Update an activity scheduled for a trip stop.
 */
router.patch(
  "/:tripId/stops/:stopId/activities/:activityId",
  async (req: Request, res: Response) => {
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

      const stop = await prisma.tripStop.findFirst({
        where: {
          id: String(req.params.stopId),
          tripId: trip.id,
        },
      });

      if (!stop) {
        return res.status(404).json({
          error: "Stop not found",
        });
      }

      const existingActivity = await prisma.stopActivity.findFirst({
        where: {
          id: String(req.params.activityId),
          stopId: stop.id,
        },
      });

      if (!existingActivity) {
        return res.status(404).json({
          error: "Activity not found",
        });
      }

      const {
        activityId,
        scheduledDate,
        scheduledTime,
        customCost,
        notes,
      } = req.body;

      if (activityId !== undefined) {
        const activity = await prisma.activity.findUnique({
          where: {
            id: Number(activityId),
          },
        });

        if (!activity) {
          return res.status(404).json({
            error: "Activity not found",
          });
        }
      }

      const updatedActivity = await prisma.stopActivity.update({
        where: {
          id: existingActivity.id,
        },
        data: {
          ...(activityId !== undefined && {
            activityId: Number(activityId),
          }),
          ...(scheduledDate !== undefined && {
            scheduledDate: scheduledDate
              ? new Date(scheduledDate)
              : null,
          }),
          ...(scheduledTime !== undefined && {
            scheduledTime: scheduledTime
              ? scheduledTime
              : null,
          }),
          ...(customCost !== undefined && {
            customCost,
          }),
          ...(notes !== undefined && {
            notes,
          }),
        },
        include: {
          activity: true,
        },
      });

      return res.json({
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("PATCH activity error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);
/**
 * DELETE /api/trips/:tripId/stops/:stopId/activities/:activityId
 * Remove an activity from a trip stop.
 */
router.delete(
  "/:tripId/stops/:stopId/activities/:activityId",
  async (req: Request, res: Response) => {
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

      const stop = await prisma.tripStop.findFirst({
        where: {
          id: String(req.params.stopId),
          tripId: trip.id,
        },
      });

      if (!stop) {
        return res.status(404).json({
          error: "Stop not found",
        });
      }

      const existingActivity = await prisma.stopActivity.findFirst({
        where: {
          id: String(req.params.activityId),
          stopId: stop.id,
        },
      });

      if (!existingActivity) {
        return res.status(404).json({
          error: "Activity not found",
        });
      }

      await prisma.stopActivity.delete({
        where: {
          id: existingActivity.id,
        },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("DELETE activity error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);
export default router;