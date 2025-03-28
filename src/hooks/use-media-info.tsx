
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMediaInfo, DetailedMediaInfo } from '@/api/imageApi';
import { useMediaCache } from './use-media-cache';

export const useMediaInfo = (id: string, isIntersecting: boolean, position: 'source' | 'destination' = 'source') => {
  const [mediaInfo, setMediaInfo] = useState<DetailedMediaInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getCachedMediaInfo, setCachedMediaInfo } = useMediaCache();
  const hasRequestedRef = useRef(false);

  // Memoize the fetch function to avoid unnecessary re-renders
  const fetchInfo = useCallback(async () => {
    // If we've already requested the info, don't request it again
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    
    setIsLoading(true);
    
    try {
      // If it's a mock ID, create mock data instead of fetching
      if (id.startsWith('mock-media-')) {
        const mockInfo: DetailedMediaInfo = {
          alt: `Mock Media ${id}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
          name: `file_${id}.jpg`,
          path: `/media/photos/file_${id}.jpg`,
          size: `${Math.floor(Math.random() * 10000) + 500}KB`,
          cameraModel: ["iPhone 13 Pro", "Canon EOS 5D", "Sony Alpha A7III", "Nikon Z6"][Math.floor(Math.random() * 4)],
          hash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          duplicatesCount: Math.floor(Math.random() * 3)
        };
        setMediaInfo(mockInfo);
        // Cache the mock info
        setCachedMediaInfo(id, position, mockInfo);
      } else {
        const data = await fetchMediaInfo(id, position);
        setMediaInfo(data);
        // Cache the fetched info
        setCachedMediaInfo(id, position, data);
      }
    } catch (err) {
      console.error(`Error fetching info for media ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Set a fallback media info with the ID
      const fallbackInfo = { 
        alt: `Media ${id}`, 
        createdAt: null
      } as DetailedMediaInfo;
      setMediaInfo(fallbackInfo);
      // Cache even the fallback info to prevent retries
      setCachedMediaInfo(id, position, fallbackInfo);
    } finally {
      setIsLoading(false);
    }
  }, [id, position, setCachedMediaInfo]);

  useEffect(() => {
    // Reset the hasRequested flag when the ID changes
    hasRequestedRef.current = false;
    
    if (isIntersecting) {
      // Check cache first
      const cachedInfo = getCachedMediaInfo(id, position);
      if (cachedInfo) {
        setMediaInfo(cachedInfo);
        hasRequestedRef.current = true; // Mark as requested since we got it from cache
        return;
      }
      
      // If not in cache, fetch the info
      fetchInfo();
    }
  }, [id, isIntersecting, position, getCachedMediaInfo, fetchInfo]);

  return {
    mediaInfo,
    error,
    isLoading
  };
};
