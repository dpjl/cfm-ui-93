
import React from 'react';
import { useIsMobile } from '@/hooks/use-media-query';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds, fetchMediaInfo } from '../api/imageApi';
import type { MediaItem } from '../types/gallery';
import GalleryGrid from './gallery/GalleryGrid';

interface GalleryWrapperProps {
  position: 'source' | 'destination';
  columnCount?: number;
  currentDirectory?: string;
  filter?: string;
}

const GalleryWrapper: React.FC<GalleryWrapperProps> = ({
  position,
  columnCount = 3,
  currentDirectory = '',
  filter = 'all'
}) => {
  const isMobile = useIsMobile();
  const adaptiveColumnCount = isMobile ? 2 : columnCount;

  // Fetch media IDs
  const { data: mediaIds = [], isLoading: isLoadingIds, error: idsError } = useQuery({
    queryKey: ['mediaIds', position, currentDirectory, filter],
    queryFn: () => fetchMediaIds(currentDirectory, position, filter),
  });

  // Fetch media info for each ID (prefetch only visible ones)
  const { data: mediaInfoList = [], isLoading: isLoadingInfo } = useQuery({
    queryKey: ['mediaInfo', position, mediaIds],
    queryFn: async () => {
      // Limit to first 50 for initial load
      const idsToFetch = mediaIds.slice(0, 50);
      const infoPromises = idsToFetch.map(id => fetchMediaInfo(id, position));
      return Promise.all(infoPromises);
    },
    enabled: mediaIds.length > 0,
  });

  const handleMediaClick = (id: string) => {
    console.log('Media clicked', id, position);
    // Handle click event (preview, select, etc.)
  };

  const isLoading = isLoadingIds || isLoadingInfo;
  
  if (idsError) {
    return (
      <div className="p-4 text-red-500">
        Erreur de chargement: {idsError instanceof Error ? idsError.message : 'Erreur inconnue'}
      </div>
    );
  }

  // Convert media info to MediaItem format
  const mediaItems: MediaItem[] = mediaInfoList.map(info => ({
    id: info.alt || '',
    alt: info.alt || '',
    createdAt: info.createdAt || '',
    isVideo: info.name ? info.name.toLowerCase().endsWith('.mp4') || 
                         info.name.toLowerCase().endsWith('.webm') || 
                         info.name.toLowerCase().endsWith('.mov') : false
  }));

  // Extract just the IDs and handle them directly with GalleryGrid
  const ids = mediaItems.map(item => item.id);
  const selectedIds: string[] = [];
  
  const handleSelectId = (id: string, extendSelection: boolean) => {
    console.log('Selected:', id, 'extendSelection:', extendSelection);
    handleMediaClick(id);
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <GalleryGrid
          mediaIds={ids}
          selectedIds={selectedIds}
          onSelectId={handleSelectId}
          columnsCount={adaptiveColumnCount}
          position={position}
        />
      )}
    </div>
  );
};

export default GalleryWrapper;
