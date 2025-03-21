
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageCard from './ImageCard';
import MediaPreview from './MediaPreview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { CheckSquare, Square } from 'lucide-react';

export interface ImageItem {
  id: string;
  src: string;
  alt: string;
  directory: string;
  createdAt?: string; // Date de création ou prise de vue
}

interface GalleryProps {
  title: string;
  images: ImageItem[];
  selectedImages: string[];
  onSelectImage: (id: string) => void;
  isLoading?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  title,
  images,
  selectedImages,
  onSelectImage,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<ImageItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Trier les images par date (du plus récent au plus ancien)
  const sortedImages = [...images].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const videoCount = sortedImages.filter(img => img.alt.match(/\.(mp4|webm|ogg|mov)$/i)).length;
  const imageCount = sortedImages.length - videoCount;
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  const handlePreviewMedia = (mediaId: string) => {
    const media = sortedImages.find(img => img.id === mediaId);
    if (media) {
      setPreviewMedia(media);
      setIsPreviewOpen(true);
    }
  };
  
  const closePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewMedia(null), 300); // Small delay to allow exit animation
  };

  const handleSelectAll = () => {
    if (selectedImages.length === sortedImages.length) {
      // Désélectionner tous les médias
      selectedImages.forEach(id => onSelectImage(id));
    } else {
      // Sélectionner tous les médias non sélectionnés
      sortedImages.forEach(image => {
        if (!selectedImages.includes(image.id)) {
          onSelectImage(image.id);
        }
      });
    }
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={`skeleton-${i}`} 
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          Media Gallery ({imageCount} images, {videoCount} videos)
        </h2>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSelectAll}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {selectedImages.length === sortedImages.length ? (
              <>
                <Square className="h-4 w-4" />
                Désélectionner tout
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Sélectionner tout
              </>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            {selectedImages.filter(id => sortedImages.some(img => img.id === id)).length} selected
          </div>
        </div>
      </div>
      
      {sortedImages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No media found</p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4 flex-1 content-start",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        )}>
          <AnimatePresence>
            {sortedImages.map((image, index) => (
              <motion.div
                key={image.id}
                custom={index}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <ImageCard
                  src={image.src}
                  alt={image.alt}
                  selected={selectedImages.includes(image.id)}
                  onSelect={() => onSelectImage(image.id)}
                  onPreview={() => handlePreviewMedia(image.id)}
                  type={image.alt.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image"}
                  createdAt={image.createdAt}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <MediaPreview
        media={previewMedia}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
};

export default Gallery;
