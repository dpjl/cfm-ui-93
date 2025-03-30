
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MobileViewMode } from '@/types/gallery';

export function useColumnsState() {
  // Column counts for different modes, stored in local storage
  const [desktopColumnsLeft, setDesktopColumnsLeft] = useLocalStorage('desktop-split-columns-left', 5);
  const [desktopColumnsRight, setDesktopColumnsRight] = useLocalStorage('desktop-split-columns-right', 5);
  const [desktopSingleColumnsLeft, setDesktopSingleColumnsLeft] = useLocalStorage('desktop-single-columns-left', 6);
  const [desktopSingleColumnsRight, setDesktopSingleColumnsRight] = useLocalStorage('desktop-single-columns-right', 6);
  const [mobileSplitColumnsLeft, setMobileSplitColumnsLeft] = useLocalStorage('mobile-split-columns-left', 2);
  const [mobileSplitColumnsRight, setMobileSplitColumnsRight] = useLocalStorage('mobile-split-columns-right', 2);
  const [mobileSingleColumnsLeft, setMobileSingleColumnsLeft] = useLocalStorage('mobile-single-columns-left', 4);
  const [mobileSingleColumnsRight, setMobileSingleColumnsRight] = useLocalStorage('mobile-single-columns-right', 4);
  
  // Column management functions
  const getCurrentColumnsLeft = (isMobile: boolean, viewMode: MobileViewMode): number => {
    if (isMobile) {
      return viewMode === 'both' ? mobileSplitColumnsLeft : mobileSingleColumnsLeft;
    }
    return viewMode === 'both' ? desktopColumnsLeft : desktopSingleColumnsLeft;
  };
  
  const getCurrentColumnsRight = (isMobile: boolean, viewMode: MobileViewMode): number => {
    if (isMobile) {
      return viewMode === 'both' ? mobileSplitColumnsRight : mobileSingleColumnsRight;
    }
    return viewMode === 'both' ? desktopColumnsRight : desktopSingleColumnsRight;
  };
  
  // Gestionnaire amélioré pour obtenir le nombre actuel de colonnes en fonction de la position et du mode d'affichage
  const getColumnsForSide = (side: 'left' | 'right', isMobile: boolean, viewMode: MobileViewMode): number => {
    if (side === 'left') {
      return getCurrentColumnsLeft(isMobile, viewMode);
    } else {
      return getCurrentColumnsRight(isMobile, viewMode);
    }
  };
  
  // Fonction pour obtenir directement le setter approprié en fonction du mode et de la position
  const getColumnsSetter = (side: 'left' | 'right', isMobile: boolean, viewMode: MobileViewMode) => {
    if (side === 'left') {
      if (isMobile) {
        return viewMode === 'both' ? setMobileSplitColumnsLeft : setMobileSingleColumnsLeft;
      } else {
        return viewMode === 'both' ? setDesktopColumnsLeft : setDesktopSingleColumnsLeft;
      }
    } else {
      if (isMobile) {
        return viewMode === 'both' ? setMobileSplitColumnsRight : setMobileSingleColumnsRight;
      } else {
        return viewMode === 'both' ? setDesktopColumnsRight : setDesktopSingleColumnsRight;
      }
    }
  };
  
  const handleLeftColumnsChange = (isMobile: boolean, viewMode: MobileViewMode, count: number) => {
    if (isMobile) {
      if (viewMode === 'both') {
        setMobileSplitColumnsLeft(count);
      } else {
        setMobileSingleColumnsLeft(count);
      }
    } else {
      if (viewMode === 'both') {
        setDesktopColumnsLeft(count);
      } else {
        setDesktopSingleColumnsLeft(count);
      }
    }
  };
  
  const handleRightColumnsChange = (isMobile: boolean, viewMode: MobileViewMode, count: number) => {
    if (isMobile) {
      if (viewMode === 'both') {
        setMobileSplitColumnsRight(count);
      } else {
        setMobileSingleColumnsRight(count);
      }
    } else {
      if (viewMode === 'both') {
        setDesktopColumnsRight(count);
      } else {
        setDesktopSingleColumnsRight(count);
      }
    }
  };
  
  // Nouvelle fonction unifiée pour mettre à jour le nombre de colonnes
  const updateColumnsCount = (side: 'left' | 'right', isMobile: boolean, viewMode: MobileViewMode, count: number) => {
    const setter = getColumnsSetter(side, isMobile, viewMode);
    setter(count);
    
    console.log(`Updated columns for ${side} in ${isMobile ? 'mobile' : 'desktop'} ${viewMode} mode to ${count}`);
  };
  
  // Map view mode to column configuration type
  const getViewModeType = (position: 'left' | 'right', currentViewMode: MobileViewMode, isMobile: boolean): string => {
    if (isMobile) {
      return currentViewMode === 'both' ? 'mobile-split' : 'mobile-single';
    } else {
      return currentViewMode === 'both' ? 'desktop' : 'desktop-single';
    }
  };
  
  return {
    getCurrentColumnsLeft,
    getCurrentColumnsRight,
    handleLeftColumnsChange,
    handleRightColumnsChange,
    getViewModeType,
    // Nouvelles fonctions pour une gestion unifiée
    getColumnsForSide,
    updateColumnsCount
  };
}
