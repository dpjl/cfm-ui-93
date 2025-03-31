
import { useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MobileViewMode, ViewModeType } from '@/types/gallery';

interface GalleryLayoutOptions {
  viewMode: MobileViewMode;
  isMobile: boolean;
}

export function useGalleryLayout(viewMode: MobileViewMode) {
  const isMobile = useIsMobile();
  
  // Déterminer si une galerie est visible en fonction du mode d'affichage
  const isGalleryVisible = useCallback((position: 'left' | 'right') => {
    if (position === 'left') {
      return viewMode === 'both' || viewMode === 'left';
    } else {
      return viewMode === 'both' || viewMode === 'right';
    }
  }, [viewMode]);
  
  // Obtenir les classes CSS pour une galerie en fonction de sa position et du mode d'affichage
  const getGalleryClasses = useCallback((position: 'left' | 'right') => {
    const baseClasses = "transition-all duration-300 h-full overflow-hidden";
    
    // Classes pour la visibilité et la largeur
    if (position === 'left') {
      if (viewMode === 'both') return `${baseClasses} w-1/2`;
      if (viewMode === 'left') return `${baseClasses} w-full`;
      return `${baseClasses} w-0 invisible`;
    } else { // position === 'right'
      if (viewMode === 'both') return `${baseClasses} w-1/2`;
      if (viewMode === 'right') return `${baseClasses} w-full`;
      return `${baseClasses} w-0 invisible`;
    }
  }, [viewMode]);
  
  // Déterminer le type de vue pour les calculs de colonnes
  const viewModeType: ViewModeType = useMemo(() => {
    if (isMobile) {
      return viewMode === 'both' ? 'mobile-split' : 'mobile-single';
    } else {
      return viewMode === 'both' ? 'desktop' : 'desktop-single';
    }
  }, [isMobile, viewMode]);
  
  // Classes pour le conteneur principal des galeries
  const containerClasses = useMemo(() => {
    return "flex-1 overflow-hidden bg-background/50 backdrop-blur-sm rounded-lg border-2 border-border/40 shadow-sm relative";
  }, []);
  
  return {
    isMobile,
    isGalleryVisible,
    getGalleryClasses,
    viewModeType,
    containerClasses
  };
}
