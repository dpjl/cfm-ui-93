
import { useState } from 'react';

/**
 * Hook de base pour gérer l'état des répertoires sélectionnés
 */
export function useDirectoryState(initialLeft: string = "directory1", initialRight: string = "directory1") {
  const [selectedDirectoryIdLeft, setSelectedDirectoryIdLeft] = useState<string>(initialLeft);
  const [selectedDirectoryIdRight, setSelectedDirectoryIdRight] = useState<string>(initialRight);
  
  return {
    selectedDirectoryIdLeft,
    setSelectedDirectoryIdLeft,
    selectedDirectoryIdRight,
    setSelectedDirectoryIdRight,
  };
}
