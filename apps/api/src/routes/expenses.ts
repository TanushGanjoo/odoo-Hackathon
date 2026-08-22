import { Router, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /api/trips/:tripId/expenses
 * Get all expenses belonging to a trip.
 */
router.get("/:tripId/expenses", async (req: Request, res: Response) => {
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
      orderBy: {
        id: "desc",
      },
      include: {
        payer: true,
      },
    });

    return res.json({
      expenses,
    });
  } catch (error) {
    console.error("GET expenses error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/trips/:tripId/expenses
 * Create an expense for a trip.
 */
router.post("/:tripId/expenses", async (req: Request, res: Response) => {
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
      category,
      amount,
      paidBy,
      note,
    } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        error: "category and amount are required",
      });
    }

    const validCategories = [
      "transport",
      "stay",
      "activities",
      "meals",
      "other",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: "Invalid expense category",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        error: "Amount must be a valid non-negative number",
      });
    }

    let payerId: string | null = null;

    if (paidBy !== undefined && paidBy !== null) {
      const payer = await prisma.user.findUnique({
        where: {
          id: String(paidBy),
        },
      });

      if (!payer) {
        return res.status(404).json({
          error: "Payer not found",
        });
      }

      payerId = payer.id;
    }

    const expense = await prisma.tripExpense.create({
      data: {
        tripId: trip.id,
        category,
        amount: numericAmount,
        paidBy: payerId,
        note: note ?? null,
      },
      include: {
        payer: true,
      },
    });

    return res.status(201).json({
      expense,
    });
  } catch (error) {
    console.error("POST expenses error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PATCH /api/trips/:tripId/expenses/:expenseId
 * Update an expense belonging to the authenticated user's trip.
 */
router.patch("/:tripId/expenses/:expenseId", async (req: Request, res: Response) => {
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

    const existingExpense = await prisma.tripExpense.findFirst({
      where: {
        id: String(req.params.expenseId),
        tripId: trip.id,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    const {
      category,
      amount,
      paidBy,
      note,
    } = req.body;

    const validCategories = [
      "transport",
      "stay",
      "activities",
      "meals",
      "other",
    ];

    if (
      category !== undefined &&
      !validCategories.includes(category)
    ) {
      return res.status(400).json({
        error: "Invalid expense category",
      });
    }

    let numericAmount: number | undefined;

    if (amount !== undefined) {
      numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          error: "Amount must be a valid non-negative number",
        });
      }
    }

    let payerId: string | null | undefined;

    if (paidBy !== undefined) {
      if (paidBy === null) {
        payerId = null;
      } else {
        const payer = await prisma.user.findUnique({
          where: {
            id: String(paidBy),
          },
        });

        if (!payer) {
          return res.status(404).json({
            error: "Payer not found",
          });
        }

        payerId = payer.id;
      }
    }

    const expense = await prisma.tripExpense.update({
      where: {
        id: existingExpense.id,
      },
      data: {
        ...(category !== undefined && { category }),
        ...(numericAmount !== undefined && {
          amount: numericAmount,
        }),
        ...(paidBy !== undefined && {
          paidBy: payerId,
        }),
        ...(note !== undefined && {
          note,
        }),
      },
      include: {
        payer: true,
      },
    });

    return res.json({
      expense,
    });
  } catch (error) {
    console.error("PATCH expense error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
/**
 * DELETE /api/trips/:tripId/expenses/:expenseId
 * Delete an expense belonging to the authenticated user's trip.
 */
router.delete("/:tripId/expenses/:expenseId", async (req: Request, res: Response) => {
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

    const existingExpense = await prisma.tripExpense.findFirst({
      where: {
        id: String(req.params.expenseId),
        tripId: trip.id,
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    await prisma.tripExpense.delete({
      where: {
        id: existingExpense.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE expense error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
export default router;