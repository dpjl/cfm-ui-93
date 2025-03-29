
import React, { useRef, useEffect } from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useLanguage } from '@/hooks/use-language';
import { X } from 'lucide-react';
import { 
  Calendar, 
  Camera, 
  FileText, 
  FolderOpen, 
  HardDrive, 
  Hash, 
  Copy,
  Trash2,
  Download,
  Eye,
  Maximize2,
  LayoutGrid
} from 'lucide-react';

interface FloatingMediaInfoPanelProps {
  selectedIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (id: string) => void;
  onDeleteSelected: () => void;
  onDownloadSelected: (ids: string[]) => void;
  mediaInfoMap?: Map<string, DetailedMediaInfo | null>;
  selectionMode: 'single' | 'multiple';
  position?: {x: number, y: number} | null;
}

const FloatingMediaInfoPanel: React.FC<FloatingMediaInfoPanelProps> = ({
  selectedIds,
  isOpen,
  onClose,
  onOpenPreview,
  onDeleteSelected,
  onDownloadSelected,
  mediaInfoMap = new Map(),
  selectionMode,
  position
}) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Get detailed info for the selected item (if only one is selected)
  const detailedInfo = selectedIds.length === 1 ? mediaInfoMap.get(selectedIds[0]) : null;

  // Ensure that element is visible when panel opens
  useEffect(() => {
    if (isOpen && position && panelRef.current) {
      // Find selected item element
      const selectedElement = document.querySelector(`[data-media-id="${selectedIds[0]}"]`) as HTMLElement;
      
      if (selectedElement) {
        // Check if the panel overlaps with the selected element
        const panelRect = panelRef.current.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        
        // If there's overlap, scroll down slightly to make the element visible
        if (
          panelRect.left < elementRect.right &&
          panelRect.right > elementRect.left &&
          panelRect.top < elementRect.bottom &&
          panelRect.bottom > elementRect.top
        ) {
          const scrollOffset = 60; // Adjust this value as needed
          window.scrollBy({ top: scrollOffset, behavior: 'smooth' });
        }
      }
    }
  }, [isOpen, position, selectedIds]);

  if (!isOpen || selectedIds.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 bg-background/95 backdrop-blur-sm border border-border/60 shadow-lg rounded-md overflow-hidden"
      style={{
        top: position?.y ? position.y + 20 : '20%',
        left: position?.x ? position.x - 160 : '50%',
        maxWidth: isMobile ? '90vw' : '340px',
        transform: position?.x ? 'none' : 'translateX(-50%)',
      }}
    >
      {/* Header with action buttons */}
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-sm font-medium">
          {selectedIds.length === 1 
            ? t('mediaInformation') 
            : `${selectedIds.length} ${t('itemsSelected')}`}
        </h3>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('close')}</span>
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-1 p-2 border-b">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => selectedIds.length === 1 ? onOpenPreview(selectedIds[0]) : null}
          disabled={selectedIds.length !== 1}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          {!isMobile && t('preview')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDownloadSelected(selectedIds)}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          {!isMobile && t('download')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDeleteSelected}
          className="flex items-center gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {!isMobile && t('delete')}
        </Button>
      </div>

      {/* Detailed info section - only visible when a single item is selected in single selection mode */}
      {selectedIds.length === 1 && selectionMode === 'single' && (
        <div className="p-3 max-h-[50vh] overflow-y-auto">
          {!detailedInfo ? (
            <div className="text-center py-2 text-muted-foreground">
              {t('noDetailedInformation')}
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {detailedInfo.name && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('name')}:</span>
                  <span className="truncate flex-1">{detailedInfo.name}</span>
                </div>
              )}

              {detailedInfo.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('date')}:</span>
                  <span className="flex-1">{new Date(detailedInfo.createdAt).toLocaleString()}</span>
                </div>
              )}

              {detailedInfo.path && (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('path')}:</span>
                  <span className="truncate flex-1">{detailedInfo.path}</span>
                </div>
              )}

              {detailedInfo.size && (
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('size')}:</span>
                  <span className="flex-1">{detailedInfo.size}</span>
                </div>
              )}

              {detailedInfo.dimensions && (
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('dimensions')}:</span>
                  <span className="flex-1">{detailedInfo.dimensions}</span>
                </div>
              )}

              {detailedInfo.cameraModel && (
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('camera')}:</span>
                  <span className="truncate flex-1">{detailedInfo.cameraModel}</span>
                </div>
              )}

              {detailedInfo.hash && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('hash')}:</span>
                  <span className="truncate flex-1">{detailedInfo.hash}</span>
                </div>
              )}

              {detailedInfo.duplicatesCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('duplicates')}:</span>
                  <span className="flex-1">{detailedInfo.duplicatesCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FloatingMediaInfoPanel;
