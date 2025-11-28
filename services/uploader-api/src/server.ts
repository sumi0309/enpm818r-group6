import express from "express";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "analytics-api" });
});

// TODO: implement analytics logic reading from DB
app.get("/api/analytics/:videoId", (req, res) => {
  const { videoId } = req.params;
  // Stubbed metrics
  res.json({
    videoId,
    views: 123,
    likes: 10,
    watchTimeSeconds: 4567
  });
});

app.listen(port, () => {
  console.log(`Analytics API listening on port ${port}`);
});
