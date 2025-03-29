
import { useState, useEffect, useCallback, useRef } from 'react';
import { getMediaInfo } from '@/api/imageApi';
import { DetailedMediaInfo } from '@/types/api';
import { useMediaCache } from './use-media-cache';

export const useMediaInfo = (id: string, isIntersecting: boolean, position: 'source' | 'destination' = 'source') => {
  const [mediaInfo, setMediaInfo] = useState<DetailedMediaInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getCachedMediaInfo, setCachedMediaInfo } = useMediaCache();
  const hasRequestedRef = useRef(false);

  // Mémoriser la fonction de récupération pour éviter les rendus inutiles
  const fetchInfo = useCallback(async () => {
    // Si nous avons déjà demandé les informations, ne les demandons pas à nouveau
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    
    setIsLoading(true);
    
    try {
      // S'il s'agit d'un ID fictif, créer des données fictives au lieu de récupérer
      if (id.startsWith('mock-media-')) {
        const mockInfo: DetailedMediaInfo = {
          alt: `Mock Media ${id}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          name: `file_${id}.jpg`,
          path: `/media/photos/file_${id}.jpg`,
          size: `${Math.floor(Math.random() * 10000) + 500}KB`,
          cameraModel: ["iPhone 13 Pro", "Canon EOS 5D", "Sony Alpha A7III", "Nikon Z6"][Math.floor(Math.random() * 4)],
          hash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          duplicatesCount: Math.floor(Math.random() * 3)
        };
        setMediaInfo(mockInfo);
        // Mettre en cache les informations fictives
        setCachedMediaInfo(id, position, mockInfo);
      } else {
        const data = await getMediaInfo(id);
        setMediaInfo(data);
        // Mettre en cache les informations récupérées
        setCachedMediaInfo(id, position, data);
      }
    } catch (err) {
      console.error(`Error fetching info for media ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Définir des informations de secours avec l'ID
      const fallbackInfo = { 
        alt: `Media ${id}`, 
        createdAt: null
      } as DetailedMediaInfo;
      setMediaInfo(fallbackInfo);
      // Mettre en cache même les informations de secours pour éviter les nouvelles tentatives
      setCachedMediaInfo(id, position, fallbackInfo);
    } finally {
      setIsLoading(false);
    }
  }, [id, position, setCachedMediaInfo]);

  useEffect(() => {
    // Réinitialiser le drapeau hasRequested lorsque l'ID change
    hasRequestedRef.current = false;
    
    if (isIntersecting) {
      // Vérifier d'abord le cache
      const cachedInfo = getCachedMediaInfo(id, position);
      if (cachedInfo) {
        setMediaInfo(cachedInfo);
        hasRequestedRef.current = true; // Marquer comme demandé puisque nous l'avons obtenu du cache
        return;
      }
      
      // Si pas dans le cache, récupérer les informations
      fetchInfo();
    }
  }, [id, isIntersecting, position, getCachedMediaInfo, fetchInfo]);

  return {
    mediaInfo,
    error,
    isLoading
  };
};
