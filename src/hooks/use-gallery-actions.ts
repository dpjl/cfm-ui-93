
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { deleteImages } from '@/api/imageApi';
import { useMutation } from '@tanstack/react-query';

export function useGalleryActions(
  selectedIdsLeft: string[],
  selectedIdsRight: string[],
  activeSide: 'left' | 'right',
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ ids, directory }: { ids: string[], directory: 'source' | 'destination' }) => 
      deleteImages(ids, directory),
    onSuccess: (_, { directory }) => {
      // Récupération des IDs correspondants à la galerie active (gauche ou droite)
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
  const handleRefresh = () => {
    toast({
      title: "Refreshing media",
      description: "Fetching the latest media files..."
    });
    queryClient.invalidateQueries({ queryKey: ['mediaIds'] });
  };
  
  const handleDeleteSelected = (side: 'left' | 'right') => {
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = () => {
    // Utilisation correcte de activeSide pour déterminer quels IDs envoyer et quelle direction utiliser
    if (activeSide === 'left' && selectedIdsLeft.length > 0) {
      deleteMutation.mutate({ ids: selectedIdsLeft, directory: 'source' });
    } else if (activeSide === 'right' && selectedIdsRight.length > 0) {
      deleteMutation.mutate({ ids: selectedIdsRight, directory: 'destination' });
    }
  };
  
  return {
    deleteMutation,
    handleRefresh,
    handleDeleteSelected,
    handleDelete
  };
}
