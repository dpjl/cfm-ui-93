import React, { useState } from 'react';
import Gallery from '@/components/gallery/Gallery';

interface GalleryContentProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  onPreviewItem: (id: string) => void;
  onDeleteSelected: () => void;
  title: string;
  filter?: string;
  position?: 'source' | 'destination';
  onToggleSidebar?: () => void;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading,
  isError,
  error,
  columnsCount,
  viewMode = 'single',
  onPreviewItem,
  onDeleteSelected,
  title,
  filter = 'all',
  position = 'source',
  onToggleSidebar
}) => {
  return (
    <Gallery
      title={title}
      mediaIds={mediaIds}
      selectedIds={selectedIds}
      onSelectId={onSelectId}
      isLoading={isLoading}
      columnsCount={columnsCount}
      onPreviewMedia={onPreviewItem}
      viewMode={viewMode}
      onDeleteSelected={onDeleteSelected}
      position={position}
      isError={isError}
      error={error}
      filter={filter}
      onToggleSidebar={onToggleSidebar}
    />
  );
};

export default GalleryContent;
