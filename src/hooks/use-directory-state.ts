
import { useGalleryContext } from '@/contexts/GalleryContext';

/**
 * Hook pour accéder à l'état des répertoires
 */
export function useDirectoryState() {
  const {
    selectedDirectoryIdLeft,
    setSelectedDirectoryIdLeft,
    selectedDirectoryIdRight,
    setSelectedDirectoryIdRight
  } = useGalleryContext();
  
  return {
    selectedDirectoryIdLeft,
    setSelectedDirectoryIdLeft,
    selectedDirectoryIdRight,
    setSelectedDirectoryIdRight,
  };
}
