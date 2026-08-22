import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { clerkAuth } from "./middleware/auth";
import { prisma } from "./db/prisma";
import meRouter from "./routes/me";
import tripsRouter from "./routes/trips";
import stopsRouter from "./routes/stops";
import activitiesRouter from "./routes/activities";
import expensesRouter from "./routes/expenses";
import checklistRouter from "./routes/checklist";
import calendarRouter from "./routes/calendar";
import budgetRouter from "./routes/budget";
import sharingRouter from "./routes/sharing";

const app = express();
const PORT = env.port;

app.use(cors());
app.use(express.json());
app.use(clerkAuth);

app.use("/api/me", meRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/trips", stopsRouter);

app.use("/api/trips", activitiesRouter);
app.use("/api/trips", expensesRouter);

app.use("/api/trips", checklistRouter);
app.use("/api/trips", calendarRouter);

app.use("/api/trips", budgetRouter);
app.use("/api/trips", sharingRouter);

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
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});