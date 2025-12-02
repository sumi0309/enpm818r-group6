import express from "express";
import cors from "cors";
import { config } from "./config/env";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

// Middleware
app.use(cors()); // Allow frontend access
app.use(express.json());

// Routes
app.use("/api", uploadRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "uploader-api" });
});

app.listen(config.port, () => {
  console.log(`Uploader API listening on port ${config.port}`);
});
