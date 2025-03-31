
import { useGalleryContext } from '@/context/GalleryContext';

export function useUIState() {
  // On délègue maintenant tout au GalleryContext
  return useGalleryContext();
}
