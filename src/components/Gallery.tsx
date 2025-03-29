
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
import MediaInfoPanel from './media/MediaInfoPanel';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollAreaWithDateIndicator } from './ui/scroll-area-with-date-indicator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';

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
  const [mediaInfoMap, setMediaInfoMap] = useState<Map<string, DetailedMediaInfo | null>>(new Map());
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);
  const [dateIndicator, setDateIndicator] = useState({
    visible: false,
    formattedDate: ""
  });
  const dateIndicatorTimerRef = useRef<number | null>(null);
  
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

  // Déselectionner les éléments
  const handleClearSelection = useCallback(() => {
    selection.handleDeselectAll();
  }, [selection]);
  
  // Gestionnaire de défilement simplifié pour afficher la date
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Trouver le premier élément visible
    const scrollContainer = e.currentTarget;
    const mediaElements = scrollContainer.querySelectorAll('[data-media-id]');
    
    if (mediaElements.length > 0) {
      const containerRect = scrollContainer.getBoundingClientRect();
      
      // Recherche de l'élément le plus visible
      let mostVisibleElement = null;
      let maxVisibleArea = 0;
      
      for (const element of mediaElements) {
        const elementRect = element.getBoundingClientRect();
        
        // Calculer la zone visible de l'élément
        const visibleTop = Math.max(elementRect.top, containerRect.top);
        const visibleBottom = Math.min(elementRect.bottom, containerRect.bottom);
        
        if (visibleBottom > visibleTop) {
          const visibleArea = visibleBottom - visibleTop;
          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            mostVisibleElement = element;
          }
        }
      }
      
      if (mostVisibleElement) {
        const mediaId = mostVisibleElement.getAttribute('data-media-id');
        if (mediaId && mediaInfoMap.has(mediaId)) {
          const mediaInfo = mediaInfoMap.get(mediaId);
          
          if (mediaInfo?.createdAt) {
            try {
              const date = new Date(mediaInfo.createdAt);
              const formattedDate = format(date, 'dd MMMM yyyy', { locale: fr });
              
              setDateIndicator({
                visible: true,
                formattedDate
              });
              
              // Masquer l'indicateur après un délai
              if (dateIndicatorTimerRef.current) {
                window.clearTimeout(dateIndicatorTimerRef.current);
              }
              
              dateIndicatorTimerRef.current = window.setTimeout(() => {
                setDateIndicator(prev => ({ ...prev, visible: false }));
              }, 1500);
            } catch (error) {
              console.error('Error formatting date:', error);
            }
          }
        }
      }
    }
  }, [mediaInfoMap]);
  
  // Nettoyer le timer lors du démontage
  useEffect(() => {
    return () => {
      if (dateIndicatorTimerRef.current) {
        window.clearTimeout(dateIndicatorTimerRef.current);
      }
    };
  }, []);

  // Déterminer si nous devons afficher le panneau d'information
  const shouldShowInfoPanel = selectedIds.length > 0;
  
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
        viewMode={viewMode}
        position={position}
        onToggleSidebar={onToggleSidebar}
        selectionMode={selection.selectionMode}
        onToggleSelectionMode={selection.toggleSelectionMode}
      />
      
      <div className="flex-1 overflow-hidden relative gallery-scrollbar">
        {/* Indicateurs de défilement pour mobile */}
        {isMobile && (
          <>
            <div className="scrollbar-pull-indicator top"></div>
            <div className="scrollbar-pull-indicator bottom"></div>
          </>
        )}
        
        {/* Panneau d'information flottant */}
        {shouldShowInfoPanel && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-background/85 backdrop-blur-sm shadow-md rounded-md m-2 p-4">
            <button 
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground"
              onClick={handleClearSelection}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
            <MediaInfoPanel
              selectedIds={selectedIds}
              onOpenPreview={preview.handleOpenPreview}
              onDeleteSelected={onDeleteSelected}
              onDownloadSelected={mediaHandler.handleDownloadSelected}
              mediaInfoMap={mediaInfoMap}
              selectionMode={selection.selectionMode}
              position={position}
              onClose={handleClearSelection}
            />
          </div>
        )}
        
        {dateIndicator.visible && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-md z-50 pointer-events-none">
            {dateIndicator.formattedDate}
          </div>
        )}
        
        <ScrollAreaWithDateIndicator 
          className="h-full" 
          onScroll={handleScroll} 
          mediaInfoMap={mediaInfoMap} 
          mediaIds={mediaIds}
        >
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
              ref={gridRef}
            />
          )}
        </ScrollAreaWithDateIndicator>
      </div>
      
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
