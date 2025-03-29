
import React from 'react';
import { Button } from '../ui/button';
import { useGallerySelectionContext } from '../../hooks/use-gallery-selection';
import { useGalleryStateContext } from '../../hooks/use-gallery-state';
import { useMediaQuery } from '../../hooks/use-media-query';

interface GalleryToolbarProps {
  directory: string;
  showSidePanel?: () => void;
}

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({ directory, showSidePanel }) => {
  const { selectAll, clearSelection, selectedMedia } = useGallerySelectionContext();
  const { isLoading, refreshGallery } = useGalleryStateContext();
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const handleRefresh = () => {
    refreshGallery(directory);
  };

  return (
    <div className="flex items-center space-x-2 py-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        Refresh
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={selectAll}
        disabled={isLoading}
      >
        Select All
      </Button>
      
      {selectedMedia.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearSelection}
        >
          Clear Selection
        </Button>
      )}
      
      {!isLargeScreen && showSidePanel && (
        <Button
          variant="outline"
          size="sm"
          onClick={showSidePanel}
          className="ml-auto"
        >
          Filters
        </Button>
      )}
    </div>
  );
};

export default GalleryToolbar;
