import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/checklist
 * Get all checklist items belonging to a trip.
 */
router.get("/:tripId/checklist", async (req: Request, res: Response) => {
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

    const items = await prisma.tripChecklistItem.findMany({
      where: {
        tripId: trip.id,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      items,
    });
  } catch (error) {
    console.error("GET checklist error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/trips/:tripId/checklist
 * Create a checklist item for a trip.
 */
router.post("/:tripId/checklist", async (req: Request, res: Response) => {
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

    const { item, isChecked } = req.body;

    if (!item || typeof item !== "string") {
      return res.status(400).json({
        error: "Item is required",
      });
    }

    const checklistItem = await prisma.tripChecklistItem.create({
      data: {
        tripId: trip.id,
        item,
        isChecked: Boolean(isChecked),
      },
    });

    return res.status(201).json({
      item: checklistItem,
    });
  } catch (error) {
    console.error("POST checklist error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PATCH /api/trips/:tripId/checklist/:itemId
 * Update a checklist item.
 */
router.patch("/:tripId/checklist/:itemId", async (req: Request, res: Response) => {
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

    const existingItem = await prisma.tripChecklistItem.findFirst({
      where: {
        id: String(req.params.itemId),
        tripId: trip.id,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: "Checklist item not found",
      });
    }

    const { item, isChecked } = req.body;

    if (item !== undefined && typeof item !== "string") {
      return res.status(400).json({
        error: "Item must be a string",
      });
    }

    const checklistItem = await prisma.tripChecklistItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        ...(item !== undefined && { item }),
        ...(isChecked !== undefined && {
          isChecked: Boolean(isChecked),
        }),
      },
    });

    return res.json({
      item: checklistItem,
    });
  } catch (error) {
    console.error("PATCH checklist error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
/**
 * DELETE /api/trips/:tripId/checklist/:itemId
 * Delete a checklist item.
 */
router.delete("/:tripId/checklist/:itemId", async (req: Request, res: Response) => {
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

    const existingItem = await prisma.tripChecklistItem.findFirst({
      where: {
        id: String(req.params.itemId),
        tripId: trip.id,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        error: "Checklist item not found",
      });
    }

    await prisma.tripChecklistItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE checklist error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
export default router;