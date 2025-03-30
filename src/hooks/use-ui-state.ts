
import { useState } from 'react';
import { useGalleryLayout } from '@/hooks/use-gallery-layout';
import { MediaFilter } from '@/components/AppSidebar';

export function useUIState() {
  // UI state basique
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [leftFilter, setLeftFilter] = useState<MediaFilter>('all');
  const [rightFilter, setRightFilter] = useState<MediaFilter>('all');
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  
  // Utiliser notre hook custom pour gérer l'agencement des galeries
  const galleryLayout = useGalleryLayout();
  
  // UI action handlers
  const toggleLeftPanel = () => {
    setLeftPanelOpen(prev => !prev);
  };
  
  const toggleRightPanel = () => {
    setRightPanelOpen(prev => !prev);
  };
  
  const closeBothSidebars = () => {
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
  };
  
  return {
    // État de base de l'UI
    deleteDialogOpen,
    setDeleteDialogOpen,
    leftPanelOpen,
    rightPanelOpen,
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    serverPanelOpen,
    setServerPanelOpen,
    
    // Actions de l'UI
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    
    // État de l'agencement des galeries (via notre hook custom)
    ...galleryLayout
  };
}
