
import { useState, useCallback } from 'react';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-breakpoint';

export function useUIState() {
  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<MobileViewMode>('both');
  const [leftFilter, setLeftFilter] = useState<MediaFilter>('all');
  const [rightFilter, setRightFilter] = useState<MediaFilter>('all');
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  
  const isMobile = useIsMobile();
  
  // UI action handlers
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
  
  // Méthodes pour contrôler le mode d'affichage des galeries
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
  };
}
