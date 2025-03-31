
import { useGalleryContext } from '@/context/GalleryContext';
import { useState } from 'react';
import { GalleryViewMode } from '@/types/gallery';

// This function provides a fallback implementation when used outside of GalleryProvider
export function useUIState() {
  try {
    // Try to use the GalleryContext
    return useGalleryContext();
  } catch (error) {
    // Fallback implementation if GalleryContext is not available
    const [viewMode, setViewMode] = useState<GalleryViewMode>('both');
    const [leftPanelOpen, setLeftPanelOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [serverPanelOpen, setServerPanelOpen] = useState(false);
    const [leftFilter, setLeftFilter] = useState('all');
    const [rightFilter, setRightFilter] = useState('all');
    
    const toggleLeftPanel = () => setLeftPanelOpen(prev => !prev);
    const toggleRightPanel = () => setRightPanelOpen(prev => !prev);
    const closeBothSidebars = () => {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    };

    const toggleFullView = (side: 'left' | 'right') => {
      setViewMode(currentMode => {
        if (side === 'left') {
          return currentMode === 'left' ? 'both' : 'left';
        } else {
          return currentMode === 'right' ? 'both' : 'right';
        }
      });
    };
    
    // Return a compatible interface
    return {
      viewMode,
      setViewMode,
      leftPanelOpen,
      rightPanelOpen,
      serverPanelOpen,
      toggleLeftPanel,
      toggleRightPanel,
      closeBothSidebars,
      setServerPanelOpen,
      leftFilter,
      setLeftFilter,
      rightFilter,
      setRightFilter,
      toggleFullView,
    };
  }
}
