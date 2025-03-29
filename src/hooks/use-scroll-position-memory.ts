
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { useCallback } from 'react';

// Définition du type pour stocker les informations de défilement de manière contextuelle
export interface ScrollPositionData {
  scrollTop: number;
  scrollRatio?: number; // Nouvelle propriété: ratio de défilement pour une meilleure adaptabilité
  firstVisibleItemId: string | null;
  firstVisibleRowIndex: number;
  columnsCount: number;
  viewMode: 'single' | 'split';
  timestamp: number;
}

// Type pour le stockage complet des positions de défilement
export interface ScrollPositionsMap {
  [key: string]: ScrollPositionData;
}

/**
 * Hook qui gère la mémorisation des positions de défilement pour les galeries
 * avec persistance dans le localStorage
 */
export function useScrollPositionMemory() {
  // Utiliser localStorage pour persister les positions entre sessions
  const [scrollPositionsMap, setScrollPositionsMap] = useLocalStorage<ScrollPositionsMap>(
    'gallery-scroll-positions',
    {}
  );

  /**
   * Génère une clé unique pour identifier un contexte de défilement spécifique
   * Inclut maintenant le viewMode dans la clé pour une meilleure séparation
   */
  const getScrollKey = useCallback(
    (
      galleryId: 'left' | 'right',
      directoryId: string,
      filter: string = 'all',
      viewMode: 'single' | 'split' = 'single'
    ): string => {
      return `${galleryId}-${directoryId}-${filter}-${viewMode}`;
    },
    []
  );

  /**
   * Sauvegarde la position de défilement pour un contexte spécifique
   */
  const saveScrollPosition = useCallback(
    (
      galleryId: 'left' | 'right',
      directoryId: string,
      filter: string = 'all',
      viewMode: 'single' | 'split',
      scrollData: Omit<ScrollPositionData, 'timestamp'>
    ) => {
      if (!directoryId) return; // Ne pas sauvegarder si pas de répertoire
      
      const key = getScrollKey(galleryId, directoryId, filter, viewMode);
      const newPositionsMap: ScrollPositionsMap = { 
        ...scrollPositionsMap,
        [key]: {
          ...scrollData,
          timestamp: Date.now() // Ajouter un timestamp pour d'éventuelles expirations futures
        }
      };
      setScrollPositionsMap(newPositionsMap);
    },
    [scrollPositionsMap, getScrollKey, setScrollPositionsMap]
  );

  /**
   * Récupère la position de défilement pour un contexte spécifique
   */
  const getScrollPosition = useCallback(
    (
      galleryId: 'left' | 'right',
      directoryId: string,
      filter: string = 'all',
      viewMode: 'single' | 'split' = 'single'
    ): ScrollPositionData | null => {
      if (!directoryId) return null;
      const key = getScrollKey(galleryId, directoryId, filter, viewMode);
      return scrollPositionsMap[key] || null;
    },
    [scrollPositionsMap, getScrollKey]
  );

  /**
   * Nettoie les positions de défilement anciennes (plus de 7 jours)
   */
  const cleanupOldPositions = useCallback(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    const newPositions: ScrollPositionsMap = {};
    
    // Ne garder que les positions récentes
    Object.keys(scrollPositionsMap).forEach(key => {
      const data = scrollPositionsMap[key];
      if (now - data.timestamp < sevenDaysMs) {
        newPositions[key] = data;
      }
    });
    
    setScrollPositionsMap(newPositions);
  }, [scrollPositionsMap, setScrollPositionsMap]);

  // Nettoyer les anciennes positions au chargement
  React.useEffect(() => {
    cleanupOldPositions();
  }, [cleanupOldPositions]);

  return {
    saveScrollPosition,
    getScrollPosition,
    cleanupOldPositions
  };
}
