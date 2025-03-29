
import React from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import Gallery from '@/components/gallery/Gallery';
import GallerySkeletons from '@/components/gallery/GallerySkeletons';
import GalleryEmptyState from '@/components/gallery/GalleryEmptyState';
import GalleryError from '@/components/gallery/GalleryError';
import { MobileViewMode, MediaFilter } from '@/types/gallery';

interface ResponsiveGalleryProps {
  title: string;
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  columnsCount: number;
  onPreviewItem: (id: string) => void;
  onDeleteSelected: () => void;
  filter?: MediaFilter;
  position?: 'source' | 'destination';
  mobileViewMode: MobileViewMode;
  isActive?: boolean;
}

const ResponsiveGallery: React.FC<ResponsiveGalleryProps> = ({
  title,
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading,
  isError,
  error,
  columnsCount,
  onPreviewItem,
  onDeleteSelected,
  filter = 'all',
  position = 'source',
  mobileViewMode,
  isActive = true
}) => {
  const isMobile = useIsMobile();
  
  // Determine visibility based on mobile view mode
  const isVisible = !isMobile || 
    (mobileViewMode === 'both') || 
    (mobileViewMode === 'left' && position === 'source') || 
    (mobileViewMode === 'right' && position === 'destination');
    
  if (!isVisible || !isActive) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 w-full h-full" aria-live="polite" aria-busy="true">
        <GallerySkeletons columnsCount={columnsCount} />
        <div className="sr-only">Loading media items</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return <GalleryError error={error} />;
  }

  // Empty state
  if (mediaIds.length === 0) {
    return <GalleryEmptyState filter={filter} />;
  }

  // Determine view mode for desktop vs mobile
  const viewMode = !isMobile ? 'split' : (mobileViewMode === 'both' ? 'split' : 'single');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Gallery
          title={title}
          mediaIds={mediaIds}
          selectedIds={selectedIds}
          onSelectId={onSelectId}
          isLoading={false}
          columnsCount={columnsCount}
          onPreviewMedia={onPreviewItem}
          viewMode={viewMode}
          onDeleteSelected={onDeleteSelected}
          position={position}
          filter={filter}
          isError={isError}
          error={error}
        />
      </div>
    </div>
  );
};

export default ResponsiveGallery;
