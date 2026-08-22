import express from "express";
import cors from "cors";
import { env } from "./config/env";

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

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});