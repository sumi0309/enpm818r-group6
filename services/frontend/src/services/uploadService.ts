import { config } from '../config/env';
import type { Video, UploadResponse } from '../types';

export const uploadService = {
  async getVideos(): Promise<Video[]> {
    const response = await fetch(`${config.uploaderApiUrl}/api/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return response.json();
  },

  async uploadVideo(formData: FormData): Promise<UploadResponse> {
    const response = await fetch(`${config.uploaderApiUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }
    return response.json();
  },
};

