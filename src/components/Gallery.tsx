
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
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

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
  const scrollbarContainerRef = useRef<HTMLDivElement>(null);
  const scrollHandleRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [visibleDateInfo, setVisibleDateInfo] = useState<string | null>(null);
  const [scrollHandleHeight, setScrollHandleHeight] = useState(100);
  const [scrollHandleTop, setScrollHandleTop] = useState(0);
  const isDraggingRef = useRef(false);
  const startDragYRef = useRef(0);
  const startScrollTopRef = useRef(0);
  
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

  const updateMediaInfo = useCallback((id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  }, []);

  // Helper to find the date of the first visible media item
  const updateVisibleDate = useCallback(() => {
    if (!scrollbarContainerRef.current) return;
    
    // Trouver tous les éléments image-card visibles
    const galleryItems = scrollbarContainerRef.current.querySelectorAll('.image-card');
    if (galleryItems.length === 0) return;
    
    const containerRect = scrollbarContainerRef.current.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    // Trouver la première carte visible
    let firstVisibleItem: Element | null = null;
    
    for (const item of Array.from(galleryItems)) {
      const itemRect = item.getBoundingClientRect();
      const itemTop = itemRect.top;
      
      // Si l'élément est visible dans le conteneur
      if (itemTop >= containerTop && itemTop < containerTop + containerHeight) {
        firstVisibleItem = item;
        break;
      }
    }
    
    if (firstVisibleItem) {
      const mediaId = firstVisibleItem.getAttribute('data-media-id');
      if (mediaId) {
        const mediaInfo = mediaInfoMap.get(mediaId);
        if (mediaInfo?.createdAt) {
          setVisibleDateInfo(mediaInfo.createdAt);
        } else {
          setVisibleDateInfo(null);
        }
      }
    }
  }, [mediaInfoMap]);

  // Update scroll handle position and height
  const updateScrollHandleGeometry = useCallback(() => {
    if (!scrollbarContainerRef.current || !scrollHandleRef.current) return;
    
    const { scrollHeight, clientHeight, scrollTop } = scrollbarContainerRef.current;
    
    // Éviter la division par zéro
    if (scrollHeight <= 0) return;
    
    // Calculer la hauteur proportionnelle de la poignée (min 40px, max 120px)
    const ratio = clientHeight / scrollHeight;
    const handleHeight = Math.max(Math.min(ratio * clientHeight, 120), 40);
    setScrollHandleHeight(handleHeight);
    
    // Calculer la position verticale de la poignée
    const maxScrollDistance = scrollHeight - clientHeight;
    const scrollPercent = maxScrollDistance <= 0 ? 0 : scrollTop / maxScrollDistance;
    const maxHandleTravel = clientHeight - handleHeight;
    const handleTop = scrollPercent * maxHandleTravel;
    
    setScrollHandleTop(handleTop);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const scrollContainer = scrollbarContainerRef.current;
    
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      setIsScrolling(true);
      updateVisibleDate();
      updateScrollHandleGeometry();
      
      // Reset timeout to hide indicators
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateVisibleDate, updateScrollHandleGeometry]);

  // Initialize scroll handle on component mount and update on window resize
  useEffect(() => {
    updateScrollHandleGeometry();
    
    const handleResize = () => {
      updateScrollHandleGeometry();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial update
    setTimeout(updateScrollHandleGeometry, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollHandleGeometry]);

  // Mouse and touch events for scroll handle dragging
  useEffect(() => {
    const scrollHandle = scrollHandleRef.current;
    const scrollContainer = scrollbarContainerRef.current;
    
    if (!scrollHandle || !scrollContainer) return;
    
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      scrollHandle.classList.add('active');
      
      // Get start positions
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : e.clientY;
      
      startDragYRef.current = clientY;
      startScrollTopRef.current = scrollContainer.scrollTop;
    };
    
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !scrollContainer) return;
      
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : e.clientY;
      
      const deltaY = clientY - startDragYRef.current;
      const { scrollHeight, clientHeight } = scrollContainer;
      
      // Calculate scroll ratio and new position
      const scrollableDistance = scrollHeight - clientHeight;
      const handleTrackSize = clientHeight - scrollHandleHeight;
      const scrollRatio = scrollableDistance / handleTrackSize;
      
      // Apply new scroll position
      scrollContainer.scrollTop = startScrollTopRef.current + (deltaY * scrollRatio);
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (scrollHandle) {
        scrollHandle.classList.remove('active');
      }
    };
    
    // Add mouse event listeners
    scrollHandle.addEventListener('mousedown', handleMouseDown as EventListener);
    document.addEventListener('mousemove', handleMouseMove as EventListener);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add touch event listeners
    scrollHandle.addEventListener('touchstart', handleMouseDown as EventListener);
    document.addEventListener('touchmove', handleMouseMove as EventListener);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      // Remove all event listeners
      scrollHandle.removeEventListener('mousedown', handleMouseDown as EventListener);
      document.removeEventListener('mousemove', handleMouseMove as EventListener);
      document.removeEventListener('mouseup', handleMouseUp);
      
      scrollHandle.removeEventListener('touchstart', handleMouseDown as EventListener);
      document.removeEventListener('touchmove', handleMouseMove as EventListener);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [scrollHandleHeight]);

  const shouldShowInfoPanel = selectedIds.length > 0;
  
  const handleCloseInfoPanel = useCallback(() => {
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);
  
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return '';
    }
  };
  
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
        onSelectAll={selection.handleSelectAll}
        onDeselectAll={selection.handleDeselectAll}
        viewMode={viewMode}
        position={position}
        onToggleSidebar={onToggleSidebar}
        selectionMode={selection.selectionMode}
        onToggleSelectionMode={selection.toggleSelectionMode}
      />
      
      <div 
        className={`flex-1 overflow-hidden relative custom-scrollbar ${isScrolling ? 'scrolling' : ''}`}
        ref={scrollbarContainerRef}
      >
        {/* Indicateur de date flottant */}
        {visibleDateInfo && (
          <div 
            className={`scrollbar-indicator ${isScrolling ? 'visible' : ''}`} 
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <Calendar className="date-icon" size={12} />
            {formatDateDisplay(visibleDateInfo)}
          </div>
        )}
        
        {/* Poignée de défilement personnalisée */}
        <div 
          className="scrollbar-handle" 
          ref={scrollHandleRef}
          style={{ 
            height: `${scrollHandleHeight}px`,
            top: `${scrollHandleTop}px`,
            opacity: isScrolling ? 1 : undefined
          }}
        />
        
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
