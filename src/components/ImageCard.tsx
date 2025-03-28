
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Video } from 'lucide-react';
import DateDisplay from './media/DateDisplay';

interface ImageCardProps {
  src: string;
  alt: string;
  selected: boolean;
  onSelect: (extendSelection: boolean) => void;
  onPreview: () => void;
  aspectRatio?: "portrait" | "square" | "video";
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
  aspectRatio = "square",
  type = "image",
  onInView,
  createdAt,
  showDates = false
}) => {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Call onInView immediately when component mounts if it exists
  useEffect(() => {
    if (onInView) {
      onInView();
    }
  }, [onInView]);
  
  // Determine if it's a video based on file extension
  const isVideo = type === "video" || alt.match(/\.(mp4|webm|ogg|mov)$/i);
  
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
  
  // Direct handler for clicking on the card
  const handleCardClick = (e: React.MouseEvent) => {
    // If we're not clicking on the checkbox, proceed with selection
    if (!(e.target as HTMLElement).closest('.image-checkbox')) {
      onSelect(e.shiftKey);
    }
  }
  
  return (
    <div 
      className={cn(
        "image-card group relative", 
        "aspect-square", // Always use square aspect
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
          {/* Video icon overlay */}
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

      {/* Use the DateDisplay component */}
      <DateDisplay dateString={createdAt} showDate={showDates} />

      <div className="image-overlay" />
      <div className="image-checkbox" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={selected}
          className={cn(
            "h-5 w-5 border-2",
            selected ? "border-primary bg-primary" : "border-white bg-white/20",
            "transition-all duration-200 ease-out",
            !loaded && "opacity-0"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e.shiftKey);
          }}
        />
      </div>
    </div>
  );
};

export default ImageCard;
