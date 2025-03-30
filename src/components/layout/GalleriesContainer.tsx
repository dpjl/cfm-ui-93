import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { fetchMediaIds } from '@/api/imageApi';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import DesktopGalleriesView from './DesktopGalleriesView';
import MobileGalleriesView from './MobileGalleriesView';

interface BaseGalleryProps {
  columnsCountLeft: number;
  columnsCountRight: number;
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSide: 'left' | 'right';
  deleteMutation: any;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
}

interface SidebarToggleProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

interface GalleriesContainerProps extends BaseGalleryProps, SidebarToggleProps {
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
  onColumnsChange?: (side: 'left' | 'right', count: number) => void;
}

const GalleriesContainer: React.FC<GalleriesContainerProps> = ({
  columnsCountLeft,
  columnsCountRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  deleteDialogOpen,
  setDeleteDialogOpen,
  activeSide,
  deleteMutation,
  handleDeleteSelected,
  mobileViewMode,
  setMobileViewMode,
  leftFilter,
  rightFilter,
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange
}) => {
  const isMobile = useIsMobile();

  const { data: leftMediaIds = [], isLoading: isLoadingLeftMediaIds, error: errorLeftMediaIds } = useQuery({
    queryKey: ['leftMediaIds', selectedDirectoryIdLeft, leftFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdLeft, 'source', leftFilter as string)
  });
  
  const { data: rightMediaIds = [], isLoading: isLoadingRightMediaIds, error: errorRightMediaIds } = useQuery({
    queryKey: ['rightMediaIds', selectedDirectoryIdRight, rightFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdRight, 'destination', rightFilter as string)
  });

  const handleSelectIdLeft = (id: string) => setSelectedIdsLeft((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handleSelectIdRight = (id: string) => setSelectedIdsRight((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handlePreviewItemLeft = (id: string) => console.log(`Previewing item ${id} in source`);
  const handlePreviewItemRight = (id: string) => console.log(`Previewing item ${id} in destination`);
  const handleConfirmDelete = (side: 'left' | 'right') => () => handleDeleteSelected(side);

  const handleLeftColumnsChange = (count: number) => {
    if (onColumnsChange) {
      onColumnsChange('left', count);
    }
  };

  const handleRightColumnsChange = (count: number) => {
    if (onColumnsChange) {
      onColumnsChange('right', count);
    }
  };

  const handleToggleLeftMaximize = () => {
    setMobileViewMode(prev => prev === 'left' ? 'both' : 'left');
  };

  const handleToggleRightMaximize = () => {
    setMobileViewMode(prev => prev === 'right' ? 'both' : 'right');
  };

  const leftGalleryContent = (
    <GalleryContent
      title="Source"
      mediaIds={leftMediaIds || []}
      selectedIds={selectedIdsLeft}
      onSelectId={handleSelectIdLeft}
      isLoading={isLoadingLeftMediaIds}
      isError={!!errorLeftMediaIds}
      error={errorLeftMediaIds}
      columnsCount={columnsCountLeft}
      viewMode={isMobile ? (mobileViewMode === 'both' ? 'split' : 'single') : 'single'}
      onPreviewItem={handlePreviewItemLeft}
      onDeleteSelected={handleConfirmDelete('left')}
      position="source"
      filter={leftFilter}
      onToggleSidebar={onToggleLeftPanel}
      onColumnsChange={handleLeftColumnsChange}
      mobileViewMode={mobileViewMode}
      onToggleMaximize={handleToggleLeftMaximize}
    />
  );

  const rightGalleryContent = (
    <GalleryContent
      title="Destination"
      mediaIds={rightMediaIds || []}
      selectedIds={selectedIdsRight}
      onSelectId={handleSelectIdRight}
      isLoading={isLoadingRightMediaIds}
      isError={!!errorRightMediaIds}
      error={errorRightMediaIds}
      columnsCount={columnsCountRight}
      viewMode={isMobile ? (mobileViewMode === 'both' ? 'split' : 'single') : 'single'}
      onPreviewItem={handlePreviewItemRight}
      onDeleteSelected={handleConfirmDelete('right')}
      position="destination"
      filter={rightFilter}
      onToggleSidebar={onToggleRightPanel}
      onColumnsChange={handleRightColumnsChange}
      mobileViewMode={mobileViewMode}
      onToggleMaximize={handleToggleRightMaximize}
    />
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isMobile ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-grow h-full overflow-hidden">
            <MobileGalleriesView
              mobileViewMode={mobileViewMode}
              leftContent={leftGalleryContent}
              rightContent={rightGalleryContent}
            />
          </div>
        </div>
      ) : (
        <DesktopGalleriesView
          columnsCountLeft={columnsCountLeft}
          columnsCountRight={columnsCountRight}
          selectedIdsLeft={selectedIdsLeft}
          setSelectedIdsLeft={setSelectedIdsLeft}
          selectedIdsRight={selectedIdsRight}
          setSelectedIdsRight={setSelectedIdsRight}
          selectedDirectoryIdLeft={selectedDirectoryIdLeft}
          selectedDirectoryIdRight={selectedDirectoryIdRight}
          handleDeleteSelected={handleDeleteSelected}
          deleteDialogOpen={deleteDialogOpen}
          activeSide={activeSide}
          setDeleteDialogOpen={setDeleteDialogOpen}
          deleteMutation={deleteMutation}
          leftFilter={leftFilter}
          rightFilter={rightFilter}
          viewMode={mobileViewMode}
          mobileViewMode={mobileViewMode}
          onToggleLeftPanel={onToggleLeftPanel}
          onToggleRightPanel={onToggleRightPanel}
          leftContent={leftGalleryContent}
          rightContent={rightGalleryContent}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => handleDeleteSelected(activeSide)}
        selectedIds={activeSide === 'left' ? selectedIdsLeft : selectedIdsRight}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleriesContainer;
