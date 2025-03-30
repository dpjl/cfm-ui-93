
import { useState } from 'react';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';

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
    closeBothSidebars
  };
}
