import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        languagePref: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Failed to fetch profile:", error);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

export default router;