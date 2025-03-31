
import React, { createContext, useContext } from 'react';
import { GalleryContextType } from './types';

// Création du contexte
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  return context;
}

export { GalleryContext };
