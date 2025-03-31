
import { useState, useCallback, useRef } from 'react';

export type SelectionMode = 'single' | 'multiple';

interface UseSelectionStateProps {
  initialSelectionMode?: SelectionMode;
}

/**
 * Hook de base pour gérer l'état de la sélection des médias
 */
export function useSelectionState({ initialSelectionMode = 'single' }: UseSelectionStateProps = {}) {
  const [selectedIdsLeft, setSelectedIdsLeft] = useState<string[]>([]);
  const [selectedIdsRight, setSelectedIdsRight] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // Refs pour contrôler le comportement de la sélection
  const processingBatchRef = useRef(false);
  const preventResetRef = useRef<boolean>(true);
  
  // Toggle entre les modes de sélection (unique vs multiple)
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // Si on passe de multiple à single avec plusieurs éléments sélectionnés,
      // on ne garde que le dernier élément sélectionné
      if (prev === 'multiple') {
        const activeIds = activeSide === 'left' ? selectedIdsLeft : selectedIdsRight;
        const setActiveIds = activeSide === 'left' ? setSelectedIdsLeft : setSelectedIdsRight;
        
        if (activeIds.length > 1) {
          const lastId = lastSelectedId || activeIds[activeIds.length - 1];
          if (lastId) {
            setActiveIds([lastId]);
          }
        }
      }
      
      return newMode;
    });
  }, [selectedIdsLeft, selectedIdsRight, activeSide, lastSelectedId]);
  
  // Fonction utilitaire pour modifier la sélection
  const handleSelectId = useCallback((id: string, side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const selectedIds = isLeft ? selectedIdsLeft : selectedIdsRight;
    const setSelectedIds = isLeft ? setSelectedIdsLeft : setSelectedIdsRight;
    
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
    
    // Mettre à jour le côté actif lorsqu'on sélectionne
    setActiveSide(side);
    setLastSelectedId(id);
  }, [selectedIdsLeft, selectedIdsRight]);
  
  return {
    // État de la sélection
    selectedIdsLeft,
    setSelectedIdsLeft,
    selectedIdsRight,
    setSelectedIdsRight,
    activeSide,
    setActiveSide,
    lastSelectedId,
    selectionMode,
    toggleSelectionMode,
    
    // Utilitaires pour contrôler la sélection
    handleSelectId,
    processingBatchRef,
    preventResetRef
  };
}
