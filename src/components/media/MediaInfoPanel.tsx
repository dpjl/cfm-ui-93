
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { useMediaInfo } from '../../hooks/use-media-info';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { DetailedMediaInfo } from '@/api/imageApi';
import { SelectionMode } from '@/hooks/use-gallery-selection';

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
  // If we have multiple selections, use the first one for display
  const displayId = mediaId || (selectedIds.length > 0 ? selectedIds[0] : null);
  
  // Get media info from the map or use the hook for a single item
  const { mediaInfo, isLoading, error } = useMediaInfo(displayId, true, position);
  
  // If there's no media to display, don't render the panel
  if (!displayId) return null;
  
  // Use the media info from the map if available, otherwise use the hook result
  const displayInfo = mediaInfoMap.get(displayId) || mediaInfo;

  return (
    <Card className="p-4 rounded-lg shadow-lg border border-border w-full max-w-xs bg-background/95 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Media Information</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-7 w-7"
          aria-label="Close panel"
        >
          <X size={16} />
        </Button>
      </div>
      
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      
      {error && <p className="text-sm text-destructive">Failed to load media info</p>}
      
      {displayInfo && (
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground block">Filename</span>
            <span className="text-sm truncate block">{displayInfo.alt}</span>
          </div>
          
          {displayInfo.createdAt && (
            <div>
              <span className="text-xs text-muted-foreground block">Created</span>
              <span className="text-sm">
                {new Date(displayInfo.createdAt).toLocaleDateString()} 
                ({formatDistanceToNow(new Date(displayInfo.createdAt), { addSuffix: true })})
              </span>
            </div>
          )}
          
          <div>
            <span className="text-xs text-muted-foreground block">Type</span>
            <span className="text-sm">
              {displayInfo.alt?.toLowerCase().endsWith('.mp4') || 
               displayInfo.alt?.toLowerCase().endsWith('.mov') 
                ? 'Video' 
                : 'Image'}
            </span>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenPreview(displayId)}
              className="flex-1"
            >
              Preview
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDeleteSelected}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MediaInfoPanel;
