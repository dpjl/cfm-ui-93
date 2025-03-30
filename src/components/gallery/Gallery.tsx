
import React, { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import VirtualizedGalleryGrid from './VirtualizedGalleryGrid';
import GalleryEmptyState from './GalleryEmptyState';
import GallerySkeletons from './GallerySkeletons';
import MediaPreview from '../MediaPreview';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGallerySelection } from '@/hooks/use-gallery-selection';
import { useGalleryPreviewHandler } from '@/hooks/use-gallery-preview-handler';
import GalleryToolbar from './GalleryToolbar';
import { useGalleryMediaHandler } from '@/hooks/use-gallery-media-handler';
import MediaInfoPanel from '../media/MediaInfoPanel';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MediaItem, MobileViewMode } from '@/types/gallery';

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
  gap?: number;
  mobileViewMode?: MobileViewMode;
  onToggleFullView?: () => void;
  onColumnsChange?: (count: number) => void;
}

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
  onToggleSidebar,
  gap = 8,
  mobileViewMode,
  onToggleFullView,
  onColumnsChange
}) => {
  const [mediaInfoMap, setMediaInfoMap] = useState<Map<string, DetailedMediaInfo | null>>(new Map());
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hooks custom pour la gestion de la galerie
  const selection = useGallerySelection({
    mediaIds,
    selectedIds,
    onSelectId
  });
  
  const preview = useGalleryPreviewHandler({
    mediaIds,
    onPreviewMedia
  });
  
  const mediaHandler = useGalleryMediaHandler(
    selectedIds,
    position
  );

  // Mettre à jour les informations sur les médias
  const updateMediaInfo = useCallback((id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  }, []);

  // Vérifier si nous devons afficher le panneau d'informations
  const shouldShowInfoPanel = selectedIds.length > 0;
  
  // Fermer le panneau d'informations
  const handleCloseInfoPanel = useCallback(() => {
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);
  
  // Afficher les éléments de chargement si nécessaire
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mt-2">
          <GallerySkeletons columnsCount={columnsCount} />
        </div>
      </div>
    );
  }
  
  // Afficher les erreurs si nécessaire
  if (isError) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-destructive">Error loading gallery: {String(error)}</div>
      </div>
    );
  }

  // Déterminer si une prévisualisation est une vidéo
  const isVideoPreview = (id: string): boolean => {
    const info = mediaInfoMap.get(id);
    if (info) {
      const fileName = info.alt?.toLowerCase() || '';
      return fileName.endsWith('.mp4') || fileName.endsWith('.mov');
    }
    return false;
  };
  
  // Rendre la galerie
  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      <GalleryToolbar
        mediaIds={mediaIds}
        selectedIds={selectedIds}
        onSelectAll={selection.handleSelectAll}
        onDeselectAll={selection.handleDeselectAll}
        viewMode={viewMode}
        position={position}
        onToggleSidebar={onToggleSidebar}
        selectionMode={selection.selectionMode}
        onToggleSelectionMode={selection.toggleSelectionMode}
        mobileViewMode={mobileViewMode}
        onToggleFullView={onToggleFullView}
        onColumnsChange={onColumnsChange}
        columnsCount={columnsCount}
      />
      
      <div className="flex-1 overflow-hidden relative scrollbar-vertical">
        {shouldShowInfoPanel && (
          <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
            <MediaInfoPanel
              selectedIds={selectedIds}
              onOpenPreview={preview.handleOpenPreview}
              onDeleteSelected={onDeleteSelected}
              onDownloadSelected={mediaHandler.handleDownloadSelected}
              mediaInfoMap={mediaInfoMap}
              selectionMode={selection.selectionMode}
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
            onSelectId={selection.handleSelectItem}
            columnsCount={columnsCount}
            viewMode={viewMode}
            updateMediaInfo={updateMediaInfo}
            position={position}
            gap={gap}
          />
        )}
      </div>
      
      {preview.previewMediaId && (
        <MediaPreview 
          mediaId={preview.previewMediaId}
          isVideo={isVideoPreview(preview.previewMediaId)}
          onClose={preview.handleClosePreview}
          onNext={mediaIds.length > 1 ? () => preview.handleNavigatePreview('next') : undefined}
          onPrevious={mediaIds.length > 1 ? () => preview.handleNavigatePreview('prev') : undefined}
          hasNext={mediaIds.length > 1}
          hasPrevious={mediaIds.length > 1}
          position={position}
        />
      )}
    </div>
  );
};

export default Gallery;
