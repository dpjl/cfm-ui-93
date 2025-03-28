
import React, { useRef, memo } from 'react';
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

const MediaItemRenderer = memo(({
  src,
  alt,
  isVideo,
  onLoad,
  loaded,
  isScrolling = false
}: MediaItemRendererProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Pendant le scrolling, montrer un placeholder simple pour éviter le scintillement
  if (isScrolling && !loaded) {
    return <div className="w-full h-full rounded-md bg-muted/50" />;
  }
  
  return (
    <div className="w-full h-full rounded-md overflow-hidden relative">
      {/* Utiliser un div de fond plutôt qu'une transition complexe */}
      <div 
        className="absolute inset-0 bg-muted/50"
        style={{ display: loaded ? 'none' : 'block' }}
        aria-hidden="true" 
      />
      
      {isVideo ? (
        <>
          <video 
            ref={videoRef}
            src={src}
            title={alt}
            className="w-full h-full object-cover"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoadedData={onLoad}
            muted
            loop
            playsInline
          />
          {loaded && (
            <div className="absolute top-2 right-2 z-10 bg-black/70 p-1 rounded-md text-white">
              <Video className="h-4 w-4" />
            </div>
          )}
        </>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={onLoad}
          decoding="async"
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation pour éviter les re-rendus inutiles
  return (
    prevProps.src === nextProps.src &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.isScrolling === nextProps.isScrolling
  );
});

MediaItemRenderer.displayName = 'MediaItemRenderer';

export default MediaItemRenderer;
