
import { useState, useCallback, useRef, useEffect } from 'react';

export type SelectionMode = 'single' | 'multiple';

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  initialSelectionMode?: SelectionMode;
}

export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId,
  initialSelectionMode = 'multiple'
}: UseGallerySelectionProps) {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  const processingRef = useRef(false);
  const batchUpdateTimeoutRef = useRef<number | null>(null);
  const pendingSelectionChangesRef = useRef<Set<string>>(new Set());
  
  // Fonction d'aide pour vider les mises à jour en attente
  const flushPendingUpdates = useCallback(() => {
    if (pendingSelectionChangesRef.current.size > 0) {
      const changes = Array.from(pendingSelectionChangesRef.current);
      pendingSelectionChangesRef.current.clear();
      
      changes.forEach(id => onSelectId(id));
    }
    
    if (batchUpdateTimeoutRef.current) {
      window.clearTimeout(batchUpdateTimeoutRef.current);
      batchUpdateTimeoutRef.current = null;
    }
    
    processingRef.current = false;
  }, [onSelectId]);
  
  // Optimisation avec batch d'updates pour éviter les rendus en cascade
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    // Eviter les sélections multiples rapides
    if (processingRef.current) {
      pendingSelectionChangesRef.current.add(id);
      return;
    }
    
    processingRef.current = true;
    
    // Mode single - sélection simple
    if (selectionMode === 'single' && !extendSelection) {
      // Si déjà sélectionné, désélectionner uniquement
      if (selectedIds.includes(id)) {
        onSelectId(id);
        setLastSelectedId(null);
      } 
      // Sinon remplacer la sélection existante
      else {
        // D'abord sélectionner le nouvel élément
        if (!selectedIds.includes(id)) {
          onSelectId(id);
        }
        
        // Puis désélectionner les autres sans créer de clignotement
        const otherSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
        
        if (otherSelectedIds.length > 0) {
          // Utilisation de RAF pour optimiser les performances visuelles
          requestAnimationFrame(() => {
            otherSelectedIds.forEach(selectedId => {
              onSelectId(selectedId);
            });
          });
        }
        
        setLastSelectedId(id);
      }
    }
    // Mode multiple ou sélection étendue
    else {
      // Sélection Shift pour plage
      if (extendSelection && lastSelectedId) {
        const lastIndex = mediaIds.indexOf(lastSelectedId);
        const currentIndex = mediaIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Batch update pour éviter les clignotements
          const idsToUpdate = [];
          for (let i = start; i <= end; i++) {
            const mediaId = mediaIds[i];
            if (!selectedIds.includes(mediaId)) {
              idsToUpdate.push(mediaId);
            }
          }
          
          // Utiliser RAF pour les mises à jour visuelles optimisées
          if (idsToUpdate.length > 0) {
            requestAnimationFrame(() => {
              idsToUpdate.forEach(mediaId => onSelectId(mediaId));
            });
          }
        }
      } 
      // Basculer un seul élément
      else {
        onSelectId(id);
      }
      
      setLastSelectedId(id);
    }
    
    // Différer la libération du flag pour éviter les sélections multiples
    batchUpdateTimeoutRef.current = window.setTimeout(() => {
      flushPendingUpdates();
    }, 50);
  }, [mediaIds, selectedIds, onSelectId, selectionMode, lastSelectedId, flushPendingUpdates]);
  
  // Nettoyage des timeouts au démontage
  useEffect(() => {
    return () => {
      if (batchUpdateTimeoutRef.current) {
        window.clearTimeout(batchUpdateTimeoutRef.current);
      }
    };
  }, []);
  
  // Sélection complète optimisée
  const handleSelectAll = useCallback(() => {
    // Batch tous les IDs à sélectionner pour un seul rendu
    const idsToSelect = mediaIds.filter(id => !selectedIds.includes(id));
    
    if (idsToSelect.length > 0) {
      // Utiliser RAF pour optimiser les performances visuelles
      requestAnimationFrame(() => {
        idsToSelect.forEach(id => onSelectId(id));
      });
    }
  }, [mediaIds, selectedIds, onSelectId]);
  
  // Désélection optimisée
  const handleDeselectAll = useCallback(() => {
    if (selectedIds.length > 0) {
      // Utiliser RAF pour optimiser les performances visuelles
      requestAnimationFrame(() => {
        selectedIds.forEach(id => onSelectId(id));
      });
    }
  }, [selectedIds, onSelectId]);
  
  // Changement de mode optimisé
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => prev === 'single' ? 'multiple' : 'single');
    
    // Simplifier la sélection lors du changement de mode
    if (selectionMode === 'multiple' && selectedIds.length > 1) {
      // Utiliser RAF pour éviter les clignotements
      requestAnimationFrame(() => {
        if (lastSelectedId && selectedIds.includes(lastSelectedId)) {
          selectedIds.forEach(id => {
            if (id !== lastSelectedId) {
              onSelectId(id);
            }
          });
        } 
        else if (selectedIds.length > 0) {
          const keepId = selectedIds[0];
          selectedIds.slice(1).forEach(id => onSelectId(id));
        }
      });
    }
  }, [selectionMode, selectedIds, lastSelectedId, onSelectId]);
  
  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode
  };
}
