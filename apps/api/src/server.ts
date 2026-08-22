import express from "express";
import cors from "cors";
import { env } from "./config/env";
import profileRouter from "./routes/profile";

const app = express();
const PORT = env.port;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
  });
});

app.use("/api/profile", profileRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});