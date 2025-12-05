import { Router } from "express";
import { upload } from "../config/s3";
import { uploadVideo, getVideos } from "../controllers/uploadController";

const router = Router();

// Get all videos
router.get("/videos", getVideos);

// 'video' is the name of the form-data field expected from frontend
router.post("/upload", upload.single("video"), uploadVideo);

export default router;
