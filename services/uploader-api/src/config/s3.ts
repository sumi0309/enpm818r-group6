import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { config } from "./env";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 Client (v3)
const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId || "",
    secretAccessKey: config.aws.secretAccessKey || "",
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3, // Pass the v3 client directly
    bucket: config.aws.bucketName,
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split(".").pop();
      const key = `videos/${uuidv4()}.${fileExtension}`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});
