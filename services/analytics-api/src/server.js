"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "analytics-api" });
});
app.get("/api/analytics/:videoId", (req, res) => {
    const { videoId } = req.params;
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
//# sourceMappingURL=server.js.map