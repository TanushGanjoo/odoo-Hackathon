import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/budget
 * Get budget information and expense summary for a trip.
 */
router.get("/:tripId/budget", async (req: Request, res: Response) => {
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

    const expenses = await prisma.tripExpense.findMany({
      where: {
        tripId: trip.id,
      },
    });

    const totalSpent = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    const budgetLimit =
      trip.budgetLimit !== null
        ? Number(trip.budgetLimit)
        : null;

    const remaining =
      budgetLimit !== null
        ? budgetLimit - totalSpent
        : null;

    const percentageUsed =
      budgetLimit !== null && budgetLimit > 0
        ? (totalSpent / budgetLimit) * 100
        : null;

    const byCategory = {
      transport: 0,
      stay: 0,
      activities: 0,
      meals: 0,
      other: 0,
    };

    for (const expense of expenses) {
      byCategory[expense.category] += Number(expense.amount);
    }

    return res.json({
      budget: {
        limit: budgetLimit,
        spent: totalSpent,
        remaining,
        percentageUsed,
        byCategory,
      },
    });
  } catch (error) {
    console.error("GET budget error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PATCH /api/trips/:tripId/budget
 * Set or update the budget limit for a trip.
 */
router.patch("/:tripId/budget", async (req: Request, res: Response) => {
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

    const { budgetLimit } = req.body;

    if (budgetLimit === null) {
      const updatedTrip = await prisma.trip.update({
        where: {
          id: trip.id,
        },
        data: {
          budgetLimit: null,
        },
      });

      return res.json({
        budgetLimit: updatedTrip.budgetLimit,
      });
    }

    const numericBudget = Number(budgetLimit);

    if (!Number.isFinite(numericBudget) || numericBudget < 0) {
      return res.status(400).json({
        error: "Budget limit must be a valid non-negative number",
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id: trip.id,
      },
      data: {
        budgetLimit: numericBudget,
      },
    });

    return res.json({
      budgetLimit: updatedTrip.budgetLimit,
    });
  } catch (error) {
    console.error("PATCH budget error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;