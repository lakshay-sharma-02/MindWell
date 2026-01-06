import { QueryClient } from '@tanstack/react-query';
import { CACHE_KEYS, cacheUtils } from '@/lib/queryClient';

/**
 * Cache invalidation utilities
 * Centralized management for clearing/updating cached data
 */

/**
 * Invalidate all blog-related caches
 */
export function invalidateBlogCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOGS });
}

/**
 * Invalidate specific blog cache
 */
export function invalidateBlog(queryClient: QueryClient, blogId: string) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOG(blogId) });
}

/**
 * Invalidate blog likes
 */
export function invalidateBlogLikes(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOG_LIKES });
}

/**
 * Invalidate all resource-related caches
 */
export function invalidateResourceCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCES });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCE_LIKES });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PURCHASED_RESOURCES });
}

/**
 * Invalidate specific resource cache
 */
export function invalidateResource(queryClient: QueryClient, resourceId: string) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCE(resourceId) });
}

/**
 * Invalidate all podcast caches
 */
export function invalidatePodcastCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PODCASTS });
}

/**
 * Invalidate all testimonial caches
 */
export function invalidateTestimonialCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TESTIMONIALS });
}

/**
 * Invalidate all FAQ caches
 */
export function invalidateFAQCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FAQS });
}

/**
 * Invalidate user data caches
 */
export function invalidateUserCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PROFILE });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.MOOD_LOGS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GRATITUDE_LOGS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BOOKINGS });
}

/**
 * Invalidate mood logs
 */
export function invalidateMoodLogs(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.MOOD_LOGS });
}

/**
 * Invalidate gratitude logs
 */
export function invalidateGratitudeLogs(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GRATITUDE_LOGS });
}

/**
 * Invalidate bookings
 */
export function invalidateBookings(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BOOKINGS });
}

/**
 * Invalidate comments for a post
 */
export function invalidateComments(queryClient: QueryClient, postId: string) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.COMMENTS(postId) });
}

/**
 * Invalidate all content caches (blogs, resources, podcasts)
 * Use after admin creates/edits content
 */
export function invalidateContentCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOGS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCES });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PODCASTS });
}

/**
 * Invalidate admin-related caches
 * Use after admin makes changes
 */
export function invalidateAdminCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOGS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCES });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PODCASTS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TESTIMONIALS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FAQS });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.STORIES });
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.SITE_SETTINGS });
}

/**
 * Invalidate site settings
 */
export function invalidateSiteSettings(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CACHE_KEYS.SITE_SETTINGS });
}

/**
 * Invalidate all caches
 * Use after login/logout or major app state changes
 */
export function invalidateAllCache(queryClient: QueryClient) {
  queryClient.clear();
}

/**
 * Group invalidation helpers
 */
export const invalidateBy = {
  user: (queryClient: QueryClient) => invalidateUserCache(queryClient),
  content: (queryClient: QueryClient) => invalidateContentCache(queryClient),
  admin: (queryClient: QueryClient) => invalidateAdminCache(queryClient),
};

/**
 * Refetch helpers (fetch fresh data instead of just invalidating)
 */
export const refetchBy = {
  user: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PROFILE });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.MOOD_LOGS });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.GRATITUDE_LOGS });
  },
  content: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BLOGS });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCES });
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.PODCASTS });
  },
  settings: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.SITE_SETTINGS });
  },
};

/**
 * Optimistic update helpers
 * Update cache immediately, then refetch
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (oldData: T | undefined) => T
) {
  queryClient.setQueryData<T>(queryKey, updater);
}

/**
 * Batch invalidation
 * Invalidate multiple related caches at once
 */
export function invalidateBatch(queryClient: QueryClient, ...keys: readonly unknown[][]) {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Smart invalidation based on action type
 */
export function invalidateAfterAction(
  queryClient: QueryClient,
  action: 'like' | 'unlike' | 'create' | 'update' | 'delete' | 'login' | 'logout',
  entityType: 'blog' | 'resource' | 'podcast' | 'comment' | 'user' | 'booking'
) {
  // Like/unlike actions
  if (action === 'like' || action === 'unlike') {
    if (entityType === 'blog') {
      invalidateBlogLikes(queryClient);
    } else if (entityType === 'resource') {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.RESOURCE_LIKES });
    }
    return;
  }

  // Create actions
  if (action === 'create') {
    if (entityType === 'comment') {
      // Comments fetch per-post, so this is handled by component
      return;
    }
    if (entityType === 'user' || entityType === 'booking') {
      invalidateUserCache(queryClient);
      return;
    }
    // Content creation - invalidate lists
    invalidateContentCache(queryClient);
    return;
  }

  // Update/delete actions
  if (action === 'update' || action === 'delete') {
    // Admin actions - invalidate all content
    invalidateContentCache(queryClient);
    invalidateAdminCache(queryClient);
    return;
  }

  // Login/logout
  if (action === 'login' || action === 'logout') {
    invalidateUserCache(queryClient);
    // Also clear IndexedDB caches
    if ('indexedDB' in window) {
      const request = indexedDB.deleteDatabase('MindWellCache');
      request.onsuccess = () => {
        console.log('IndexedDB cleared');
      };
    }
    return;
  }
}
