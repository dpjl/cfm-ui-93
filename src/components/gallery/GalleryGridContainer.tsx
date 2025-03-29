
import React from 'react';
import { motion } from 'framer-motion';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { MediaItem } from '@/types/gallery';

interface GalleryGridContainerProps {
  items: MediaItem[];
  isLoading: boolean;
  columnCount: number;
  position: 'source' | 'destination';
  onMediaClick: (id: string) => void;
}

const GalleryGridContainer: React.FC<GalleryGridContainerProps> = ({
  items,
  isLoading,
  columnCount,
  position,
  onMediaClick
}) => {
  // Extract just the IDs from media items
  const mediaIds = items.map(item => item.id);
  // Track which items are selected (none for now)
  const selectedIds: string[] = [];
  
  const handleSelectId = (id: string, extendSelection: boolean) => {
    console.log('Selected:', id, 'extendSelection:', extendSelection);
    onMediaClick(id);
  };

  // Placeholder for loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GalleryGrid
        mediaIds={mediaIds}
        selectedIds={selectedIds}
        onSelectId={handleSelectId}
        columnsCount={columnCount}
        position={position}
      />
    </motion.div>
  );
};

export default GalleryGridContainer;
