import { useState, useEffect, useCallback } from 'react';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
};

interface UseLocalStorageCacheOptions<T> {
  key: string;
  ttl?: number; // Default: 5 minutes
  initialValue?: T;
}

export function useLocalStorageCache<T>({
  key,
  ttl = 5 * 60 * 1000, // 5 minutes default
  initialValue,
}: UseLocalStorageCacheOptions<T>) {
  const [data, setData] = useState<T | null>(initialValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const entry: CacheEntry<T> = JSON.parse(item);
        const now = Date.now();

        // Check if cache is still valid
        if (now - entry.timestamp < entry.ttl) {
          setData(entry.data);
        } else {
          // Cache expired, remove it
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Write to localStorage
  const setCache = useCallback(
    (newData: T) => {
      try {
        const entry: CacheEntry<T> = {
          data: newData,
          timestamp: Date.now(),
          ttl,
        };

        localStorage.setItem(key, JSON.stringify(entry));
        setData(newData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    },
    [key, ttl]
  );

  // Clear specific cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, [key]);

  return { data, loading, error, setCache, clearCache };
}

// Utility function to get cache value (non-hook version)
export function getCachedValue<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();

    if (now - entry.timestamp < entry.ttl) {
      return entry.data;
    }

    // Cache expired
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

// Utility function to set cache value (non-hook version)
export function setCachedValue<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error('Failed to cache value:', err);
  }
}

// Utility function to clear cache value (non-hook version)
export function clearCachedValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  VERY_SHORT: 60 * 1000, // 1 minute
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;
