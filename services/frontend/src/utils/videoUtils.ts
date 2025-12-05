import type { Video, VideoWithAnalytics } from '../types';
import { config } from '../config/env';

export function getVideoUrl(video: Video): string {
  // Trim whitespace from bucket name to handle data quality issues
  const bucket = (config.s3BucketName || video.s3_bucket_name).trim();
  return `https://${bucket}.s3.amazonaws.com/${video.s3_key_original}`;
}

export function getThumbnailUrl(video: Video): string | null {
  if (!video.s3_key_thumbnail) {
    return null;
  }
  // Trim whitespace from bucket name to handle data quality issues
  const bucket = (config.s3BucketName || video.s3_bucket_name).trim();
  const thumbnailUrl = `https://${bucket}.s3.amazonaws.com/${video.s3_key_thumbnail}`;
  
  // Log for debugging backend issues
  if (bucket !== bucket.trim() || bucket.includes('\n') || bucket.includes('\r')) {
    console.warn('[Frontend] Detected whitespace in bucket name:', {
      original: video.s3_bucket_name,
      trimmed: bucket,
      videoId: video.id
    });
  }
  
  return thumbnailUrl;
}

export function combineVideoWithAnalytics(
  video: Video,
  analytics: { views_count: number; likes_count: number }
): VideoWithAnalytics {
  return {
    ...video,
    views: analytics.views_count,
    likes: analytics.likes_count,
    thumbnailUrl: getThumbnailUrl(video),
    videoUrl: getVideoUrl(video),
  };
}

