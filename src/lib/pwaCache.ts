/**
 * PWA Cache Strategy & Offline Support
 * Enhances the existing PWA with smart caching policies
 */

export const PWA_CACHE_NAME = 'mindwell-pwa-v1';
export const API_CACHE_NAME = 'mindwell-api-v1';
export const STATIC_CACHE_NAME = 'mindwell-static-v1';

// Cache strategies
export enum CacheStrategy {
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  NETWORK_ONLY = 'network-only',
  CACHE_ONLY = 'cache-only',
}

/**
 * URLs that should always be fetched from network
 */
export const NETWORK_ONLY_URLS = [
  '/auth',
  '/checkout',
  '/book',
  '/api/',
  '/supabase',
];

/**
 * URLs that should be aggressively cached
 */
export const CACHE_FIRST_URLS = [
  '/resources',
  '/blog',
  '/podcasts',
  '/about',
  '/tools',
  '/community',
];

/**
 * Offline detection utility
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

/**
 * Listen to online/offline events
 */
export function setupOfflineListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => {
    console.log('Back online');
    onOnline();
  };

  const handleOffline = () => {
    console.log('Gone offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Get appropriate cache strategy for URL
 */
export function getCacheStrategy(url: string): CacheStrategy {
  // Network-only URLs
  if (NETWORK_ONLY_URLS.some(path => url.includes(path))) {
    return CacheStrategy.NETWORK_ONLY;
  }

  // Cache-first URLs
  if (CACHE_FIRST_URLS.some(path => url.includes(path))) {
    return CacheStrategy.CACHE_FIRST;
  }

  // Default: Network first with fallback
  return CacheStrategy.NETWORK_FIRST;
}

/**
 * PWA Service Worker Registration
 */
export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Wait for the service worker to be active
    if (registration.waiting) {
      // There's an updated service worker waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Manual service worker update check
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return false;
  }

  return new Promise((resolve) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) {
        resolve(false);
        return;
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          resolve(true);
        }
      });
    });

    // No update found after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    console.warn('Cache API not supported');
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );

  console.log('All caches cleared');
}

/**
 * Clear specific cache by name
 */
export async function clearCacheByName(cacheName: string): Promise<void> {
  if (!('caches' in window)) {
    console.warn('Cache API not supported');
    return;
  }

  await caches.delete(cacheName);
  console.log(`Cache cleared: ${cacheName}`);
}

/**
 * Get cache size estimate
 */
export async function getCacheSize(): Promise<string> {
  if (!('caches' in window)) {
    return '0 B';
  }

  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  // Format size
  if (totalSize < 1024) {
    return `${totalSize} B`;
  } else if (totalSize < 1024 * 1024) {
    return `${(totalSize / 1024).toFixed(2)} KB`;
  } else {
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Prefetch critical resources
 */
export async function prefetchCriticalResources(): Promise<void> {
  if (!('serviceWorker' in navigator) || !isOnline()) {
    return;
  }

  const criticalUrls = [
    '/',
    '/resources',
    '/blog',
    '/podcasts',
    '/tools',
  ];

  const cache = await caches.open(PWA_CACHE_NAME);

  await Promise.all(
    criticalUrls.map(url => {
      return cache.add(new Request(url, { mode: 'no-cors' }));
    })
  );

  console.log('Critical resources prefetched');
}
