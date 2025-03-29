
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds } from '@/api/imageApi';
import GalleryHeader from '@/components/GalleryHeader';
import { useLanguage } from '@/hooks/use-language';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import { MediaFilter } from '@/components/AppSidebar';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface GalleryContainerProps {
  title: string;
  directory: string;
  position: 'left' | 'right';
  columnsCount: number;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onDeleteSelected: () => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteMutation: any;
  hideHeader?: boolean;
  viewMode?: 'single' | 'split';
  filter?: MediaFilter;
  hideMobileColumns?: boolean;
  onToggleSidebar?: () => void;
}

const GalleryContainer: React.FC<GalleryContainerProps> = ({
  title,
  directory,
  position,
  columnsCount,
  selectedIds,
  setSelectedIds,
  onDeleteSelected,
  deleteDialogOpen,
  setDeleteDialogOpen,
  deleteMutation,
  hideHeader = false,
  viewMode = 'single',
  filter = 'all',
  hideMobileColumns = false,
  onToggleSidebar
}) => {
  const { t } = useLanguage();
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  // Map the left/right position to source/destination
  const apiPosition = position === 'left' ? 'source' : 'destination';
  
  // Fetch media IDs for the selected directory
  const { 
    data = [], 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['mediaIds', directory, apiPosition, filter],
    queryFn: () => fetchMediaIds(directory, apiPosition, filter),
    enabled: !!directory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update mediaIds when data changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setMediaIds(data);
    }
  }, [data]);
  
  // Handle selecting/deselecting an item - simplified direct approach
  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle previewing an item
  const handlePreviewItem = (id: string) => {
    console.log(`Preview item: ${id}`);
    // Preview functionality would be implemented here
  };
  
  // Handle canceling deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = () => {
    deleteMutation.mutate({ 
      ids: selectedIds, 
      directory: apiPosition 
    });
  };

  // Create extra controls for the header
  const extraControls = React.useMemo(() => {
    // You would implement any extra controls here if needed
    return null;
  }, []);
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Gallery Header - only shown if hideHeader is false */}
      {!hideHeader && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2">
          <GalleryHeader
            title={title}
            columnsCount={columnsCount}
            setColumnsCount={() => {}} // Dummy function as this is controlled at a higher level
            extraControls={extraControls}
            hideMobileColumns={hideMobileColumns}
          />
        </div>
      )}
      
      {/* Gallery Content */}
      <div className="flex-1 overflow-auto">
        <GalleryContent
          mediaIds={mediaIds}
          selectedIds={selectedIds}
          onSelectId={handleSelectItem}
          isLoading={isLoading}
          isError={isError}
          error={error}
          columnsCount={columnsCount}
          viewMode={viewMode}
          onPreviewItem={handlePreviewItem}
          onDeleteSelected={onDeleteSelected}
          title={title}
          filter={filter}
          position={apiPosition}
          onToggleSidebar={onToggleSidebar}
          directory={directory}
        />
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedIds={selectedIds}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleryContainer;
