
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, Eye, Trash, Download } from 'lucide-react';
import { useMediaInfo } from '../../hooks/use-media-info';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { DetailedMediaInfo } from '@/api/imageApi';
import { SelectionMode } from '@/hooks/use-gallery-selection';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaInfoPanelProps {
  mediaId?: string | null;
  onClose?: () => void;
  selectedIds: string[];
  onOpenPreview: (id: string) => void;
  onDeleteSelected: () => void;
  onDownloadSelected: (ids?: string[]) => void;
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  selectionMode: SelectionMode;
  position: 'source' | 'destination';
}

const MediaInfoPanel: React.FC<MediaInfoPanelProps> = ({
  mediaId,
  onClose,
  selectedIds,
  onOpenPreview,
  onDeleteSelected,
  onDownloadSelected,
  mediaInfoMap,
  selectionMode,
  position
}) => {
  const isMobile = useIsMobile();
  // If we have multiple selections, use the first one for display
  const displayId = mediaId || (selectedIds.length > 0 ? selectedIds[0] : null);
  
  // Get media info from the map or use the hook for a single item
  const { mediaInfo, isLoading, error } = useMediaInfo(displayId, true, position);
  
  // If there's no media to display, don't render the panel
  if (!displayId) return null;
  
  // Use the media info from the map if available, otherwise use the hook result
  const displayInfo = mediaInfoMap.get(displayId) || mediaInfo;
  
  // Multi-selection mode with more than 1 item
  const isMultiSelection = selectedIds.length > 1;

  const cardClassNames = `p-3 rounded-lg shadow-lg border border-border ${isMobile 
    ? 'bg-background/95 backdrop-blur-sm max-w-[170px] max-h-[200px] overflow-auto' 
    : 'bg-background/95 backdrop-blur-sm max-w-xs'}`;

  return (
    <Card className={cardClassNames}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-medium flex items-center gap-1`}>
          {isMultiSelection ? (
            <>Selected <span className="font-bold">{selectedIds.length}</span> items</>
          ) : (
            <>Media Info</>
          )}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'}`}
          aria-label="Close panel"
        >
          <X size={isMobile ? 14 : 16} />
        </Button>
      </div>
      
      <ScrollArea className={`${isMobile ? 'max-h-[120px]' : ''}`}>
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        
        {error && <p className="text-sm text-destructive">Failed to load media info</p>}
        
        {displayInfo && !isMultiSelection && (
          <div className="space-y-1.5">
            <div>
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground block`}>Filename</span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} truncate block`}>{displayInfo.alt}</span>
            </div>
            
            {displayInfo.createdAt && (
              <div>
                <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground block`}>Created</span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {new Date(displayInfo.createdAt).toLocaleDateString()} 
                  <span className="text-muted-foreground ml-1">
                    ({formatDistanceToNow(new Date(displayInfo.createdAt), { addSuffix: true })})
                  </span>
                </span>
              </div>
            )}
            
            <div>
              <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground block`}>Type</span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                {displayInfo.alt?.toLowerCase().endsWith('.mp4') || 
                displayInfo.alt?.toLowerCase().endsWith('.mov') 
                  ? 'Video' 
                  : 'Image'}
              </span>
            </div>
          </div>
        )}
      </ScrollArea>
      
      <div className={`flex space-x-1 mt-3 ${isMobile ? 'justify-center' : ''}`}>
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={() => onOpenPreview(displayId)}
          className={isMobile ? "h-7 w-7" : ""}
          title="Preview"
        >
          {isMobile ? <Eye size={16} /> : <><Eye size={16} /><span>Preview</span></>}
        </Button>
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={onDeleteSelected}
          className={isMobile ? "h-7 w-7" : ""}
          title="Delete"
        >
          {isMobile ? <Trash size={16} /> : <><Trash size={16} /><span>Delete</span></>}
        </Button>
        <Button 
          variant="outline" 
          size={isMobile ? "icon" : "sm"}
          onClick={() => onDownloadSelected(selectedIds)}
          className={isMobile ? "h-7 w-7" : ""}
          title="Download"
        >
          {isMobile ? <Download size={16} /> : <><Download size={16} /><span>Download</span></>}
        </Button>
      </div>
    </Card>
  );
};

export default MediaInfoPanel;
