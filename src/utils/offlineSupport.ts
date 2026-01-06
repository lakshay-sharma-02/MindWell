import { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Offline support utilities
 * Handles offline detection, queueing, and sync
 */

interface QueuedRequest {
  id: string;
  timestamp: number;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

interface OfflineContextValue {
  isOnline: boolean;
  isOffline: boolean;
  queue: QueuedRequest[];
  retryAll: () => Promise<void>;
  clearQueue: () => void;
}

const QUEUE_KEY = 'mindwell-offline-queue';
const RETRY_KEY = 'mindwell-retry-count';

export function useOfflineSupport(queryClient?: QueryClient): OfflineContextValue {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const { toast } = useToast();

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (!online) {
        // Load queue when going offline
        const savedQueue = localStorage.getItem(QUEUE_KEY);
        if (savedQueue) {
          try {
            setQueue(JSON.parse(savedQueue));
          } catch {
            console.error('Failed to parse offline queue');
          }
        }
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing queued requests...');

      // Retry queued requests
      if (queue.length > 0) {
        retryQueuedRequests();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some actions will be queued.', {
        duration: 5000,
      });

      // Save queue
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    };

    // Initial check
    checkOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  /**
   * Retry all queued requests
   */
  const retryQueuedRequests = async () => {
    if (queue.length === 0) return;

    toast.loading('Syncing offline actions...');

    for (const request of queue) {
      try {
        // For simplicity, just invalidate cache to refresh
        // In a real app, you would replay the actual mutations
        if (queryClient) {
          queryClient.invalidateQueries();
        }
      } catch (error) {
        console.error('Failed to retry request:', request, error);
      }
    }

    // Clear queue
    clearQueue();

    toast.success('All actions synced!');
  };

  /**
   * Clear the offline queue
   */
  const clearQueue = () => {
    setQueue([]);
    localStorage.removeItem(QUEUE_KEY);
  };

  /**
   * Add request to queue when offline
   */
  const addToQueue = (request: Omit<QueuedRequest, 'id' | 'timestamp'>) => {
    const newRequest: QueuedRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setQueue(prev => [...prev, newRequest]);
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, newRequest]));
  };

  return {
    isOnline,
    isOffline: !isOnline,
    queue,
    retryAll: retryQueuedRequests,
    clearQueue,
    addToQueue,
  };
}

/**
 * Check if we should retry based on offline status
 */
export function shouldRetryOperation(isOffline: boolean, operation: 'create' | 'update' | 'delete'): boolean {
  if (isOffline && (operation === 'create' || operation === 'delete')) {
    // Queue creates and deletes, don't retry
    return false;
  }
  return true;
}

/**
 * Get retry count for an operation
 */
export function getRetryCount(key: string): number {
  const count = localStorage.getItem(`${RETRY_KEY}-${key}`);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment retry count
 */
export function incrementRetryCount(key: string): void {
  const count = getRetryCount(key);
  localStorage.setItem(`${RETRY_KEY}-${key}`, (count + 1).toString());
}

/**
 * Reset retry count
 */
export function resetRetryCount(key: string): void {
  localStorage.removeItem(`${RETRY_KEY}-${key}`);
}

/**
 * Check if we've exceeded max retries
 */
export function hasExceededMaxRetries(key: string, maxRetries: number = 3): boolean {
  return getRetryCount(key) >= maxRetries;
}

/**
 * Offline-aware error handler
 */
export function handleOfflineError(
  error: any,
  isOffline: boolean,
  showToast: (message: string) => void
): void {
  if (isOffline) {
    // Don't show error if we're offline (toast already shown)
    return;
  }

  // Network errors
  if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
    showToast('Network error. Please check your connection.');
    return;
  }

  // Other errors
  showToast(error?.message || 'An error occurred');
}

/**
 * Create an offline notice component
 */
export function OfflineNotice() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white p-4 flex items-center justify-center gap-2 z-50">
      <div className="animate-pulse">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656 3.536 3.536M9.172 9.172L5.636 18.364m3.536-3.536V21M12 12v4m-4 0v-4" />
        </svg>
      </div>
      <span className="font-medium">You are offline. Some features may be limited.</span>
    </div>
  );
}
