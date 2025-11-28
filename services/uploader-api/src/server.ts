import express from "express";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "uploader-api" });
});

// TODO: real upload logic later
app.post("/api/upload", (req, res) => {
  res.json({ message: "Upload endpoint stub", body: req.body });
});

app.listen(port, () => {
  console.log(`Uploader API listening on port ${port}`);
});

