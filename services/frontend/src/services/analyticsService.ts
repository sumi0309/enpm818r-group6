import { config } from '../config/env';
import type { LikeResponse, ViewResponse, VideoAnalytics } from '../types';

export const analyticsService = {
  async likeVideo(videoId: string): Promise<LikeResponse> {
    const response = await fetch(`${config.analyticsApiUrl}/api/analytics/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });
    if (!response.ok) {
      throw new Error('Failed to like video');
    }
    return response.json();
  },

  async incrementView(videoId: string): Promise<ViewResponse> {
    const response = await fetch(`${config.analyticsApiUrl}/api/analytics/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });
    if (!response.ok) {
      throw new Error('Failed to increment view');
    }
    return response.json();
  },

  async getAnalytics(videoId: string): Promise<VideoAnalytics> {
    const response = await fetch(`${config.analyticsApiUrl}/api/analytics/${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return response.json();
  },
};

