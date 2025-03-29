
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import LazyMediaItem from '@/components/LazyMediaItem';
import { DetailedMediaInfo } from '@/api/imageApi';

interface GalleryGridProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string, extendSelection: boolean) => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: DetailedMediaInfo) => void;
  position: 'source' | 'destination';
}

// Using memo to prevent unnecessary re-renders
const GalleryGrid = memo(({
  mediaIds,
  selectedIds,
  onSelectId,
  columnsCount = 5,
  viewMode = 'single',
  showDates = true,
  updateMediaInfo,
  position = 'source'
}: GalleryGridProps) => {
  console.log(`GalleryGrid rendering with columnsCount=${columnsCount}`);
  
  // Simplified container variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      }
    }
  };

  return (
    <motion.div
      className={`grid gap-2 p-2`}
      style={{
        gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {mediaIds.map((id, index) => (
        <LazyMediaItem
          key={id}
          id={id}
          selected={selectedIds.includes(id)}
          onSelect={onSelectId}
          index={index}
          showDates={showDates}
          updateMediaInfo={updateMediaInfo}
          position={position}
        />
      ))}
    </motion.div>
  );
});

// Set display name for debugging
GalleryGrid.displayName = 'GalleryGrid';

export default GalleryGrid;
