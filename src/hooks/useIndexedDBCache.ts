/**
 * IndexedDB Wrapper for client-side caching of large datasets
 * Uses IndexedDB for storing blogs, resources, podcasts, etc.
 */

import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'MindWellCache';
const DB_VERSION = 1;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different data types
        if (!db.objectStoreNames.contains('blogs')) {
          db.createObjectStore('blogs', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('podcasts')) {
          db.createObjectStore('podcasts', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('testimonials')) {
          db.createObjectStore('testimonials', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('faqs')) {
          db.createObjectStore('faqs', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Get data from IndexedDB cache
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const entry = result as CacheEntry<T>;
        const now = Date.now();

        if (now - entry.timestamp > entry.ttl) {
          // Cache expired, delete it
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  }

  /**
   * Set data in IndexedDB cache
   */
  async set<T>(storeName: string, key: string, data: T, ttl: number): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      const request = store.put(entry, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete specific entry from IndexedDB cache
   */
  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear entire store
   */
  async clearStore(storeName: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all data from store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as CacheEntry<T>[];
        const now = Date.now();

        // Filter out expired entries
        const validData = results
          .filter(entry => now - entry.timestamp <= entry.ttl)
          .map(entry => entry.data);

        resolve(validData);
      };
    });
  }

  /**
   * Cache entire array of items
   */
  async setArray<T>(storeName: string, data: T[], ttl: number): Promise<void> {
    const db = await this.dbPromise;

    for (const item of data) {
      await this.set(storeName, (item as any).id, item, ttl);
    }
  }
}

// Singleton instance
const indexedDBCache = new IndexedDBCache();

// Exported hooks
export function useIndexedDBCache<T>(storeName: string, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    indexedDBCache.get<T>(storeName, key)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [storeName, key]);

  const setCache = useCallback((newData: T, ttl: number) => {
    indexedDBCache.set(storeName, key, newData, ttl)
      .then(() => setData(newData))
      .catch(setError);
  }, [storeName, key]);

  const clearCache = useCallback(() => {
    indexedDBCache.delete(storeName, key)
      .then(() => setData(null))
      .catch(setError);
  }, [storeName, key]);

  return { data, loading, error, setCache, clearCache };
}

// Export utilities
export const indexedDBUtils = {
  get: <T>(storeName: string, key: string) => indexedDBCache.get<T>(storeName, key),
  set: <T>(storeName: string, key: string, data: T, ttl: number) => {
    return indexedDBCache.set(storeName, key, data, ttl);
  },
  delete: (storeName: string, key: string) => {
    return indexedDBCache.delete(storeName, key);
  },
  clearStore: (storeName: string) => {
    return indexedDBCache.clearStore(storeName);
  },
  getAll: <T>(storeName: string) => {
    return indexedDBCache.getAll<T>(storeName);
  },
  setArray: <T>(storeName: string, data: T[], ttl: number) => {
    return indexedDBCache.setArray(storeName, data, ttl);
  },
};

// Cache TTL constants for IndexedDB (in milliseconds)
export const IDB_CACHE_TTL = {
  VERY_SHORT: 2 * 60 * 1000, // 2 minutes
  SHORT: 10 * 60 * 1000, // 10 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Store names
export const CACHE_STORES = {
  BLOGS: 'blogs',
  RESOURCES: 'resources',
  PODCASTS: 'podcasts',
  TESTIMONIALS: 'testimonials',
  FAQS: 'faqs',
} as const;
