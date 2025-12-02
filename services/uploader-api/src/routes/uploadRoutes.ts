import { Router } from "express";
import { upload } from "../config/s3";
import { uploadVideo } from "../controllers/uploadController";

const router = Router();

// 'video' is the name of the form-data field expected from frontend
router.post("/upload", upload.single("video"), uploadVideo);

export default router;
