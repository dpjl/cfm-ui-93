
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useDirectoryState } from '@/hooks/use-directory-state';
import { useColumnsState } from '@/hooks/use-columns-state';
import { useUIState } from '@/hooks/use-ui-state';
import { useGalleryActions } from '@/hooks/use-gallery-actions';

export function useGalleryState() {
  const isMobile = useIsMobile();
  
  // Utiliser tous les hooks spécialisés
  const directoryState = useDirectoryState();
  const columnsState = useColumnsState();
  const uiState = useUIState();
  
  // Intégrons directement la logique de sélection ici
  const [selectedIdsLeft, setSelectedIdsLeft] = useState<string[]>([]);
  const [selectedIdsRight, setSelectedIdsRight] = useState<string[]>([]);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  
  // Gallery actions need access to selection state and UI state
  const galleryActions = useGalleryActions(
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    uiState.setDeleteDialogOpen,
    setSelectedIdsLeft,
    setSelectedIdsRight,
    setActiveSide
  );
  
  // Méthodes simplifiées pour obtenir le nombre de colonnes actuel
  const getCurrentColumnsLeft = (): number => {
    return columnsState.getColumnsForSide('left', isMobile, uiState.viewMode);
  };
  
  const getCurrentColumnsRight = (): number => {
    return columnsState.getColumnsForSide('right', isMobile, uiState.viewMode);
  };
  
  // Méthode unifiée pour mettre à jour le nombre de colonnes
  const updateColumnCount = (side: 'left' | 'right', count: number) => {
    columnsState.updateColumnsCount(side, isMobile, uiState.viewMode, count);
  };
  
  return {
    // Directory state
    ...directoryState,
    
    // Column management (with simplified interfaces)
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
    ...uiState,
    
    // Actions
    ...galleryActions,
    
    // Utilities
    getViewModeType: (side: 'left' | 'right') => columnsState.getViewModeType(isMobile, uiState.viewMode)
  };
}
