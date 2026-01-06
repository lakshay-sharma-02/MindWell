import { QueryClient } from '@tanstack/react-query';

/**
 * Enhanced TanStack Query configuration with aggressive caching
 */

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Time in milliseconds
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache before garbage collection
        refetchOnWindowFocus: false, // Don't refetch on window focus (better UX)
        refetchOnReconnect: true, // Refetch on network reconnect
        refetchOnMount: false, // Don't refetch on mount if data exists
        retry: (failureCount, error: any) => {
          // Don't retry on 401 (unauthorized) or 404 (not found)
          if (error?.status === 401 || error?.status === 404) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
      },
      mutations: {
        retry: 1, // Retry mutations once
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
};

// Singleton query client instance
export const queryClient = createQueryClient();

/**
 * Cache invalidation keys
 * Organized by feature for easy invalidation
 */
export const CACHE_KEYS = {
  // Blogs
  BLOGS: ['blogs'] as const,
  BLOG: (id: string) => ['blogs', id] as const,
  BLOG_SLUG: (slug: string) => ['blogs', 'slug', slug] as const,
  BLOG_LIKES: ['blog-likes'] as const,
  BLOG_LIKE: (blogId: string) => ['blog-likes', blogId] as const,

  // Resources
  RESOURCES: ['resources'] as const,
  RESOURCE: (id: string) => ['resources', id] as const,
  RESOURCE_SLUG: (slug: string) => ['resources', 'slug', slug] as const,
  RESOURCE_LIKES: ['resource-likes'] as const,
  PURCHASED_RESOURCES: ['purchased-resources'] as const,

  // Podcasts
  PODCASTS: ['podcasts'] as const,
  PODCAST: (id: string) => ['podcasts', id] as const,

  // Testimonials
  TESTIMONIALS: ['testimonials'] as const,
  TESTIMONIAL: (id: string) => ['testimonials', id] as const,

  // FAQs
  FAQS: ['faqs'] as const,
  FAQ: (id: string) => ['faqs', id] as const,

  // Services & Bookings
  SERVICES: ['services'] as const,
  BOOKINGS: ['bookings'] as const,
  BOOKING: (id: string) => ['bookings', id] as const,

  // User data
  PROFILE: ['profile'] as const,
  USER_ROLES: ['user-roles'] as const,

  // Mood & Gratitude
  MOOD_LOGS: ['mood-logs'] as const,
  GRATITUDE_LOGS: ['gratitude-logs'] as const,

  // Comments
  COMMENTS: (postId: string) => ['comments', postId] as const,

  // Stories
  STORIES: ['stories'] as const,
  STORY: (id: string) => ['stories', id] as const,

  // Settings
  SITE_SETTINGS: ['site-settings'] as const,
} as const;

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate multiple cache keys
   */
  invalidate: (queryClient: QueryClient, ...keys: readonly unknown[][]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  },

  /**
   * Invalidate all caches for a feature
   */
  invalidateFeature: (queryClient: QueryClient, feature: 'blogs' | 'resources' | 'podcasts' | 'user' | 'admin') => {
    const keys = {
      blogs: CACHE_KEYS.BLOGS,
      resources: CACHE_KEYS.RESOURCES,
      podcasts: CACHE_KEYS.PODCASTS,
      user: CACHE_KEYS.PROFILE,
      admin: CACHE_KEYS.SITE_SETTINGS,
    };

    cacheUtils.invalidate(queryClient, keys[feature] as any);
  },

  /**
   * Refetch specific cache keys (fetch fresh data)
   */
  refetch: (queryClient: QueryClient, keys: readonly unknown[][]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key, refetchType: 'active' });
    });
  },

  /**
   * Clear all caches
   */
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  /**
   * Prefetch data
   */
  prefetch: async (queryClient: QueryClient, keys: readonly unknown[], fetcher: () => Promise<any>) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: keys,
        queryFn: fetcher,
        staleTime: 60 * 1000, // Consider fresh for 1 minute
      });
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  },

  /**
   * Set cache data manually
   */
  setData: (queryClient: QueryClient, keys: readonly unknown[], data: unknown) => {
    queryClient.setQueryData(keys, data);
  },

  /**
   * Get cache data
   */
  getData: <T>(queryClient: QueryClient, keys: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(keys);
  },
};

/**
 * Prefetch strategies for common use cases
 */
export const prefetchStrategies = {
  /**
   * Prefetch all blogs
   */
  prefetchBlogs: async (queryClient: QueryClient, fetcher: () => Promise<any[]>) => {
    await cacheUtils.prefetch(queryClient, CACHE_KEYS.BLOGS, fetcher);
  },

  /**
   * Prefetch all resources
   */
  prefetchResources: async (queryClient: QueryClient, fetcher: () => Promise<any[]>) => {
    await cacheUtils.prefetch(queryClient, CACHE_KEYS.RESOURCES, fetcher);
  },

  /**
   * Prefetch all podcasts
   */
  prefetchPodcasts: async (queryClient: QueryClient, fetcher: () => Promise<any[]>) => {
    await cacheUtils.prefetch(queryClient, CACHE_KEYS.PODCASTS, fetcher);
  },

  /**
   * Prefetch user data
   */
  prefetchUserData: async (queryClient: QueryClient, fetchers: {
    profile: () => Promise<any>;
    moodLogs: () => Promise<any[]>;
    gratitudeLogs: () => Promise<any[]>;
  }) => {
    await Promise.all([
      cacheUtils.prefetch(queryClient, CACHE_KEYS.PROFILE, fetchers.profile),
      cacheUtils.prefetch(queryClient, CACHE_KEYS.MOOD_LOGS, fetchers.moodLogs),
      cacheUtils.prefetch(queryClient, CACHE_KEYS.GRATITUDE_LOGS, fetchers.gratitudeLogs),
    ]);
  },
};

/**
 * React Query hooks with built-in caching
 * Use these for common queries to ensure consistent caching behavior
 */
export const useCachedQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
  }
) => {
  // This is a wrapper - actual hook usage is in components
  // The main benefit is organized cache keys and shared config
  // Import this file and use CACHE_KEYS for query keys
  return {
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  };
};
