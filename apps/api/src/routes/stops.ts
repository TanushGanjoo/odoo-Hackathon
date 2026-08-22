import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/stops
 * Get all stops belonging to a trip.
 */
router.get("/:tripId/stops", async (req: Request, res: Response) => {
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
      },
    });

    return res.json({
      stops,
    });
  } catch (error) {
    console.error("GET stops error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/trips/:tripId/stops
 * Add a city/stop to a trip.
 */
router.post("/:tripId/stops", async (req: Request, res: Response) => {
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

    const {
      cityId,
      orderIndex,
      startDate,
      endDate,
    } = req.body;

    if (!cityId || orderIndex === undefined || !startDate || !endDate) {
      return res.status(400).json({
        error: "cityId, orderIndex, startDate and endDate are required",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        error: "endDate cannot be before startDate",
      });
    }

    const city = await prisma.city.findUnique({
      where: {
        id: Number(cityId),
      },
    });

    if (!city) {
      return res.status(404).json({
        error: "City not found",
      });
    }

    const stop = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: Number(cityId),
        orderIndex: Number(orderIndex),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        city: true,
      },
    });

    return res.status(201).json({
      stop,
    });
  } catch (error) {
    console.error("POST stops error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PATCH /api/trips/:tripId/stops/:stopId
 * Update a stop belonging to the authenticated user's trip.
 */
router.patch("/:tripId/stops/:stopId", async (req: Request, res: Response) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
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

    const existingStop = await prisma.tripStop.findFirst({
      where: {
        id: String(req.params.stopId),
        tripId: trip.id,
      },
    });

    if (!existingStop) {
      return res.status(404).json({
        error: "Stop not found",
      });
    }

    const {
      cityId,
      orderIndex,
      startDate,
      endDate,
    } = req.body;

    if (startDate !== undefined && endDate !== undefined) {
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({
          error: "endDate cannot be before startDate",
        });
      }
    }

    if (cityId !== undefined) {
      const city = await prisma.city.findUnique({
        where: {
          id: Number(cityId),
        },
      });

      if (!city) {
        return res.status(404).json({
          error: "City not found",
        });
      }
    }

    const stop = await prisma.tripStop.update({
      where: {
        id: existingStop.id,
      },
      data: {
        ...(cityId !== undefined && {
          cityId: Number(cityId),
        }),
        ...(orderIndex !== undefined && {
          orderIndex: Number(orderIndex),
        }),
        ...(startDate !== undefined && {
          startDate: new Date(startDate),
        }),
        ...(endDate !== undefined && {
          endDate: new Date(endDate),
        }),
      },
      include: {
        city: true,
      },
    });

    return res.json({
      stop,
    });
  } catch (error) {
    console.error("PATCH stop error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
/**
 * DELETE /api/trips/:tripId/stops/:stopId
 * Delete a stop belonging to the authenticated user's trip.
 */
router.delete("/:tripId/stops/:stopId", async (req: Request, res: Response) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
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

    const existingStop = await prisma.tripStop.findFirst({
      where: {
        id: String(req.params.stopId),
        tripId: trip.id,
      },
    });

    if (!existingStop) {
      return res.status(404).json({
        error: "Stop not found",
      });
    }

    await prisma.tripStop.delete({
      where: {
        id: existingStop.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE stop error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;