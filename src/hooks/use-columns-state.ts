
import { useLocalStorage } from '@/hooks/use-local-storage';
import { GalleryViewMode, ViewModeType } from '@/types/gallery';

// Types standard pour les différents modes d'affichage
const VIEW_MODES = {
  DESKTOP_SPLIT: 'desktop',
  DESKTOP_FULL: 'desktop-single',
  MOBILE_SPLIT: 'mobile-split',
  MOBILE_FULL: 'mobile-single'
} as const;

// Valeurs par défaut pour chaque mode d'affichage
const DEFAULT_COLUMNS = {
  [VIEW_MODES.DESKTOP_SPLIT]: { left: 5, right: 5 },
  [VIEW_MODES.DESKTOP_FULL]: { left: 6, right: 6 },
  [VIEW_MODES.MOBILE_SPLIT]: { left: 2, right: 2 },
  [VIEW_MODES.MOBILE_FULL]: { left: 4, right: 4 }
};

export function useColumnsState() {
  // Column counts for different modes, stored in local storage
  const [desktopColumnsLeft, setDesktopColumnsLeft] = useLocalStorage('desktop-split-columns-left', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].left);
  const [desktopColumnsRight, setDesktopColumnsRight] = useLocalStorage('desktop-split-columns-right', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].right);
  const [desktopSingleColumnsLeft, setDesktopSingleColumnsLeft] = useLocalStorage('desktop-single-columns-left', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_FULL].left);
  const [desktopSingleColumnsRight, setDesktopSingleColumnsRight] = useLocalStorage('desktop-single-columns-right', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_FULL].right);
  const [mobileSplitColumnsLeft, setMobileSplitColumnsLeft] = useLocalStorage('mobile-split-columns-left', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_SPLIT].left);
  const [mobileSplitColumnsRight, setMobileSplitColumnsRight] = useLocalStorage('mobile-split-columns-right', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_SPLIT].right);
  const [mobileSingleColumnsLeft, setMobileSingleColumnsLeft] = useLocalStorage('mobile-single-columns-left', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_FULL].left);
  const [mobileSingleColumnsRight, setMobileSingleColumnsRight] = useLocalStorage('mobile-single-columns-right', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_FULL].right);
  
  // Fonction utilitaire pour obtenir le type de vue en fonction de l'appareil et du mode
  const getViewModeType = (isMobile: boolean, viewMode: GalleryViewMode): string => {
    if (isMobile) {
      return viewMode === 'both' ? VIEW_MODES.MOBILE_SPLIT : VIEW_MODES.MOBILE_FULL;
    } else {
      return viewMode === 'both' ? VIEW_MODES.DESKTOP_SPLIT : VIEW_MODES.DESKTOP_FULL;
    }
  };
  
  // Fonction pour obtenir le nombre de colonnes actuel pour un côté
  const getColumnsForSide = (side: 'left' | 'right', isMobile: boolean, viewMode: GalleryViewMode): number => {
    const viewModeType = getViewModeType(isMobile, viewMode);
    
    if (side === 'left') {
      switch (viewModeType) {
        case VIEW_MODES.DESKTOP_SPLIT: return desktopColumnsLeft;
        case VIEW_MODES.DESKTOP_FULL: return desktopSingleColumnsLeft;
        case VIEW_MODES.MOBILE_SPLIT: return mobileSplitColumnsLeft;
        case VIEW_MODES.MOBILE_FULL: return mobileSingleColumnsLeft;
      }
    } else {
      switch (viewModeType) {
        case VIEW_MODES.DESKTOP_SPLIT: return desktopColumnsRight;
        case VIEW_MODES.DESKTOP_FULL: return desktopSingleColumnsRight;
        case VIEW_MODES.MOBILE_SPLIT: return mobileSplitColumnsRight;
        case VIEW_MODES.MOBILE_FULL: return mobileSingleColumnsRight;
      }
    }
    
    // Valeur par défaut si aucun cas ne correspond
    return DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].left;
  };
  
  // Fonction pour mettre à jour le nombre de colonnes
  const updateColumnsCount = (side: 'left' | 'right', isMobile: boolean, viewMode: GalleryViewMode, count: number) => {
    const viewModeType = getViewModeType(isMobile, viewMode);
    
    if (side === 'left') {
      switch (viewModeType) {
        case VIEW_MODES.DESKTOP_SPLIT: 
          setDesktopColumnsLeft(count);
          break;
        case VIEW_MODES.DESKTOP_FULL: 
          setDesktopSingleColumnsLeft(count);
          break;
        case VIEW_MODES.MOBILE_SPLIT: 
          setMobileSplitColumnsLeft(count);
          break;
        case VIEW_MODES.MOBILE_FULL: 
          setMobileSingleColumnsLeft(count);
          break;
      }
    } else {
      switch (viewModeType) {
        case VIEW_MODES.DESKTOP_SPLIT: 
          setDesktopColumnsRight(count);
          break;
        case VIEW_MODES.DESKTOP_FULL: 
          setDesktopSingleColumnsRight(count);
          break;
        case VIEW_MODES.MOBILE_SPLIT: 
          setMobileSplitColumnsRight(count);
          break;
        case VIEW_MODES.MOBILE_FULL: 
          setMobileSingleColumnsRight(count);
          break;
      }
    }
  };

  // Récupérer toutes les valeurs de colonnes pour un côté spécifique
  const getColumnValuesForSide = (side: 'left' | 'right') => {
    if (side === 'left') {
      return {
        [VIEW_MODES.DESKTOP_SPLIT]: desktopColumnsLeft,
        [VIEW_MODES.DESKTOP_FULL]: desktopSingleColumnsLeft,
        [VIEW_MODES.MOBILE_SPLIT]: mobileSplitColumnsLeft,
        [VIEW_MODES.MOBILE_FULL]: mobileSingleColumnsLeft
      };
    } else {
      return {
        [VIEW_MODES.DESKTOP_SPLIT]: desktopColumnsRight,
        [VIEW_MODES.DESKTOP_FULL]: desktopSingleColumnsRight,
        [VIEW_MODES.MOBILE_SPLIT]: mobileSplitColumnsRight,
        [VIEW_MODES.MOBILE_FULL]: mobileSingleColumnsRight
      };
    }
  };
  
  return {
    // Méthodes principales pour obtenir et mettre à jour le nombre de colonnes
    getViewModeType,
    getColumnsForSide,
    updateColumnsCount,
    getColumnValuesForSide,
    
    // Constants exportées pour utilisation externe
    VIEW_MODES
  };
}
