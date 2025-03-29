
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getMediaUrl } from '@/api/imageApi';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface MediaPreviewProps {
  mediaId: string | null;
  isOpen: boolean;
  onClose: () => void;
  allMediaIds: string[];
  onNavigate: (direction: 'prev' | 'next') => void;
  position?: 'source' | 'destination';
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaId,
  isOpen,
  onClose,
  allMediaIds,
  onNavigate,
  position = 'source'
}) => {
  const { t } = useLanguage();
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const { mediaInfo } = useMediaInfo(mediaId || '', isOpen, position);

  // Update the media URL when the ID changes
  useEffect(() => {
    if (mediaId) {
      setIsLoadingImage(true);
      setMediaUrl(getMediaUrl(mediaId, position));
    }
  }, [mediaId, position]);

  const handlePrev = () => {
    onNavigate('prev');
  };

  const handleNext = () => {
    onNavigate('next');
  };

  const handleImageLoad = () => {
    setIsLoadingImage(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'Escape') {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!mediaId) return null;

  // Determine if this is a video based on the file extension or ID
  const isVideo = mediaInfo?.alt ? 
    /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) || mediaId.includes('vid-') : 
    mediaId.includes('vid-');

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0 gap-0 flex flex-col bg-background/50 backdrop-blur-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium truncate">
            {mediaInfo?.name || mediaInfo?.alt || mediaId}
          </h3>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
        
        <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-black/50">
          {isLoadingImage && <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>}
          
          {isVideo ? (
            <video 
              src={mediaUrl} 
              controls 
              autoPlay 
              className="max-h-full max-w-full" 
              onLoadedData={handleImageLoad} 
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt={mediaInfo?.alt || mediaId} 
              className={cn(
                "max-h-full max-w-full object-contain transition-opacity duration-300", 
                isLoadingImage ? "opacity-0" : "opacity-100"
              )} 
              onLoad={handleImageLoad} 
            />
          )}
          
          {/* Navigation buttons */}
          <Button variant="ghost" size="icon" className="absolute left-2 bg-black/30 hover:bg-black/60" onClick={handlePrev}>
            <ChevronLeft className="h-8 w-8 text-white" />
          </Button>
          
          <Button variant="ghost" size="icon" className="absolute right-2 bg-black/30 hover:bg-black/60" onClick={handleNext}>
            <ChevronRight className="h-8 w-8 text-white" />
          </Button>
        </div>
        
        {/* Media info */}
        {mediaInfo && <div className="p-4 border-t overflow-y-auto max-h-56">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {mediaInfo.createdAt && <div>
                  <div className="font-medium">{t('date')}</div>
                  <div>{new Date(mediaInfo.createdAt).toLocaleString()}</div>
                </div>}
              
              {mediaInfo.dimensions && <div>
                  <div className="font-medium">Dimensions</div>
                  <div>{mediaInfo.dimensions}</div>
                </div>}
              
              {mediaInfo.size && <div>
                  <div className="font-medium">{t('size')}</div>
                  <div>{mediaInfo.size}</div>
                </div>}
              
              {mediaInfo.cameraModel && <div>
                  <div className="font-medium">{t('camera')}</div>
                  <div>{mediaInfo.cameraModel}</div>
                </div>}
              
              {mediaInfo.path && <div>
                  <div className="font-medium">{t('path')}</div>
                  <div className="truncate">{mediaInfo.path}</div>
                </div>}
              
              {mediaInfo.iso && <div>
                  <div className="font-medium">ISO</div>
                  <div>{mediaInfo.iso}</div>
                </div>}
              
              {mediaInfo.focalLength && <div>
                  <div className="font-medium">Focal Length</div>
                  <div>{mediaInfo.focalLength}</div>
                </div>}
              
              {mediaInfo.aperture && <div>
                  <div className="font-medium">Aperture</div>
                  <div>{mediaInfo.aperture}</div>
                </div>}
              
              {mediaInfo.exposureTime && <div>
                  <div className="font-medium">Exposure</div>
                  <div>{mediaInfo.exposureTime}</div>
                </div>}
              
              {mediaInfo.hash && <div className="col-span-2">
                  <div className="font-medium">{t('hash')}</div>
                  <div className="font-mono text-xs truncate">{mediaInfo.hash}</div>
                </div>}
              
              {mediaInfo.duplicatesCount !== undefined && mediaInfo.duplicatesCount > 0 && <div>
                  <div className="font-medium">{t('duplicates')}</div>
                  <div>{mediaInfo.duplicatesCount}</div>
                </div>}
            </div>
          </div>}
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreview;
