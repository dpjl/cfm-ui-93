
import { useGalleryContext } from '@/contexts/GalleryContext';

/**
 * Hook pour accéder à l'état de l'interface utilisateur
 */
export function useUIState() {
  // Obtenir les valeurs directement du contexte
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    leftPanelOpen,
    rightPanelOpen,
    viewMode,
    setViewMode,
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    serverPanelOpen,
    setServerPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    toggleFullView,
    isMobile
  } = useGalleryContext();

  return {
    // États UI
    deleteDialogOpen,
    setDeleteDialogOpen,
    leftPanelOpen,
    rightPanelOpen,
    viewMode,
    setViewMode,
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    serverPanelOpen,
    setServerPanelOpen,
    
    // Méthodes UI
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    toggleFullView,
    
    // Utilitaires
    isMobile
  };
}
