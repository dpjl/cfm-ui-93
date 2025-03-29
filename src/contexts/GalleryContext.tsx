
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { MediaItem, SelectionMode } from '@/types/gallery';
import { DetailedMediaInfo } from '@/api/imageApi';
import { MediaFilter } from '@/components/AppSidebar';

// Types pour le contexte
interface GalleryContextType {
  // État de base de la galerie
  mediaIds: string[];
  selectedIds: string[];
  columnsCount: number;
  position: 'source' | 'destination';
  
  // Flags d'état
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  
  // État de sélection
  selectionMode: SelectionMode;
  lastSelectedId: string | null;
  
  // Métadonnées
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  filter: MediaFilter;
  showDates: boolean;
  
  // Actions
  toggleSelectionMode: () => void;
  selectItem: (id: string, extendSelection: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  updateMediaInfo: (id: string, info: DetailedMediaInfo | null) => void;
  deleteSelected: () => void;
  toggleSidebar: () => void;
}

// Valeurs par défaut du contexte
const defaultContextValue: GalleryContextType = {
  mediaIds: [],
  selectedIds: [],
  columnsCount: 4,
  position: 'source',
  
  isLoading: false,
  isError: false,
  error: null,
  
  selectionMode: 'single',
  lastSelectedId: null,
  
  mediaInfoMap: new Map(),
  filter: 'all',
  showDates: false,
  
  toggleSelectionMode: () => {},
  selectItem: () => {},
  selectAll: () => {},
  deselectAll: () => {},
  updateMediaInfo: () => {},
  deleteSelected: () => {},
  toggleSidebar: () => {}
};

// Création du contexte
const GalleryContext = createContext<GalleryContextType>(defaultContextValue);

// Hook custom pour utiliser le contexte
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

// Props pour le provider
interface GalleryProviderProps {
  children: ReactNode;
  mediaIds: string[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  columnsCount: number;
  position: 'source' | 'destination';
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  filter?: MediaFilter;
  showDates?: boolean;
  onDeleteSelected: () => void;
  onToggleSidebar?: () => void;
  initialSelectionMode?: SelectionMode;
}

// Provider du contexte
export const GalleryProvider: React.FC<GalleryProviderProps> = ({
  children,
  mediaIds,
  selectedIds,
  setSelectedIds,
  columnsCount,
  position,
  isLoading = false,
  isError = false,
  error = null,
  filter = 'all',
  showDates = false,
  onDeleteSelected,
  onToggleSidebar,
  initialSelectionMode = 'single'
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [mediaInfoMap, setMediaInfoMap] = useState<Map<string, DetailedMediaInfo | null>>(new Map());
  
  // Basculer entre les modes de sélection
  const toggleSelectionMode = () => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // En passant du mode multiple à simple avec plusieurs sélections,
      // ne gardez que le dernier élément sélectionné
      if (prev === 'multiple' && selectedIds.length > 1) {
        const lastId = lastSelectedId || selectedIds[selectedIds.length - 1];
        if (lastId) {
          // Déselectionner tous sauf le dernier
          selectedIds.forEach(id => {
            if (id !== lastId && selectedIds.includes(id)) {
              const updatedSelection = selectedIds.filter(i => i !== id);
              setSelectedIds(updatedSelection);
            }
          });
        }
      }
      
      return newMode;
    });
  };
  
  // Sélectionner/désélectionner un élément
  const selectItem = (id: string, extendSelection: boolean) => {
    if (extendSelection && lastSelectedId && selectionMode === 'multiple') {
      // Sélection de plage avec Shift
      const lastIndex = mediaIds.indexOf(lastSelectedId);
      const currentIndex = mediaIds.indexOf(id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const idsToSelect = mediaIds.slice(start, end + 1);
        
        // Créer une nouvelle sélection
        const newSelectedIds = [...selectedIds];
        
        // Ajouter tous les éléments de la plage
        idsToSelect.forEach(mediaId => {
          if (!newSelectedIds.includes(mediaId)) {
            newSelectedIds.push(mediaId);
          }
        });
        
        setSelectedIds(newSelectedIds);
      }
    } else if (selectionMode === 'single') {
      // Mode sélection unique
      if (selectedIds.includes(id)) {
        // Désélectionner si déjà sélectionné
        setSelectedIds([]);
      } else {
        // Sélectionner uniquement cet élément
        setSelectedIds([id]);
      }
    } else {
      // Mode sélection multiple (sans Shift)
      if (selectedIds.includes(id)) {
        // Désélectionner si déjà sélectionné
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        // Ajouter à la sélection
        setSelectedIds([...selectedIds, id]);
      }
    }
    
    // Garder une trace du dernier élément sélectionné
    setLastSelectedId(id);
  };
  
  // Sélectionner tous les éléments
  const selectAll = () => {
    if (mediaIds.length > 100) {
      console.warn("Trop d'éléments à sélectionner (>100)");
      return;
    }
    setSelectedIds([...mediaIds]);
  };
  
  // Désélectionner tous les éléments
  const deselectAll = () => {
    setSelectedIds([]);
  };
  
  // Mettre à jour les infos d'un média
  const updateMediaInfo = (id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  };
  
  // Valeur du contexte
  const value = useMemo(() => ({
    mediaIds,
    selectedIds,
    columnsCount,
    position,
    
    isLoading,
    isError,
    error,
    
    selectionMode,
    lastSelectedId,
    
    mediaInfoMap,
    filter,
    showDates,
    
    toggleSelectionMode,
    selectItem,
    selectAll,
    deselectAll,
    updateMediaInfo,
    deleteSelected: onDeleteSelected,
    toggleSidebar: onToggleSidebar || (() => {})
  }), [
    mediaIds, 
    selectedIds, 
    columnsCount, 
    position, 
    isLoading, 
    isError, 
    error, 
    selectionMode, 
    lastSelectedId, 
    mediaInfoMap, 
    filter, 
    showDates, 
    onDeleteSelected,
    onToggleSidebar
  ]);
  
  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};
