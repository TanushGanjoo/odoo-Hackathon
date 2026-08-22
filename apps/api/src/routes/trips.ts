import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:id
 * Get one trip belonging to the authenticated user.
 */
router.get("/:id", async (req: Request, res: Response) => {
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
        id: String(req.params.id),
        userId: user.id,
      },
      include: {
        stops: {
          orderBy: {
            orderIndex: "asc",
          },
          include: {
            city: true,
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({
        error: "Trip not found",
      });
    }

    return res.json({ trip });
  } catch (error) {
    console.error("GET /api/trips/:id error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/trips
 * Create a new trip for the authenticated user.
 */
router.post("/", async (req: Request, res: Response) => {
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

    const {
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      budgetLimit,
      isPublic,
    } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Trip name is required",
      });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        coverPhoto,
        budgetLimit,
        isPublic: Boolean(isPublic),
      },
    });

    return res.status(201).json({ trip });
  } catch (error) {
    console.error("POST /api/trips error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PATCH /api/trips/:id
 * Update a trip belonging to the authenticated user.
 */
router.patch("/:id", async (req: Request, res: Response) => {
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

    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: String(req.params.id),
        userId: user.id,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({
        error: "Trip not found",
      });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      budgetLimit,
      isPublic,
    } = req.body;

    const trip = await prisma.trip.update({
      where: {
        id: existingTrip.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(budgetLimit !== undefined && { budgetLimit }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return res.json({
      trip,
    });
  } catch (error) {
    console.error("PATCH /api/trips/:id error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/trips/:id
 * Delete a trip belonging to the authenticated user.
 */
router.delete("/:id", async (req: Request, res: Response) => {
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

    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: String(req.params.id),
        userId: user.id,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({
        error: "Trip not found",
      });
    }

    await prisma.trip.delete({
      where: {
        id: existingTrip.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/trips/:id error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;