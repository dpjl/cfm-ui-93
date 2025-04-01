
import { useCallback, useState } from 'react';
import { getMediaUrl } from '@/api/imageApi';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImages } from '@/api/imageApi';
import { useMediaCache } from '@/hooks/use-media-cache';

/**
 * Hook combiné pour gérer les opérations sur les médias
 */
export function useMediaOperations(
  selectedIdsLeft: string[],
  selectedIdsRight: string[],
  activeSide: 'left' | 'right',
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>,
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCachedMediaInfo, setCachedMediaInfo } = useMediaCache();
  
  // État qui va stocker le côté à supprimer
  const [sideToDelete, setSideToDelete] = useState<'left' | 'right'>('left');
  
  // Download handler
  const handleDownloadMedia = useCallback(async (id: string, position: 'source' | 'destination'): Promise<void> => {
    try {
      const a = document.createElement('a');
      a.href = getMediaUrl(id, position);
      a.download = `media-${id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return Promise.resolve();
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  }, [toast]);
  
  // Download selected handler
  const handleDownloadSelected = useCallback(async (ids: string[], position: 'source' | 'destination' = 'source'): Promise<void> => {
    if (ids.length === 0) return Promise.resolve();
    
    try {
      // For a single file, trigger direct download
      if (ids.length === 1) {
        return handleDownloadMedia(ids[0], position);
      }
      
      // For multiple files, display a notification
      toast({
        title: "Multiple files download",
        description: `Downloading ${ids.length} files is not supported yet. Please select one file at a time.`,
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }, [handleDownloadMedia, toast]);
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ ids, directory }: { ids: string[], directory: 'source' | 'destination' }) => 
      deleteImages(ids, directory),
    onSuccess: (_, { directory }) => {
      // Récupération des IDs correspondants à la galerie active
      const activeSelectedIds = directory === 'source' ? selectedIdsLeft : selectedIdsRight;
      toast({
        title: `${activeSelectedIds.length} ${activeSelectedIds.length === 1 ? 'media' : 'media files'} deleted`,
        description: "The selected media files have been moved to the trash.",
      });
      
      // Réinitialisation des IDs sélectionnés pour la galerie concernée
      if (directory === 'source') {
        setSelectedIdsLeft([]);
      } else {
        setSelectedIdsRight([]);
      }
      setDeleteDialogOpen(false);
      
      // Invalidate only the affected directory's query
      queryClient.invalidateQueries({ queryKey: ['mediaIds', directory] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting media files",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    }
  });
  
  // Action handlers
  const handleRefresh = useCallback(() => {
    toast({
      title: "Refreshing media",
      description: "Fetching the latest media files..."
    });
    queryClient.invalidateQueries({ queryKey: ['mediaIds'] });
  }, [queryClient, toast]);
  
  const handleDeleteSelected = useCallback((side: 'left' | 'right') => {
    // Enregistre le côté à supprimer pour être utilisé lors de la confirmation
    setSideToDelete(side);
    setDeleteDialogOpen(true);
  }, [setDeleteDialogOpen]);
  
  const handleDelete = useCallback(() => {
    // Utilise sideToDelete au lieu de activeSide
    if (sideToDelete === 'left' && selectedIdsLeft.length > 0) {
      deleteMutation.mutate({ ids: selectedIdsLeft, directory: 'source' });
    } else if (sideToDelete === 'right' && selectedIdsRight.length > 0) {
      deleteMutation.mutate({ ids: selectedIdsRight, directory: 'destination' });
    }
  }, [sideToDelete, selectedIdsLeft, selectedIdsRight, deleteMutation]);
  
  return {
    // Mutation
    deleteMutation,
    
    // Actions
    handleRefresh,
    handleDeleteSelected,
    handleDelete,
    handleDownloadMedia,
    handleDownloadSelected
  };
}
