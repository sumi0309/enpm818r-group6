export const config = {
  uploaderApiUrl: import.meta.env.VITE_UPLOADER_API_URL || 'http://localhost:8081',
  analyticsApiUrl: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8083',
  s3BucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
};

