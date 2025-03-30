
import { useState, useCallback } from 'react';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { toast } from 'sonner';

export function useUIState() {
  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<MobileViewMode>('both');
  const [leftFilter, setLeftFilter] = useState<MediaFilter>('all');
  const [rightFilter, setRightFilter] = useState<MediaFilter>('all');
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  
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
  
  // Gestion améliorée du changement de vue mobile
  const toggleMaximize = useCallback((position: 'source' | 'destination') => {
    setViewMode(current => {
      if (position === 'source') {
        // Si on est sur la source (gauche)
        if (current === 'left') {
          // Si déjà maximisé, retourner à 'both'
          return 'both';
        } else {
          // Sinon maximiser la source
          return 'left';
        }
      } else {
        // Si on est sur la destination (droite)
        if (current === 'right') {
          // Si déjà maximisé, retourner à 'both'
          return 'both';
        } else {
          // Sinon maximiser la destination
          return 'right';
        }
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
    toggleMaximize,
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    serverPanelOpen,
    setServerPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars
  };
}
