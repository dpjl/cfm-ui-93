
import React from 'react';
import { GalleryContext } from './GalleryContext';
import { GalleryContextType } from './types';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useDirectoryState } from '@/hooks/core/use-directory-state';
import { useColumnsLayout } from '@/hooks/core/use-columns-layout';
import { useSelectionState } from '@/hooks/core/use-selection-state';
import { useUIPanelState } from '@/hooks/core/use-ui-panel-state';
import { useFilterState } from '@/hooks/core/use-filter-state';
import { useMediaOperations } from '@/hooks/core/use-media-operations';

// Provider component
export const GalleryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const isMobile = useIsMobile();
  
  // Utiliser les hooks de base
  const directoryState = useDirectoryState();
  const selectionState = useSelectionState({ initialSelectionMode: 'single' });
  const uiState = useUIPanelState();
  const filterState = useFilterState();
  const columnsLayout = useColumnsLayout();
  
  // Extraire les états des hooks
  const { selectedIdsLeft, selectedIdsRight, activeSide, setActiveSide, setSelectedIdsLeft, setSelectedIdsRight, selectionMode, toggleSelectionMode } = selectionState;
  const { viewMode, setViewMode, leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel, closeBothSidebars, toggleFullView, deleteDialogOpen, setDeleteDialogOpen, serverPanelOpen, setServerPanelOpen, toggleServerPanel } = uiState;
  const { leftFilter, setLeftFilter, rightFilter, setRightFilter } = filterState;
  
  // Media operations
  const mediaOperations = useMediaOperations(
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    setSelectedIdsLeft,
    setSelectedIdsRight,
    setDeleteDialogOpen
  );
  
  // Méthodes pour obtenir le nombre de colonnes
  const getCurrentColumnsLeft = () => columnsLayout.getCurrentColumnsLeft(viewMode);
  const getCurrentColumnsRight = () => columnsLayout.getCurrentColumnsRight(viewMode);
  
  // Méthode pour mettre à jour le nombre de colonnes
  const updateColumnCount = (side: 'left' | 'right', count: number) => {
    columnsLayout.updateColumnCount(side, viewMode, count);
  };
  
  // Fonction pour obtenir le type de mode de vue
  const getViewModeType = (side: 'left' | 'right') => {
    return columnsLayout.getViewModeType(viewMode);
  };
  
  // Valeur du contexte
  const value: GalleryContextType = {
    // Directory state
    ...directoryState,
    
    // Column management
    getCurrentColumnsLeft,
    getCurrentColumnsRight,
    updateColumnCount,
    
    // Selection state
    selectedIdsLeft,
    setSelectedIdsLeft,
    selectedIdsRight,
    setSelectedIdsRight,
    activeSide,
    setActiveSide,
    selectionMode,
    toggleSelectionMode,
    
    // UI state
    viewMode,
    setViewMode,
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    toggleFullView,
    toggleServerPanel,
    
    // Filters
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    
    // Dialog state
    deleteDialogOpen,
    setDeleteDialogOpen,
    serverPanelOpen,
    setServerPanelOpen,
    
    // Actions
    ...mediaOperations,
    
    // Utilities
    isMobile,
    getViewModeType
  };
  
  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};
