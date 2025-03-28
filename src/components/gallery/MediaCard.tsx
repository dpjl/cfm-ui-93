
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaInfo, getThumbnailUrl } from '@/api/imageApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';

interface MediaCardProps {
  id: string;
  position: 'source' | 'destination';
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  id,
  position,
  isSelected,
  onClick,
  onDoubleClick
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const { data: mediaInfo, isLoading: isInfoLoading } = useQuery({
    queryKey: ['mediaInfo', id, position],
    queryFn: () => fetchMediaInfo(id, position),
  });
  
  const thumbnailUrl = getThumbnailUrl(id, position);
  
  const handleLoad = () => {
    setIsImageLoaded(true);
  };
  
  const handleError = () => {
    setIsImageLoaded(true); // Même en cas d'erreur, on considère que le chargement est terminé
  };
  
  return (
    <div 
      className={`media-card aspect-square overflow-hidden ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {!isImageLoaded && (
        <Skeleton className="absolute inset-0 rounded-md" />
      )}
      
      <img 
        src={thumbnailUrl}
        alt={mediaInfo?.alt || 'Media thumbnail'}
        className="w-full h-full object-cover"
        style={{ opacity: isImageLoaded ? 1 : 0 }}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary rounded-full p-1 text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs truncate">
        {mediaInfo?.alt || id}
      </div>
    </div>
  );
};

export default MediaCard;
