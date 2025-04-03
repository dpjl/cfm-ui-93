
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds } from '@/api/imageApi';
import { MediaFilter } from '@/components/AppSidebar';
import { MediaListResponse } from '@/types/gallery';

/**
 * Hook pour récupérer les données de la galerie depuis l'API
 */
export function useGalleryQuery(
  directoryId: string | undefined,
  filter: MediaFilter | undefined
): {
  data: MediaListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
} {
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['mediaIds', directoryId, filter],
    queryFn: () => fetchMediaIds(directoryId || '', 'source', filter as string),
    enabled: !!directoryId,
  });
  
  return {
    data,
    isLoading,
    isError,
    error
  };
}
