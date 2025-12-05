import { useState } from 'react';
import type { VideoWithAnalytics } from '../types';
import { analyticsService } from '../services/analyticsService';

interface VideoCardProps {
  video: VideoWithAnalytics;
  onPlay: (video: VideoWithAnalytics) => void;
  onLikeUpdate?: (videoId: string, newLikes: number) => void;
}

export function VideoCard({ video, onPlay, onLikeUpdate }: VideoCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(video.likes);
  const [thumbnailError, setThumbnailError] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const optimisticLikes = localLikes + 1;
    setLocalLikes(optimisticLikes);

    try {
      const response = await analyticsService.likeVideo(video.id);
      setLocalLikes(response.likes);
      onLikeUpdate?.(video.id, response.likes);
    } catch (error) {
      // Revert on error
      setLocalLikes(video.likes);
      console.error('Failed to like video:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleClick = () => {
    onPlay(video);
  };

  const isLoading = video.status === 'PENDING' || video.status === 'PROCESSING';
  const isFailed = video.status === 'FAILED';

  const handleThumbnailError = () => {
    setThumbnailError(true);
    // Log for debugging backend issues
    console.warn('[VideoCard] Thumbnail failed to load (likely backend/S3 issue):', {
      videoId: video.id,
      thumbnailUrl: video.thumbnailUrl,
      s3_key_thumbnail: video.s3_key_thumbnail,
      s3_bucket_name: video.s3_bucket_name
    });
  };

  const DefaultThumbnail = () => (
    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-full h-full">
      <svg
        className="w-20 h-20 mb-2 opacity-60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <p className="text-xs font-medium">No Thumbnail</p>
    </div>
  );

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-2xl dark:hover:shadow-gray-900 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full bg-gray-50 dark:bg-gray-800">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{video.status}</p>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-center justify-center gap-3 h-full bg-red-50 dark:bg-red-900/20">
            <svg
              className="w-16 h-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Processing Failed</p>
          </div>
        ) : video.thumbnailUrl && !thumbnailError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleThumbnailError}
            onLoad={() => {
              // Reset error state if image loads successfully
              setThumbnailError(false);
            }}
          />
        ) : (
          <DefaultThumbnail />
        )}
        {/* Play overlay */}
        {!isLoading && !isFailed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
              <svg
                className="w-10 h-10 text-blue-600 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        {/* Status badge */}
        {video.status === 'COMPLETED' && (
          <div className="absolute top-2 right-2 bg-green-500 dark:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            Ready
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* Stats and Like Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="font-semibold">{video.views.toLocaleString()}</span>
          </div>

          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/like"
          >
            <svg
              className={`w-5 h-5 transition-transform ${localLikes > video.likes ? 'text-red-500 fill-current scale-110' : 'text-gray-600 dark:text-gray-400'} group-hover/like:scale-110`}
              fill={localLikes > video.likes ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-semibold">{localLikes.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

