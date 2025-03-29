
import React from 'react';
import { Button } from '../ui/button';
import { useGallerySelection, SelectionMode } from '../../hooks/use-gallery-selection';
import { useMediaQuery } from '../../hooks/use-media-query';

interface GalleryToolbarProps {
  directory?: string;
  showSidePanel?: () => void;
  mediaIds: string[];
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  showDates?: boolean;
  onToggleDates?: () => void;
  viewMode?: 'single' | 'split';
  position?: 'source' | 'destination';
  onToggleSidebar?: () => void;
  selectionMode: SelectionMode;
  onToggleSelectionMode: () => void;
}

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({ 
  directory = "", 
  showSidePanel,
  mediaIds,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  viewMode = 'single',
  position = 'source',
  onToggleSidebar,
  selectionMode,
  onToggleSelectionMode
}) => {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="flex items-center space-x-2 py-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        disabled={mediaIds.length === 0}
      >
        Select All
      </Button>
      
      {selectedIds.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
        >
          Clear Selection
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelectionMode}
        className="ml-2"
      >
        {selectionMode === 'single' ? 'Single Select' : 'Multi Select'}
      </Button>
      
      {!isLargeScreen && onToggleSidebar && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSidebar}
          className="ml-auto"
        >
          Filters
        </Button>
      )}
    </div>
  );
};

export default GalleryToolbar;
