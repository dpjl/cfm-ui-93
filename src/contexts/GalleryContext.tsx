
import React, { createContext, useContext, useState, useCallback } from 'react';
import { GalleryViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useDirectoryState } from '@/hooks/use-directory-state';
import { useColumnsState } from '@/hooks/use-columns-state';
import { useGalleryActions } from '@/hooks/use-gallery-actions';
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
  
  // Utiliser tous les hooks spécialisés
  const directoryState = useDirectoryState();
  const columnsState = useColumnsState();
  
  // État UI
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<GalleryViewMode>('both');
  const [leftFilter, setLeftFilter] = useState<MediaFilter>('all');
  const [rightFilter, setRightFilter] = useState<MediaFilter>('all');
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  
  // État de sélection
  const [selectedIdsLeft, setSelectedIdsLeft] = useState<string[]>([]);
  const [selectedIdsRight, setSelectedIdsRight] = useState<string[]>([]);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  
  // Handlers UI
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelOpen(prev => !prev);
  }, []);
  
  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen(prev => !prev);
  }, []);
  
  const closeBothSidebars = useCallback(() => {
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  }, []);
  
  // Toggle full view for a side
  const toggleFullView = useCallback((side: 'left' | 'right') => {
    setViewMode(currentMode => {
      if (side === 'left') {
        return currentMode === 'left' ? 'both' : 'left';
      } else {
        return currentMode === 'right' ? 'both' : 'right';
      }
    });
  }, []);
  
  // Actions de galerie
  const galleryActions = useGalleryActions(
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    setDeleteDialogOpen,
    setSelectedIdsLeft,
    setSelectedIdsRight,
    setActiveSide
  );
  
  // Méthodes pour obtenir le nombre de colonnes
  const getCurrentColumnsLeft = useCallback((): number => {
    return columnsState.getColumnsForSide('left', isMobile, viewMode);
  }, [columnsState, isMobile, viewMode]);
  
  const getCurrentColumnsRight = useCallback((): number => {
    return columnsState.getColumnsForSide('right', isMobile, viewMode);
  }, [columnsState, isMobile, viewMode]);
  
  // Méthode pour mettre à jour le nombre de colonnes
  const updateColumnCount = useCallback((side: 'left' | 'right', count: number) => {
    columnsState.updateColumnsCount(side, isMobile, viewMode, count);
  }, [columnsState, isMobile, viewMode]);
  
  // Fonction pour obtenir le type de mode de vue (pour la cohérence du typage)
  const getViewModeType = useCallback((side: 'left' | 'right'): ViewModeType => {
    return columnsState.getViewModeType(isMobile, viewMode) as ViewModeType;
  }, [columnsState, isMobile, viewMode]);
  
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
    ...galleryActions,
    
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
