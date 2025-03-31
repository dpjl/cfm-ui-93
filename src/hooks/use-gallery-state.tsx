
import { useGalleryContext } from '@/contexts/GalleryContext';

// Ce hook sert maintenant de wrapper pour accéder au GalleryContext
export function useGalleryState() {
  // Récupérer toutes les valeurs et méthodes du contexte
  return useGalleryContext();
}
