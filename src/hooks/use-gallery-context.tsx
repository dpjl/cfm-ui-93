
import React, { createContext, useContext, ReactNode } from 'react';
import { useGallerySelection } from './use-gallery-selection';
import { useGalleryPreviewHandler } from './use-gallery-preview-handler';
import { useGalleryMediaHandler } from './use-gallery-media-handler';
import { DetailedMediaInfo } from '@/api/imageApi';

// Type définitions pour le contexte
interface GalleryContextProps {
  // Selection state
  selectionMode: 'single' | 'multiple';
  selectedIds: string[];
  handleSelectItem: (id: string, extendSelection?: boolean) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  toggleSelectionMode: () => void;
  
  // Preview state
  previewMediaId: string | null;
  handleOpenPreview: (id: string) => void;
  handleClosePreview: () => void;
  handleNavigatePreview: (direction: 'next' | 'prev') => void;
  
  // Media operations
  handleDeleteSelected: () => void;
  handleDownloadSelected: () => Promise<void>;
  
  // Media data
  mediaIds: string[];
  position: 'source' | 'destination';
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  updateMediaInfo: (id: string, info: DetailedMediaInfo | null) => void;
  
  // UI state
  columnsCount: number;
  viewMode: 'single' | 'split';
}

// Default values for the context
const defaultContextValue: GalleryContextProps = {
  selectionMode: 'single',
  selectedIds: [],
  handleSelectItem: () => {},
  handleSelectAll: () => {},
  handleDeselectAll: () => {},
  toggleSelectionMode: () => {},
  
  previewMediaId: null,
  handleOpenPreview: () => {},
  handleClosePreview: () => {},
  handleNavigatePreview: () => {},
  
  handleDeleteSelected: () => {},
  handleDownloadSelected: async () => {},
  
  mediaIds: [],
  position: 'source',
  mediaInfoMap: new Map(),
  updateMediaInfo: () => {},
  
  columnsCount: 4,
  viewMode: 'single',
};

// Create the context
const GalleryContext = createContext<GalleryContextProps>(defaultContextValue);

// Hook to use the gallery context
export const useGalleryContext = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
};

// Props for the provider component
interface GalleryProviderProps {
  children: ReactNode;
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onDeleteSelected: () => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  position?: 'source' | 'destination';
  onPreviewMedia?: (id: string) => void;
}

// Provider component
export const GalleryProvider: React.FC<GalleryProviderProps> = ({
  children,
  mediaIds,
  selectedIds,
  onSelectId,
  onDeleteSelected,
  columnsCount,
  viewMode = 'single',
  position = 'source',
  onPreviewMedia,
}) => {
  // Use the individual hooks inside the provider
  const selection = useGallerySelection({
    mediaIds,
    selectedIds,
    onSelectId,
    initialSelectionMode: 'single'
  });
  
  const preview = useGalleryPreviewHandler({
    mediaIds,
    onPreviewMedia
  });
  
  const mediaHandler = useGalleryMediaHandler(
    selectedIds,
    position
  );
  
  // State for media info
  const [mediaInfoMap, setMediaInfoMap] = React.useState<Map<string, DetailedMediaInfo | null>>(new Map());
  
  // Function to update media info
  const updateMediaInfo = React.useCallback((id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  }, []);
  
  // Make handleDownloadSelected return a Promise
  const handleDownloadSelectedAsync = React.useCallback(async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      mediaHandler.handleDownloadSelected();
      resolve();
    });
  }, [mediaHandler]);
  
  // Value provided by the context
  const value: GalleryContextProps = {
    // Selection state
    selectionMode: selection.selectionMode,
    selectedIds,
    handleSelectItem: selection.handleSelectItem,
    handleSelectAll: selection.handleSelectAll,
    handleDeselectAll: selection.handleDeselectAll,
    toggleSelectionMode: selection.toggleSelectionMode,
    
    // Preview state
    previewMediaId: preview.previewMediaId,
    handleOpenPreview: preview.handleOpenPreview,
    handleClosePreview: preview.handleClosePreview,
    handleNavigatePreview: preview.handleNavigatePreview,
    
    // Media operations
    handleDeleteSelected: onDeleteSelected,
    handleDownloadSelected: handleDownloadSelectedAsync,
    
    // Media data
    mediaIds,
    position,
    mediaInfoMap,
    updateMediaInfo,
    
    // UI state
    columnsCount,
    viewMode,
  };
  
  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};
