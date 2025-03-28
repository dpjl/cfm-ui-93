
import { useState, useCallback, useMemo, useRef } from 'react';

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
  initialSelectionMode = 'single'
}: UseGallerySelectionProps) {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  const processingBatchRef = useRef(false);

  // Gestionnaire de sélection plus optimisé avec useCallback pour maintenir la stabilité de référence
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    // Si nous traitons déjà une sélection par lots, n'en commencez pas une autre
    if (processingBatchRef.current && extendSelection) return;

    // Pour le mode de sélection unique et sans extension forcée
    if (selectionMode === 'single' && !extendSelection) {
      // Si l'élément est déjà sélectionné, désélectionnez-le
      if (selectedIds.includes(id)) {
        onSelectId(id);
      } 
      // Sinon, désélectionnez tous les autres et sélectionnez cet élément
      else {
        // Créer un cache local des ID actuellement sélectionnés pour éviter les mises à jour d'état multiples
        const currentSelected = [...selectedIds];
        // Ne désélectionnez les autres que si nous avons plusieurs éléments sélectionnés
        if (currentSelected.length > 0) {
          processingBatchRef.current = true;
          currentSelected.forEach(selectedId => {
            if (selectedId !== id) {
              onSelectId(selectedId);
            }
          });
          processingBatchRef.current = false;
        }
        // Sélectionner le nouvel élément
        onSelectId(id);
      }
    }
    // Pour le mode de sélection multiple ou si l'extension est forcée
    else {
      // Si Shift est utilisé pour étendre la sélection
      if (extendSelection && lastSelectedId) {
        // Trouver les indices
        const lastIndex = mediaIds.indexOf(lastSelectedId);
        const currentIndex = mediaIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          // Définir la plage de sélection
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Sélectionnez tous les éléments de la plage
          const idsToSelect = mediaIds.slice(start, end + 1);
          
          // Créer un nouvel ensemble de sélection en conservant les éléments déjà sélectionnés
          const newSelection = new Set([...selectedIds]);
          
          // Traiter en tant qu'opération par lots
          processingBatchRef.current = true;
          
          // Ajouter tous les éléments de la plage
          idsToSelect.forEach(mediaId => {
            if (!newSelection.has(mediaId)) {
              newSelection.add(mediaId);
              onSelectId(mediaId); // Informer le parent de chaque élément nouvellement sélectionné
            }
          });
          
          processingBatchRef.current = false;
        }
      } 
      // Basculer la sélection de cet élément en mode multiple
      else {
        onSelectId(id);
      }
    }
    
    // Gardez une trace du dernier élément sélectionné pour la fonctionnalité Shift
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, onSelectId, selectionMode, lastSelectedId]);

  // Gestionnaire de sélection tout optimisé
  const handleSelectAll = useCallback(() => {
    // Vérifier la limite de performance
    if (mediaIds.length > 100) {
      // Nous pourrions alerter l'utilisateur ici
      console.warn("Trop d'éléments à sélectionner (>100)");
      return;
    }
    
    // Créer un ensemble d'ID actuellement sélectionnés pour une recherche plus rapide
    const selectedIdSet = new Set(selectedIds);
    
    // Traiter en tant qu'opération par lots
    processingBatchRef.current = true;
    
    // Sélectionner tous les médias non déjà sélectionnés
    mediaIds.forEach(id => {
      if (!selectedIdSet.has(id)) {
        onSelectId(id);
      }
    });
    
    processingBatchRef.current = false;
  }, [mediaIds, selectedIds, onSelectId]);

  // Gestionnaire désélectionner tout optimisé
  const handleDeselectAll = useCallback(() => {
    // Traiter en tant qu'opération par lots
    processingBatchRef.current = true;
    
    // Désélectionner tous les médias
    selectedIds.forEach(id => onSelectId(id));
    
    processingBatchRef.current = false;
  }, [selectedIds, onSelectId]);

  // Bascule du mode de sélection optimisée
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // Lors du passage de multiple à single, désélectionnez tous les éléments sauf le dernier
      if (prev === 'multiple' && selectedIds.length > 1) {
        const lastIndex = selectedIds.length - 1;
        const keepId = selectedIds[lastIndex];
        
        // Traiter en tant qu'opération par lots
        processingBatchRef.current = true;
        
        selectedIds.forEach((id, index) => {
          if (index !== lastIndex) {
            onSelectId(id);
          }
        });
        
        processingBatchRef.current = false;
        
        // Si aucun élément n'était sélectionné, ne faites rien
        if (selectedIds.length === 0) {
          return newMode;
        }
        // Si le dernier élément sélectionné n'était pas déjà sélectionné, sélectionnez-le
        if (!selectedIds.includes(keepId)) {
          onSelectId(keepId);
        }
      }
      
      return newMode;
    });
  }, [selectedIds, onSelectId]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode
  };
}
