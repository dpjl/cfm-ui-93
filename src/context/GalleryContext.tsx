
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GalleryViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';

// Types d'état et de fonctions que le contexte va fournir
interface GalleryContextType {
  // État du mode de vue
  viewMode: GalleryViewMode;
  setViewMode: (mode: GalleryViewMode) => void;
  
  // État des panneaux latéraux
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  serverPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  closeBothSidebars: () => void;
  setServerPanelOpen: (open: boolean) => void;
  
  // État des filtres
  leftFilter: MediaFilter;
  rightFilter: MediaFilter;
  setLeftFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  setRightFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  
  // Helper method for toggle full view
  toggleFullView: (side: 'left' | 'right') => void;
}

// Création du contexte avec des valeurs par défaut
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Hook personnalisé pour accéder au contexte
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  
  return context;
}

// Provider qui gère l'état partagé
interface GalleryProviderProps {
  children: ReactNode;
}

export function GalleryProvider({ children }: GalleryProviderProps) {
  // UI state from useUIState
  const [viewMode, setViewMode] = useState<GalleryViewMode>('both');
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  const [leftFilter, setLeftFilter] = useState<MediaFilter>('all');
  const [rightFilter, setRightFilter] = useState<MediaFilter>('all');
  
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
  
  // Méthode pour contrôler le mode d'affichage des galeries
  const toggleFullView = (side: 'left' | 'right') => {
    setViewMode(currentMode => {
      if (side === 'left') {
        return currentMode === 'left' ? 'both' : 'left';
      } else {
        return currentMode === 'right' ? 'both' : 'right';
      }
    });
  };
  
  // Valeur du contexte
  const value = {
    // UI state
    viewMode,
    setViewMode,
    leftPanelOpen,
    rightPanelOpen,
    serverPanelOpen,
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter,
    // UI actions
    toggleLeftPanel,
    toggleRightPanel,
    closeBothSidebars,
    setServerPanelOpen,
    toggleFullView,
  };
  
  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
}
