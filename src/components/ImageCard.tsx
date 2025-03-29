
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';
import DateDisplay from './media/DateDisplay';

interface ImageCardProps {
  src: string;
  alt: string;
  selected: boolean;
  onSelect: (extendSelection: boolean) => void;
  onPreview: () => void;
  type?: "image" | "video";
  onInView?: () => void;
  createdAt?: string;
  showDates?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  src,
  alt,
  selected,
  onSelect,
  onPreview,
  type = "image",
  onInView,
  createdAt,
  showDates = false
}) => {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Appeler onInView immédiatement lorsque le composant est monté s'il existe
  React.useEffect(() => {
    if (onInView) {
      onInView();
    }
  }, [onInView]);
  
  // Déterminer s'il s'agit d'une vidéo en fonction de l'extension du fichier
  const isVideo = type === "video" || alt.match(/\.(mp4|webm|ogg|mov)$/i);
  
  // Gérer le survol pour les vidéos
  const handleMouseOver = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  };
  
  const handleMouseOut = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  // Gestionnaire direct pour le clic sur la carte
  const handleCardClick = (e: React.MouseEvent) => {
    onSelect(e.shiftKey);
  }
  
  return (
    <div 
      className={cn(
        "image-card group relative", 
        "aspect-square", 
        selected && "selected",
        !loaded && "animate-pulse bg-muted"
      )}
      onClick={handleCardClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {isVideo ? (
        <>
          <video 
            ref={videoRef}
            src={src}
            title={alt}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoadedData={() => setLoaded(true)}
            muted
            loop
            playsInline
          />
          {/* Icône vidéo en superposition */}
          <div className="absolute top-2 left-2 z-10 bg-black/70 p-1 rounded-md text-white">
            <Video className="h-4 w-4" />
          </div>
        </>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
        />
      )}

      {/* Utiliser le composant DateDisplay */}
      <DateDisplay dateString={createdAt} showDate={showDates} />

      <div className="image-overlay" />
    </div>
  );
};

export default ImageCard;
