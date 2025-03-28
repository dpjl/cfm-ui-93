
import React, { useRef, memo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';

interface MediaItemRendererProps {
  src: string;
  alt: string;
  isVideo: boolean;
  onLoad: () => void;
  loaded: boolean;
  isScrolling?: boolean;
}

// Optimisé pour éviter les re-rendus et clignotements
const MediaItemRenderer = memo(({
  src,
  alt,
  isVideo,
  onLoad,
  loaded,
  isScrolling = false
}: MediaItemRendererProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Placeholder pour éviter le clignotement pendant le chargement
  const placeholderStyle = {
    backgroundColor: 'rgba(var(--muted), 0.8)',
    position: 'absolute' as const,
    inset: 0,
    transition: 'opacity 200ms ease-out',
    opacity: loaded ? 0 : 1,
    zIndex: 2
  };
  
  // Gestion du hover pour les vidéos avec debounce intégré
  const handleMouseOver = () => {
    if (isVideo && videoRef.current && !isScrolling) {
      setIsHovering(true);
      videoRef.current.play().catch(() => {});
    }
  };
  
  const handleMouseOut = () => {
    if (isVideo && videoRef.current) {
      setIsHovering(false);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  // Préchargement d'image pour éviter le clignotement
  useEffect(() => {
    if (!isVideo && !loaded && !isScrolling && src) {
      const img = new Image();
      img.src = src;
      img.onload = onLoad;
    }
  }, [isVideo, loaded, isScrolling, src, onLoad]);
  
  // Classes optimisées
  const containerClasses = cn(
    "w-full h-full rounded-md overflow-hidden relative",
    "transform-gpu" // Force GPU acceleration
  );
  
  const mediaClasses = cn(
    "w-full h-full object-cover transition-[opacity,transform] duration-200 ease-out z-1",
    "will-change-[opacity,transform]",
    loaded ? "opacity-100" : "opacity-0"
  );
  
  // Pendant le scrolling, montrer un placeholder simple
  if (isScrolling && !loaded) {
    return <div className={containerClasses} style={{backgroundColor: 'rgba(var(--muted), 0.5)'}} />;
  }
  
  return (
    <div 
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      className={containerClasses}
      style={{ containIntrinsicSize: '0 0', contain: 'content' }}
    >
      {/* Placeholder qui reste visible jusqu'à ce que l'image soit chargée */}
      <div style={placeholderStyle} aria-hidden="true" />
      
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
            style={{ transform: 'translateZ(0)' }}
          />
          {loaded && (
            <div className="absolute top-2 right-2 z-10 bg-black/70 p-1 rounded-md text-white pointer-events-none">
              <Video className="h-4 w-4" />
            </div>
          )}
        </>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt=""
          className={mediaClasses}
          onLoad={onLoad}
          decoding="async"
          style={{ transform: 'translateZ(0)' }}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation critique pour éviter les re-rendus inutiles
  return (
    prevProps.src === nextProps.src &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.isScrolling === nextProps.isScrolling
  );
});

MediaItemRenderer.displayName = 'MediaItemRenderer';

export default MediaItemRenderer;
