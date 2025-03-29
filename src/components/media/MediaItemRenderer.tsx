
import React, { useState, useEffect, useRef } from 'react';
import { Image, Video } from 'lucide-react';

interface MediaItemRendererProps {
  mediaId: string;
  isVideo: boolean;
  isSelected?: boolean;
  onLoad?: () => void;
  className?: string;
  alt?: string;
}

const MediaItemRenderer: React.FC<MediaItemRendererProps> = ({
  mediaId,
  isVideo,
  isSelected,
  onLoad,
  className = '',
  alt = 'Media item',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  // Nous utilisons maintenant l'endpoint thumbnail pour tous les médias
  const thumbnailUrl = `${apiBaseUrl}/thumbnail?id=${mediaId}`;

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [mediaId]);

  const handleImageLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load media with ID: ${mediaId}`);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Tous les médias utilisent une image thumbnail */}
      <img
        src={thumbnailUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onLoad={handleImageLoad}
        onError={handleError}
        loading="lazy"
      />

      {/* Indicateur de type de média (vidéo) */}
      {isVideo && (
        <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm">
          <Video size={16} />
        </div>
      )}

      {/* Indicateur de chargement */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-red-500">
            <Image size={24} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaItemRenderer;
