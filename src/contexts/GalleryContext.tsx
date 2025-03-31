
import React, { createContext, useContext } from 'react';
import { GalleryViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useDirectoryState } from '@/hooks/core/use-directory-state';
import { useColumnsLayout } from '@/hooks/core/use-columns-layout';
import { useSelectionState } from '@/hooks/core/use-selection-state';
import { useUIPanelState } from '@/hooks/core/use-ui-panel-state';
import { useFilterState } from '@/hooks/core/use-filter-state';
import { useMediaOperations } from '@/hooks/core/use-media-operations';
import { useMutation } from '@tanstack/react-query';

// Interface du contexte
interface GalleryContextType {
  // Directory state
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  setSelectedDirectoryIdLeft: (id: string) => void;
  setSelectedDirectoryIdRight: (id: string) => void;
  
  // Column management
  getCurrentColumnsLeft: () => number;
  getCurrentColumnsRight: () => number;
  updateColumnCount: (side: 'left' | 'right', count: number) => void;
  getColumnValuesForViewMode?: (side: 'left' | 'right') => { [key: string]: number };
  
  // Selection state
  selectedIdsLeft: string[];
  selectedIdsRight: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  activeSide: 'left' | 'right';
  setActiveSide: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  
  // UI state
  viewMode: GalleryViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  closeBothSidebars: () => void;
  toggleFullView: (side: 'left' | 'right') => void;
  
  // Filters
  leftFilter: MediaFilter;
  rightFilter: MediaFilter;
  setLeftFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  setRightFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  
  // Dialog state
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  serverPanelOpen: boolean;
  setServerPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Actions
  handleRefresh: () => void;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  handleDelete: () => void;
  deleteMutation: ReturnType<typeof useMutation>;
  
  // Utilities
  isMobile: boolean;
  getViewModeType: (side: 'left' | 'right') => ViewModeType;
}

// Création du contexte
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
}

// Provider component
export const GalleryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const isMobile = useIsMobile();
  
  // Utiliser les hooks de base
  const directoryState = useDirectoryState();
  const selectionState = useSelectionState();
  const uiState = useUIPanelState();
  const filterState = useFilterState();
  const columnsLayout = useColumnsLayout();
  
  // Extraire les états des hooks
  const { selectedIdsLeft, selectedIdsRight, activeSide, setActiveSide, setSelectedIdsLeft, setSelectedIdsRight } = selectionState;
  const { viewMode, setViewMode, leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel, closeBothSidebars, toggleFullView, deleteDialogOpen, setDeleteDialogOpen, serverPanelOpen, setServerPanelOpen } = uiState;
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
  const getViewModeType = (side: 'left' | 'right'): ViewModeType => {
    return columnsLayout.getViewModeType(viewMode) as ViewModeType;
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
    
    // UI state
    viewMode,
    setViewMode,
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    toggleFullView,
    
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
