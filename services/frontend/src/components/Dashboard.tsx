import { useState, useEffect, useCallback, useMemo } from 'react';
import { uploadService } from '../services/uploadService';
import { analyticsService } from '../services/analyticsService';
import { combineVideoWithAnalytics } from '../utils/videoUtils';
import type { Video, VideoWithAnalytics } from '../types';
import { VideoCard } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';
import { UploadForm } from './UploadForm';
import { SkeletonCard } from './SkeletonCard';
import { useDarkMode } from '../hooks/useDarkMode';

type Tab = 'dashboard' | 'upload';
type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'most-liked';

export function Dashboard() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [videos, setVideos] = useState<VideoWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const videoList = await uploadService.getVideos();
      
      // Fetch analytics for each video
      const videosWithAnalytics = await Promise.all(
        videoList.map(async (video: Video) => {
          try {
            const analytics = await analyticsService.getAnalytics(video.id);
            return combineVideoWithAnalytics(video, analytics);
          } catch (err) {
            // If analytics not found, use defaults
            return combineVideoWithAnalytics(video, {
              views_count: 0,
              likes_count: 0,
            });
          }
        })
      );

      setVideos(videosWithAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Poll for videos with PENDING or PROCESSING status
  useEffect(() => {
    const hasPendingVideos = videos.some(
      (v) => v.status === 'PENDING' || v.status === 'PROCESSING'
    );

    if (!hasPendingVideos) {
      return; // No need to poll if all videos are completed/failed
    }

    // Poll every 5 seconds for status updates
    const interval = setInterval(() => {
      fetchVideos();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.map(v => `${v.id}-${v.status}`).join(',')]); // Only re-run when status changes

  const handleLikeUpdate = useCallback((videoId: string, newLikes: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, likes: newLikes } : v))
    );
  }, []);

  const handleViewUpdate = useCallback((videoId: string, newViews: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, views: newViews } : v))
    );
  }, []);

  const handleUploadSuccess = () => {
    // Refresh videos after upload
    fetchVideos();
    // Switch to dashboard tab
    setActiveTab('dashboard');
  };

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          (video.description && video.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most-viewed':
          return b.views - a.views;
        case 'most-liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return sorted;
  }, [videos, searchQuery, sortBy]);

  // Get sort option label
  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'most-viewed':
        return 'Most Viewed';
      case 'most-liked':
        return 'Most Liked';
      default:
        return 'Newest First';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-dropdown-container')) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            {/* Desktop Title / Mobile Play Logo */}
            <div className="flex items-center gap-3">
              {/* Play Button Logo - Always visible */}
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* Desktop: Title */}
              <div className="hidden sm:block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Video Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and analyze your video content</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Home Button */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium hidden sm:inline">Home</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-medium hidden sm:inline">Upload</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter Bar - Sticky */}
          {activeTab === 'dashboard' && (
            <div className="flex gap-2 sm:gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="block w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort Icon Button with Dropdown */}
              <div className="relative sort-dropdown-container">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Sort videos"
                >
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span className="text-sm font-medium hidden sm:inline">{getSortLabel(sortBy)}</span>
                </button>

                {/* Dropdown Menu */}
                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        setSortBy('newest');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === 'newest'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('oldest');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === 'oldest'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Oldest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('most-viewed');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === 'most-viewed'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Most Viewed
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('most-liked');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === 'most-liked'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Most Liked
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' ? (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Show skeleton cards matching the grid layout */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold">Error loading videos</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <button
                    onClick={fetchVideos}
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredAndSortedVideos.length === 0 ? (
              <div className="text-center py-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-blue-900/20">
                <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                  {searchQuery ? 'No videos match your search' : 'No videos found'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by uploading your first video'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Upload your first video
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                {searchQuery && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredAndSortedVideos.length} {filteredAndSortedVideos.length === 1 ? 'video' : 'videos'}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={setSelectedVideo}
                      onLikeUpdate={handleLikeUpdate}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onViewUpdate={handleViewUpdate}
        />
      )}
    </div>
  );
}

