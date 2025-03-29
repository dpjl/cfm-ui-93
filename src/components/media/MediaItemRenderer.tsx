
import React, { useState } from 'react';
import { Video } from 'lucide-react';

interface MediaItemRendererProps {
  mediaId: string;
  src?: string;
  alt?: string;
  isVideo: boolean;
  isSelected?: boolean;
  onLoad?: () => void;
  loaded?: boolean;
  className?: string;
}

const MediaItemRenderer: React.FC<MediaItemRendererProps> = ({
  mediaId,
  src,
  isVideo,
  isSelected,
  onLoad,
  loaded = false,
  className = '',
  alt = 'Media item',
}) => {
  const [error, setError] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  // Use provided src or build the thumbnail URL
  const thumbnailUrl = src || `${apiBaseUrl}/thumbnail?id=${mediaId}`;

  const handleImageLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load media with ID: ${mediaId}`);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* All media use an image thumbnail */}
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

      {/* Video indicator */}
      {isVideo && (
        <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md backdrop-blur-sm">
          <Video size={16} />
        </div>
      )}

      {/* Loading indicator */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-red-500">
            {/* Error icon */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaItemRenderer;
