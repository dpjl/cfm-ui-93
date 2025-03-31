
import { useState, useCallback } from 'react';
import { GalleryViewMode } from '@/types/gallery';

/**
 * Hook de base pour gérer l'état des panneaux et modes d'affichage
 */
export function useUIPanelState(initialViewMode: GalleryViewMode = 'both') {
  // États des panneaux
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(false);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [serverPanelOpen, setServerPanelOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
  // État du mode d'affichage
  const [viewMode, setViewMode] = useState<GalleryViewMode>(initialViewMode);
  
  // Handlers pour les panneaux
  const toggleLeftPanel = useCallback(() => {
    setLeftPanelOpen(prev => !prev);
  }, []);
  
  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen(prev => !prev);
  }, []);
  
  const toggleServerPanel = useCallback(() => {
    setServerPanelOpen(prev => !prev);
  }, []);
  
  const closeBothSidebars = useCallback(() => {
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  }, []);
  
  // Toggle entre vue complète et vue partagée
  const toggleFullView = useCallback((side: 'left' | 'right') => {
    setViewMode(currentMode => {
      if (side === 'left') {
        return currentMode === 'left' ? 'both' : 'left';
      } else {
        return currentMode === 'right' ? 'both' : 'right';
      }
    });
  }, []);
  
  return {
    // États des panneaux
    leftPanelOpen,
    rightPanelOpen,
    serverPanelOpen,
    deleteDialogOpen,
    
    // Setters
    setLeftPanelOpen,
    setRightPanelOpen,
    setServerPanelOpen,
    setDeleteDialogOpen,
    
    // État du mode d'affichage
    viewMode,
    setViewMode,
    
    // Handlers
    toggleLeftPanel,
    toggleRightPanel,
    toggleServerPanel,
    closeBothSidebars,
    toggleFullView
  };
}
