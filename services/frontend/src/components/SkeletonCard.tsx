export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Thumbnail skeleton with shimmer */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-shimmer"></div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-shimmer"></div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6 animate-shimmer"></div>
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-shimmer"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

