import { useEffect, useRef } from 'react';
import type { VideoWithAnalytics } from '../types';
import { analyticsService } from '../services/analyticsService';

interface VideoPlayerProps {
  video: VideoWithAnalytics | null;
  onClose: () => void;
  onViewUpdate?: (videoId: string, newViews: number) => void;
}

export function VideoPlayer({ video, onClose, onViewUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewIncrementedRef = useRef<string | null>(null);
  const onViewUpdateRef = useRef(onViewUpdate);

  // Keep ref updated without causing re-renders
  useEffect(() => {
    onViewUpdateRef.current = onViewUpdate;
  }, [onViewUpdate]);

  useEffect(() => {
    // Only increment view if we have a video and haven't incremented for this specific video ID
    if (!video) return;

    const currentVideoId = video.id;
    
    // Check if we've already incremented for this video
    if (viewIncrementedRef.current === currentVideoId) {
      return; // Already incremented, don't do it again
    }

    // Mark as incremented immediately to prevent double calls
    viewIncrementedRef.current = currentVideoId;
    
    analyticsService
      .incrementView(currentVideoId)
      .then((response) => {
        // Use ref to avoid dependency on onViewUpdate
        onViewUpdateRef.current?.(currentVideoId, response.views);
      })
      .catch((error) => {
        console.error('Failed to increment view:', error);
        // Reset on error so it can retry if needed
        if (viewIncrementedRef.current === currentVideoId) {
          viewIncrementedRef.current = null;
        }
      });

    // Cleanup: only reset when video ID actually changes (not on every render)
    return () => {
      // Only reset if we're switching to a different video
      // This allows reopening the same video to increment view again
      if (viewIncrementedRef.current === currentVideoId) {
        viewIncrementedRef.current = null;
      }
    };
  }, [video?.id]); // Only depend on video.id - removed onViewUpdate from dependencies

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{video.title}</h2>
            {video.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{video.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Video */}
        <div className="relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            className="w-full h-auto max-h-[70vh]"
            autoPlay
            onError={(e) => {
              console.error('[VideoPlayer] Video load error:', {
                videoId: video.id,
                videoUrl: video.videoUrl,
                error: e
              });
            }}
            onLoadStart={() => {
              console.log('[VideoPlayer] Video loading started:', video.videoUrl);
            }}
          />
        </div>

        {/* Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          {video.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">{video.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
              <span className="font-semibold text-gray-900 dark:text-gray-100">{video.views.toLocaleString()}</span>
              <span className="text-gray-600 dark:text-gray-400">views</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{video.likes.toLocaleString()}</span>
              <span className="text-gray-600 dark:text-gray-400">likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

