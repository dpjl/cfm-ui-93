
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
  const scrollbarRef = useRef<HTMLDivElement>(null);
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
    const galleryElement = containerRef.current?.querySelector('.gallery-scrollbar');
    if (!galleryElement) return;
    
    // Find the first visible media item
    const visibleItems = galleryElement.querySelectorAll('.image-card');
    
    if (visibleItems.length > 0) {
      const firstVisibleItem = Array.from(visibleItems).find(item => {
        const rect = item.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
      
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
    }
  }, [mediaInfoMap]);

  // Update scroll handle position and height
  const updateScrollHandleGeometry = useCallback(() => {
    const galleryElement = containerRef.current?.querySelector('.gallery-scrollbar');
    const scrollHandle = scrollHandleRef.current;
    
    if (!galleryElement || !scrollHandle) return;
    
    const { scrollHeight, clientHeight, scrollTop } = galleryElement as HTMLElement;
    const scrollRatio = clientHeight / scrollHeight;
    
    // Set handle height (min 40px, max 120px)
    const handleHeight = Math.max(
      Math.min(scrollRatio * clientHeight, 120),
      40
    );
    setScrollHandleHeight(handleHeight);
    
    // Set handle position
    const scrollPercent = scrollTop / (scrollHeight - clientHeight);
    const handleTop = scrollPercent * (clientHeight - handleHeight);
    setScrollHandleTop(handleTop);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const galleryElement = containerRef.current?.querySelector('.gallery-scrollbar');
    
    if (!galleryElement) return;
    
    const handleScroll = () => {
      setIsScrolling(true);
      updateVisibleDate();
      updateScrollHandleGeometry();
      
      // Clear previous timeout if exists
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to hide indicators after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };
    
    galleryElement.addEventListener('scroll', handleScroll);
    
    return () => {
      galleryElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateVisibleDate, updateScrollHandleGeometry]);

  // Initialize scroll handle on component mount
  useEffect(() => {
    updateScrollHandleGeometry();
    
    // Also update on window resize
    const handleResize = () => {
      updateScrollHandleGeometry();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollHandleGeometry]);

  // Mouse and touch events for scroll handle dragging
  useEffect(() => {
    const scrollHandle = scrollHandleRef.current;
    const galleryElement = containerRef.current?.querySelector('.gallery-scrollbar') as HTMLElement;
    
    if (!scrollHandle || !galleryElement) return;
    
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      scrollHandle.classList.add('active');
      
      // Get start positions
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : e.clientY;
      
      startDragYRef.current = clientY;
      startScrollTopRef.current = galleryElement.scrollTop;
    };
    
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : e.clientY;
      
      const deltaY = clientY - startDragYRef.current;
      const { scrollHeight, clientHeight } = galleryElement;
      
      // Calculate new scroll position
      const scrollRatio = scrollHeight / clientHeight;
      const newScrollTop = startScrollTopRef.current + (deltaY * scrollRatio);
      
      // Apply new scroll position
      galleryElement.scrollTop = newScrollTop;
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      scrollHandle.classList.remove('active');
    };
    
    // Add mouse event listeners
    scrollHandle.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add touch event listeners
    scrollHandle.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      // Remove all event listeners
      scrollHandle.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      scrollHandle.removeEventListener('touchstart', handleMouseDown);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

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
        className={`flex-1 overflow-hidden relative custom-scrollbar gallery-scrollbar ${isScrolling ? 'scrolling' : ''}`}
        ref={scrollbarRef}
      >
        {/* Indicateur de date flottant */}
        <div 
          className={`scrollbar-indicator ${isScrolling ? 'visible' : ''}`} 
          style={{ top: `${scrollHandleTop + scrollHandleHeight/2}px`, transform: 'translateY(-50%)' }}
        >
          <Calendar className="date-icon" size={12} />
          {formatDateDisplay(visibleDateInfo)}
        </div>
        
        {/* Poignée de défilement personnalisée */}
        <div 
          className="scrollbar-handle" 
          ref={scrollHandleRef}
          style={{ 
            height: `${scrollHandleHeight}px`,
            top: `${scrollHandleTop}px`,
            opacity: isScrolling ? 1 : 0.3
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
