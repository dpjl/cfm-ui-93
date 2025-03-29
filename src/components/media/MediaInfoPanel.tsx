
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';
import { useMediaInfo } from '../../hooks/use-media-info';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface MediaInfoPanelProps {
  mediaId: string | null;
  onClose: () => void;
}

const MediaInfoPanel: React.FC<MediaInfoPanelProps> = ({ mediaId, onClose }) => {
  const { mediaInfo, isLoading, error } = useMediaInfo(mediaId);

  if (!mediaId) return null;

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
      
      {mediaInfo && (
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground block">Filename</span>
            <span className="text-sm truncate block">{mediaInfo.alt}</span>
          </div>
          
          {mediaInfo.createdAt && (
            <div>
              <span className="text-xs text-muted-foreground block">Created</span>
              <span className="text-sm">
                {new Date(mediaInfo.createdAt).toLocaleDateString()} 
                ({formatDistanceToNow(new Date(mediaInfo.createdAt), { addSuffix: true })})
              </span>
            </div>
          )}
          
          <div>
            <span className="text-xs text-muted-foreground block">Type</span>
            <span className="text-sm">
              {mediaInfo.alt?.toLowerCase().endsWith('.mp4') || 
               mediaInfo.alt?.toLowerCase().endsWith('.mov') 
                ? 'Video' 
                : 'Image'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MediaInfoPanel;
