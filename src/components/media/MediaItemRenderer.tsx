
import React, { useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';

interface MediaItemRendererProps {
  src: string;
  alt: string;
  isVideo: boolean;
  onLoad: () => void;
  loaded: boolean;
}

// Using memo to prevent unnecessary re-renders
const MediaItemRenderer: React.FC<MediaItemRendererProps> = memo(({
  src,
  alt,
  isVideo,
  onLoad,
  loaded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  // Common classes and styles
  const mediaClasses = cn(
    "w-full h-full object-cover pointer-events-none", // Disable pointer events on the media itself
    loaded ? "opacity-100" : "opacity-0"
  );
  
  const containerClasses = cn(
    "w-full h-full rounded-md overflow-hidden",
    !loaded && "animate-pulse bg-muted"
  );
  
  return (
    <div 
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      className={containerClasses}
      aria-hidden="true" // The parent element handles interaction
    >
      {isVideo ? (
        <>
          <video 
            ref={videoRef}
            src={src}
            title={alt}
            className={mediaClasses}
            onLoadedData={onLoad}
            muted
            loop
            playsInline
            style={{ transition: 'opacity 300ms ease' }}
          />
          {/* Video icon overlay */}
          <div className="absolute top-2 right-2 z-10 bg-black/70 p-1 rounded-md text-white pointer-events-none">
            <Video className="h-4 w-4" />
          </div>
        </>
      ) : (
        <img
          src={src}
          alt=""  // Empty alt because parent has aria-label
          className={mediaClasses}
          onLoad={onLoad}
          style={{ transition: 'opacity 300ms ease' }}
        />
      )}
    </div>
  );
});

// Set component display name for debugging
MediaItemRenderer.displayName = 'MediaItemRenderer';

export default MediaItemRenderer;
