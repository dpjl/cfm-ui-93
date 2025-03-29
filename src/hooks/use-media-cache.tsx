import { useState, useCallback, useEffect, useRef } from 'react';
import { DetailedMediaInfo } from '@/types/api';

// Type for our cache
interface MediaCache {
  thumbnails: Map<string, string>;
  info: Map<string, DetailedMediaInfo>;
}

// Create a global cache that persists between component renders
const globalCache: MediaCache = {
  thumbnails: new Map<string, string>(),
  info: new Map<string, DetailedMediaInfo>(),
};

export function useMediaCache() {
  // Use ref instead of state to avoid re-renders when accessing cache
  const cacheRef = useRef<MediaCache>(globalCache);
  
  // Memoized getter for thumbnail URLs
  const getCachedThumbnailUrl = useCallback((id: string, position: 'source' | 'destination'): string | undefined => {
    const cacheKey = `${id}-${position}`;
    return cacheRef.current.thumbnails.get(cacheKey);
  }, []);

  // Memoized setter for thumbnail URLs
  const setCachedThumbnailUrl = useCallback((id: string, position: 'source' | 'destination', url: string): void => {
    const cacheKey = `${id}-${position}`;
    if (!cacheRef.current.thumbnails.has(cacheKey)) {
      cacheRef.current.thumbnails.set(cacheKey, url);
    }
  }, []);

  // Memoized getter for media info
  const getCachedMediaInfo = useCallback((id: string, position: 'source' | 'destination'): DetailedMediaInfo | undefined => {
    const cacheKey = `${id}-${position}`;
    return cacheRef.current.info.get(cacheKey);
  }, []);

  // Memoized setter for media info
  const setCachedMediaInfo = useCallback((id: string, position: 'source' | 'destination', info: DetailedMediaInfo): void => {
    const cacheKey = `${id}-${position}`;
    if (!cacheRef.current.info.has(cacheKey) || (info && Object.keys(info).length > 2)) {
      // Only replace existing info if new info is more complete
      cacheRef.current.info.set(cacheKey, info);
    }
  }, []);

  // Just for debugging purposes - reduced frequency of logging
  useEffect(() => {
    const logInterval = 30000; // Log once every 30 seconds
    const intervalId = setInterval(() => {
      console.log(`Cache stats - Thumbnails: ${cacheRef.current.thumbnails.size}, Info: ${cacheRef.current.info.size}`);
    }, logInterval);
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    getCachedThumbnailUrl,
    setCachedThumbnailUrl,
    getCachedMediaInfo,
    setCachedMediaInfo
  };
}
