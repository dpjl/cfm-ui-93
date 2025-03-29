
import { useCallback } from 'react';
import { getMediaUrl } from '@/api/imageApi';
import { useToast } from '@/components/ui/use-toast';

export const useGalleryMediaHandler = (
  selectedIds: string[],
  position: 'source' | 'destination' = 'source'
) => {
  const { toast } = useToast();

  const handleDownloadSelected = useCallback(async (ids: string[] = selectedIds) => {
    if (ids.length === 0) return;
    
    // For a single file, trigger direct download
    if (ids.length === 1) {
      const a = document.createElement('a');
      a.href = getMediaUrl(ids[0], position);
      a.download = `media-${ids[0]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    
    // For multiple files, display a notification
    toast({
      title: "Multiple files download",
      description: `Downloading ${ids.length} files is not supported yet. Please select one file at a time.`,
    });
  }, [selectedIds, position, toast]);

  return {
    handleDownloadSelected
  };
};
