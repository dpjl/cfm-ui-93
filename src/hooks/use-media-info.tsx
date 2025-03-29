
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMediaInfo, DetailedMediaInfo } from '@/api/imageApi';
import { useMediaCache } from './use-media-cache';

// Modèles d'appareils photo réalistes
const CAMERA_MODELS = [
  "iPhone 13 Pro", "iPhone 14 Pro Max", "iPhone 15 Pro", 
  "Samsung Galaxy S23 Ultra", "Samsung Galaxy S22", 
  "Canon EOS 5D Mark IV", "Canon EOS R5", "Canon EOS 90D",
  "Nikon Z6 II", "Nikon D850", "Nikon D7500",
  "Sony Alpha A7R IV", "Sony Alpha A7 III", "Sony Alpha A6600",
  "Fujifilm X-T4", "Fujifilm X-Pro3", "Fujifilm X100V",
  "Panasonic Lumix GH5", "Panasonic Lumix S5",
  "Google Pixel 7 Pro", "Google Pixel 6"
];

// Dimensions réalistes pour images/vidéos
const IMAGE_DIMENSIONS = [
  "1920x1080", "3840x2160", "1280x720", "2560x1440",
  "6000x4000", "4000x3000", "3648x2736", "4608x3456",
  "5472x3648", "3264x2448", "2048x1536", "7680x4320"
];

// Tailles de fichiers réalistes
function generateFileSize() {
  // Images: 2-15 MB, Vidéos: 20-200 MB
  const isVideo = Math.random() > 0.85; // 15% chance d'être une vidéo
  const size = isVideo 
    ? Math.floor(Math.random() * 180 + 20) 
    : Math.floor(Math.random() * 13 + 2);
  
  if (size < 1) return `${Math.floor(size * 1000)} KB`;
  return `${size.toFixed(1)} MB`;
}

// Génération de dates réalistes sur les 5 dernières années
function generateRandomDate() {
  const now = new Date();
  const pastDate = new Date();
  pastDate.setFullYear(now.getFullYear() - Math.floor(Math.random() * 5));
  pastDate.setMonth(Math.floor(Math.random() * 12));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1);
  pastDate.setHours(Math.floor(Math.random() * 24));
  pastDate.setMinutes(Math.floor(Math.random() * 60));
  return pastDate.toISOString();
}

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
      // Si c'est un ID mock, créer des données fictives plus riches
      if (id.startsWith('mock-media-')) {
        // Utiliser l'ID comme graine pour générer des données pseudo-aléatoires cohérentes
        const idNum = parseInt(id.replace('mock-media-', '')) || Math.floor(Math.random() * 1000);
        const seed = (idNum * 13) % 100; // Simple hachage pour obtenir une variabilité cohérente
        
        // Déterminer si c'est une vidéo (environ 15% des éléments)
        const isVideo = (seed % 100) < 15;
        const fileExt = isVideo ? 
          ['mp4', 'mov', 'webm'][seed % 3] : 
          ['jpg', 'png', 'heic', 'jpeg'][seed % 4];
        
        // Choisir un modèle d'appareil photo en fonction de l'ID
        const cameraIndex = idNum % CAMERA_MODELS.length;
        
        // Générer des dimensions selon le type
        const dimensionIndex = (idNum + seed) % IMAGE_DIMENSIONS.length;
        
        // Générer un hash réaliste
        const hash = Array.from({length: 40}, () => 
          "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join('');
        
        // Créer des données mock améliorées
        const mockInfo: DetailedMediaInfo = {
          alt: `${isVideo ? 'Video' : 'Photo'}_${id}.${fileExt}`,
          createdAt: generateRandomDate(),
          name: `IMG_${1000 + idNum}.${fileExt}`,
          path: `/media/${position}/${isVideo ? 'videos' : 'photos'}/IMG_${1000 + idNum}.${fileExt}`,
          size: generateFileSize(),
          dimensions: IMAGE_DIMENSIONS[dimensionIndex],
          cameraModel: CAMERA_MODELS[cameraIndex],
          hash: hash,
          duplicatesCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
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
