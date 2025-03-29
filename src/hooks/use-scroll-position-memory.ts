
import { useLocalStorage } from '@/hooks/use-local-storage';
import React from 'react';

// Définition du type pour stocker les informations de défilement de manière contextuelle
export interface ScrollPositionData {
  scrollTop: number;
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
   */
  const getScrollKey = (
    galleryId: 'left' | 'right',
    directoryId: string,
    filter: string = 'all'
  ): string => {
    return `${galleryId}-${directoryId}-${filter}`;
  };

  /**
   * Sauvegarde la position de défilement pour un contexte spécifique
   */
  const saveScrollPosition = (
    galleryId: 'left' | 'right',
    directoryId: string,
    filter: string = 'all',
    scrollData: Omit<ScrollPositionData, 'timestamp'>
  ) => {
    const key = getScrollKey(galleryId, directoryId, filter);
    // Créer un nouvel objet au lieu d'utiliser une fonction de mise à jour
    const newPositionsMap: ScrollPositionsMap = { 
      ...scrollPositionsMap,
      [key]: {
        ...scrollData,
        timestamp: Date.now() // Ajouter un timestamp pour d'éventuelles expirations futures
      }
    };
    setScrollPositionsMap(newPositionsMap);
  };

  /**
   * Récupère la position de défilement pour un contexte spécifique
   */
  const getScrollPosition = (
    galleryId: 'left' | 'right',
    directoryId: string,
    filter: string = 'all'
  ): ScrollPositionData | null => {
    const key = getScrollKey(galleryId, directoryId, filter);
    return scrollPositionsMap[key] || null;
  };

  /**
   * Nettoie les positions de défilement anciennes (plus de 7 jours)
   */
  const cleanupOldPositions = () => {
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
  };

  // Nettoyer les anciennes positions au chargement
  React.useEffect(() => {
    cleanupOldPositions();
  }, []);

  return {
    saveScrollPosition,
    getScrollPosition
  };
}
