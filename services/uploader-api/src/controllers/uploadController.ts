import { Request, Response } from "express";
import { query } from "../config/db";
import axios from "axios";
import { config } from "../config/env";

interface MulterRequest extends Request {
  file?: any; // multer-s3 adds the 'file' object with 'location' and 'key'
}

export const getVideos = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT id, title, description, filename, s3_bucket_name, s3_key_original, s3_key_thumbnail, status, created_at, updated_at
      FROM videos
      ORDER BY created_at DESC
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const uploadVideo = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const { title, description } = req.body;
    const s3Key = req.file.key; // e.g., videos/uuid.mp4
    const bucket = req.file.bucket;
    const filename = req.file.originalname;

    // 1. Insert into RDS (videos table)
    // We return the ID to use it later
    const sql = `
      INSERT INTO videos (title, description, filename, s3_bucket_name, s3_key_original, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING id;
    `;

    const result = await query(sql, [
      title,
      description,
      filename,
      bucket,
      s3Key,
    ]);
    const videoId = result.rows[0].id;

    // 2. Initialize Analytics (0 views/likes)
    await query("INSERT INTO video_analytics (video_id) VALUES ($1)", [
      videoId,
    ]);

    // 3. Call Processor API (Fire & Forget or Await)
    // We send the videoId so the processor knows what to work on
    try {
      await axios.post(config.processorUrl, {
        videoId: videoId,
        s3Key: s3Key,
        bucket: bucket,
      });
      console.log(`Triggered processor for video ${videoId}`);
    } catch (procError) {
      console.error("Failed to trigger processor:", procError);
      // We don't fail the upload just because processor failed triggering.
      // But we might want to update status to 'FAILED_TRIGGER' if critical.
    }

    res.status(201).json({
      message: "Video uploaded successfully",
      videoId: videoId,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
