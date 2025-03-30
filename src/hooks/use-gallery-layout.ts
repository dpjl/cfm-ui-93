
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MobileViewMode } from '@/types/gallery';

export function useGalleryLayout() {
  const [viewMode, setViewMode] = useState<MobileViewMode>('both');
  const isMobile = useIsMobile();
  
  // Détermine si nous devons utiliser le mode vue simple ou éclatée
  const getViewModeType = () => {
    return viewMode === 'both' ? 'split' : 'single';
  };
  
  // Gère le basculement entre les vues pour une galerie spécifique
  const toggleFullView = (side: 'left' | 'right') => {
    setViewMode(current => {
      // Si nous sommes déjà en mode plein écran pour ce côté, revenons au mode partagé
      if ((side === 'left' && current === 'left') || 
          (side === 'right' && current === 'right')) {
        return 'both';
      }
      // Sinon, passons au mode plein écran pour ce côté
      return side === 'left' ? 'left' : 'right';
    });
  };
  
  return {
    viewMode,
    setViewMode,
    isMobile,
    getViewModeType,
    toggleFullView,
    
    // Détermine le type de visualisation pour chaque galerie
    getViewType: (): 'single' | 'split' => {
      return viewMode === 'both' ? 'split' : 'single';
    }
  };
}
