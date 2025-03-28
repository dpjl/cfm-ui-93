
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import GalleryGridContainer from './gallery/GalleryGridContainer';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds, fetchMediaInfo } from '../api/imageApi';

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
  const isMobile = useMediaQuery({ maxWidth: 768 });
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

  return (
    <div className="h-full w-full overflow-hidden">
      <GalleryGridContainer
        items={mediaInfoList.map(info => ({
          id: info.id || '',
          alt: info.alt || '',
          createdAt: info.createdAt || '',
        }))}
        isLoading={isLoading}
        columnCount={adaptiveColumnCount}
        position={position}
        onMediaClick={handleMediaClick}
      />
    </div>
  );
};

export default GalleryWrapper;
