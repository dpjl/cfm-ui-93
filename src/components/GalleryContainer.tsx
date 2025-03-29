import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaIds } from '@/api/imageApi';
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
  
  const apiPosition = position === 'left' ? 'source' : 'destination';
  
  const { 
    data = [], 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['mediaIds', directory, apiPosition, filter],
    queryFn: () => getMediaIds(directory, apiPosition, filter),
    enabled: !!directory,
    staleTime: 1000 * 60 * 5,
  });
  
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setMediaIds(data);
    }
  }, [data]);
  
  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handlePreviewItem = (id: string) => {
    console.log(`Preview item: ${id}`);
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleConfirmDelete = () => {
    deleteMutation.mutate({ 
      ids: selectedIds, 
      directory: apiPosition 
    });
  };

  const extraControls = React.useMemo(() => {
    return null;
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
        />
      </div>
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedIds.length}
      />
    </div>
  );
};

export default GalleryContainer;
