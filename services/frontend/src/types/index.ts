export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  s3_bucket_name: string;
  s3_key_original: string;
  s3_key_thumbnail: string | null;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalytics {
  video_id: string;
  views_count: number;
  likes_count: number;
  last_updated: string;
}

export interface VideoWithAnalytics extends Video {
  views: number;
  likes: number;
  thumbnailUrl: string | null;
  videoUrl: string;
}

export interface UploadResponse {
  message: string;
  videoId: string;
  status: VideoStatus;
}

export interface LikeResponse {
  message: string;
  likes: number;
}

export interface ViewResponse {
  message: string;
  views: number;
}

