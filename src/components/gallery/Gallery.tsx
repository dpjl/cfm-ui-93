
import React, { useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import VirtualizedGalleryGrid from './VirtualizedGalleryGrid';
import GalleryEmptyState from './GalleryEmptyState';
import GallerySkeletons from './GallerySkeletons';
import MediaPreview from '../MediaPreview';
import MediaInfoPanel from '../media/MediaInfoPanel';
import { useIsMobile } from '@/hooks/use-breakpoint';
import GalleryToolbar from './GalleryToolbar';
import { GalleryProvider, useGalleryContext } from '@/hooks/use-gallery-context';

// Composant interne qui utilise le contexte
const GalleryContent: React.FC = () => {
  const {
    mediaIds,
    selectedIds,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    selectionMode,
    toggleSelectionMode,
    previewMediaId,
    handleOpenPreview,
    handleClosePreview,
    handleNavigatePreview,
    handleDeleteSelected,
    handleDownloadSelected,
    position,
    mediaInfoMap,
    columnsCount,
    viewMode
  } = useGalleryContext();
  
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCloseInfoPanel = React.useCallback(() => {
    // Désélectionner tous les éléments
    handleDeselectAll();
  }, [handleDeselectAll]);

  const shouldShowInfoPanel = selectedIds.length > 0;

  // Déterminer si un élément est une vidéo
  const isVideoPreview = (id: string): boolean => {
    const info = mediaInfoMap.get(id);
    if (info) {
      const fileName = info.alt?.toLowerCase() || '';
      return fileName.endsWith('.mp4') || fileName.endsWith('.mov');
    }
    return false;
  };
  
  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      <GalleryToolbar
        mediaIds={mediaIds}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        viewMode={viewMode}
        position={position}
        onToggleSidebar={undefined}
        selectionMode={selectionMode}
        onToggleSelectionMode={toggleSelectionMode}
      />
      
      <div className="flex-1 overflow-hidden relative scrollbar-vertical">
        {shouldShowInfoPanel && (
          <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
            <MediaInfoPanel
              selectedIds={selectedIds}
              onOpenPreview={handleOpenPreview}
              onDeleteSelected={handleDeleteSelected}
              onDownloadSelected={handleDownloadSelected}
              mediaInfoMap={mediaInfoMap}
              selectionMode={selectionMode}
              position={position}
              onClose={handleCloseInfoPanel}
            />
          </div>
        )}
        
        {mediaIds.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <VirtualizedGalleryGrid
            mediaIds={mediaIds}
            selectedIds={selectedIds}
            onSelectId={handleSelectItem}
            columnsCount={columnsCount}
            viewMode={viewMode}
            position={position}
          />
        )}
      </div>
      
      {previewMediaId && (
        <MediaPreview 
          mediaId={previewMediaId}
          isVideo={isVideoPreview(previewMediaId)}
          onClose={handleClosePreview}
          onNext={mediaIds.length > 1 ? () => handleNavigatePreview('next') : undefined}
          onPrevious={mediaIds.length > 1 ? () => handleNavigatePreview('prev') : undefined}
          hasNext={mediaIds.length > 1}
          hasPrevious={mediaIds.length > 1}
          position={position}
        />
      )}
    </div>
  );
};

// Props pour le composant Gallery externe
interface GalleryProps {
  title: string;
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  columnsCount: number;
  onPreviewMedia?: (id: string) => void;
  viewMode?: 'single' | 'split';
  onDeleteSelected: () => void;
  position?: 'source' | 'destination';
  filter?: string;
  onToggleSidebar?: () => void;
}

// Composant principal qui fournit le contexte
const Gallery: React.FC<GalleryProps> = ({
  title,
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading = false,
  isError = false,
  error,
  columnsCount,
  onPreviewMedia,
  viewMode = 'single',
  onDeleteSelected,
  position = 'source',
  filter = 'all',
  onToggleSidebar
}) => {
  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mt-2">
          <GallerySkeletons columnsCount={columnsCount} />
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-destructive">Error loading gallery: {String(error)}</div>
      </div>
    );
  }

  return (
    <GalleryProvider
      mediaIds={mediaIds}
      selectedIds={selectedIds}
      onSelectId={onSelectId}
      onDeleteSelected={onDeleteSelected}
      columnsCount={columnsCount}
      viewMode={viewMode}
      position={position}
      onPreviewMedia={onPreviewMedia}
    >
      <GalleryContent />
    </GalleryProvider>
  );
};

export default Gallery;
