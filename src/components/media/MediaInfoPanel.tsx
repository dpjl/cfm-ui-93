
import React from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useLanguage } from '@/hooks/use-language';
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
  X
} from 'lucide-react';

interface MediaInfoPanelProps {
  selectedIds: string[];
  onOpenPreview: (id: string) => void;
  onDeleteSelected: () => void;
  onDownloadSelected: (ids: string[]) => void;
  mediaInfoMap?: Map<string, DetailedMediaInfo | null>;
  selectionMode: 'single' | 'multiple';
  onClose: () => void;
}

const MediaInfoPanel: React.FC<MediaInfoPanelProps> = ({
  selectedIds,
  onOpenPreview,
  onDeleteSelected,
  onDownloadSelected,
  mediaInfoMap = new Map(),
  selectionMode,
  onClose
}) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  // Get detailed info for the selected item (if only one is selected)
  const detailedInfo = selectedIds.length === 1 ? mediaInfoMap.get(selectedIds[0]) : null;

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 bg-background/95 backdrop-blur-md border border-border/40 shadow-lg rounded-md p-3"
    >
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">
          {selectedIds.length === 1 
            ? t("mediaInformation") || "Media Information" 
            : `${selectedIds.length} ${t("itemsSelected") || "items selected"}`}
        </h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectedIds.length === 1 ? onOpenPreview(selectedIds[0]) : null}
            disabled={selectedIds.length !== 1}
            title={t("preview") || "Preview"}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDownloadSelected(selectedIds)}
            title={t("download") || "Download"}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDeleteSelected}
            className="text-destructive hover:text-destructive"
            title={t("delete") || "Delete"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            title={t("close") || "Close"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detailed info section - only visible when a single item is selected in single selection mode */}
      {selectedIds.length === 1 && selectionMode === 'single' && (
        <>
          <Separator className="my-2" />
          <div className="text-xs space-y-1.5">
            {!detailedInfo ? (
              <div className="text-center py-2 text-muted-foreground">
                {t("noDetailedInformation") || "No detailed information available"}
              </div>
            ) : (
              <div className={`grid ${isMobile ? "grid-cols-1 gap-y-2" : "grid-cols-2 gap-x-2 gap-y-1"}`}>
                {detailedInfo.name && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("name") || "Name"}:</span>}
                    <span className="truncate">{detailedInfo.name}</span>
                  </div>
                )}

                {detailedInfo.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("date") || "Date"}:</span>}
                    <span>{new Date(detailedInfo.createdAt).toLocaleString()}</span>
                  </div>
                )}

                {detailedInfo.path && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("path") || "Path"}:</span>}
                    <span className="truncate">{detailedInfo.path}</span>
                  </div>
                )}

                {detailedInfo.size && (
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("size") || "Size"}:</span>}
                    <span>{detailedInfo.size}</span>
                  </div>
                )}

                {detailedInfo.cameraModel && (
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("camera") || "Camera"}:</span>}
                    <span className="truncate">{detailedInfo.cameraModel}</span>
                  </div>
                )}
                
                {detailedInfo.dimensions && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-muted-foreground flex items-center justify-center text-xs">⊞</span>
                    {!isMobile && <span className="text-muted-foreground">{t("dimensions") || "Dimensions"}:</span>}
                    <span>{detailedInfo.dimensions}</span>
                  </div>
                )}

                {detailedInfo.hash && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("hash") || "Hash"}:</span>}
                    <span className="truncate">{detailedInfo.hash}</span>
                  </div>
                )}

                {detailedInfo.duplicatesCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    {!isMobile && <span className="text-muted-foreground">{t("duplicates") || "Duplicates"}:</span>}
                    <span>{detailedInfo.duplicatesCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MediaInfoPanel;
