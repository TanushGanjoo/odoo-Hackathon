import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { clerkAuth } from "./middleware/auth";
import { prisma } from "./db/prisma";

import meRouter from "./routes/me";
import tripsRouter from "./routes/trips";
import stopsRouter from "./routes/stops";
import activitiesRouter from "./routes/activities";
import calendarRouter from "./routes/calendar";
import checklistRouter from "./routes/checklist";
import expensesRouter from "./routes/expenses";
import profileRouter from "./routes/profile";

const app = express();
const PORT = env.port;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
  });
});

app.get("/api/db-health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "Database is connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.use(clerkAuth);

app.use("/api/me", meRouter);

app.use("/api/trips", tripsRouter);
app.use("/api/trips", stopsRouter);
app.use("/api/trips", activitiesRouter);
app.use("/api/trips", calendarRouter);
app.use("/api/trips", checklistRouter);
app.use("/api/trips", expensesRouter);

app.use("/api/profile", profileRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});