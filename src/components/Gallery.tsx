
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import VirtualizedGalleryGrid from './gallery/VirtualizedGalleryGrid';
import GalleryEmptyState from './gallery/GalleryEmptyState';
import GallerySkeletons from './gallery/GallerySkeletons';
import MediaPreview from './MediaPreview';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGallerySelection } from '@/hooks/use-gallery-selection';
import { useGalleryPreviewHandler } from '@/hooks/use-gallery-preview-handler';
import GalleryToolbar from './gallery/GalleryToolbar';
import { useGalleryMediaHandler } from '@/hooks/use-gallery-media-handler';
import FloatingMediaInfoPanel from './media/FloatingMediaInfoPanel';
import { useIsMobile } from '@/hooks/use-breakpoint';

export interface ImageItem {
  id: string;
  src?: string;
  alt?: string;
  directory?: string;
  createdAt?: string;
  type?: "image" | "video";
}

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
  const [showDates, setShowDates] = useState(false);
  const [mediaInfoMap, setMediaInfoMap] = useState<Map<string, DetailedMediaInfo | null>>(new Map());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{x: number, y: number} | null>(null);
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialiser les fonctionnalités de sélection de la galerie
  const selection = useGallerySelection({
    mediaIds,
    selectedIds,
    onSelectId
  });
  
  // Initialiser les fonctionnalités d'aperçu
  const preview = useGalleryPreviewHandler({
    mediaIds,
    onPreviewMedia
  });
  
  // Initialiser les opérations sur les médias
  const mediaHandler = useGalleryMediaHandler(
    selectedIds,
    position
  );

  // Collecter les informations sur les médias à partir des composants enfants
  const updateMediaInfo = useCallback((id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  }, []);

  const toggleDates = useCallback(() => {
    setShowDates(prev => !prev);
  }, []);
  
  // Gérer l'ouverture du panneau d'information
  useEffect(() => {
    if (selectedIds.length > 0) {
      // Trouver l'élément sélectionné dans le DOM
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-media-id="${selectedIds[0]}"]`) as HTMLElement;
        if (selectedElement) {
          const rect = selectedElement.getBoundingClientRect();
          setPanelPosition({
            x: rect.left + (rect.width / 2),
            y: rect.top + (rect.height / 2)
          });
          setIsPanelOpen(true);
        } else {
          setIsPanelOpen(true); // Fallback si l'élément n'est pas trouvé
        }
      }, 50);
    } else {
      setIsPanelOpen(false);
    }
  }, [selectedIds]);
  
  // Fermer le panneau
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);
  
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
    <div className="flex flex-col h-full relative" ref={containerRef}>
      <GalleryToolbar
        selectedIds={selectedIds}
        mediaIds={mediaIds}
        onSelectAll={selection.handleSelectAll}
        onDeselectAll={selection.handleDeselectAll}
        showDates={showDates}
        onToggleDates={toggleDates}
        viewMode={viewMode}
        position={position}
        onToggleSidebar={onToggleSidebar}
        selectionMode={selection.selectionMode}
        onToggleSelectionMode={selection.toggleSelectionMode}
      />
      
      {mediaIds.length === 0 ? (
        <GalleryEmptyState />
      ) : (
        <div className="flex-1 overflow-hidden relative gallery-scrollbar">
          {/* Indicateurs de défilement pour mobile */}
          {isMobile && (
            <>
              <div className="scrollbar-pull-indicator top"></div>
              <div className="scrollbar-pull-indicator bottom"></div>
            </>
          )}
          
          <VirtualizedGalleryGrid
            mediaIds={mediaIds}
            selectedIds={selectedIds}
            onSelectId={selection.handleSelectItem}
            columnsCount={columnsCount}
            viewMode={viewMode}
            showDates={showDates}
            updateMediaInfo={updateMediaInfo}
            position={position}
          />
        </div>
      )}
      
      {/* Panneau d'information flottant */}
      <FloatingMediaInfoPanel
        selectedIds={selectedIds}
        isOpen={isPanelOpen && selectedIds.length > 0}
        onClose={handleClosePanel}
        onOpenPreview={preview.handleOpenPreview}
        onDeleteSelected={onDeleteSelected}
        onDownloadSelected={mediaHandler.handleDownloadSelected}
        mediaInfoMap={mediaInfoMap}
        selectionMode={selection.selectionMode}
        position={panelPosition}
      />
      
      <MediaPreview 
        mediaId={preview.previewMediaId}
        isOpen={preview.previewMediaId !== null}
        onClose={preview.handleClosePreview}
        allMediaIds={mediaIds}
        onNavigate={preview.handleNavigatePreview}
        position={position}
      />
    </div>
  );
};

export default Gallery;
