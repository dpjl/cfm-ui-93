import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { fetchMediaIds } from '@/api/imageApi';
import { MobileViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import DesktopGalleriesView from './DesktopGalleriesView';
import MobileGalleriesView from './MobileGalleriesView';
import MobileViewSwitcher from './MobileViewSwitcher';

// Combined props for GalleriesContainer
interface GalleriesContainerProps extends BaseGalleryProps, SidebarToggleProps {
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
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

  // Fetch media IDs for left and right columns
  const { data: leftMediaIds, isLoading: isLoadingLeftMediaIds, error: errorLeftMediaIds } = useQuery(['leftMediaIds'], () => fetchMediaIds(selectedDirectoryIdLeft, columnsCountLeft));
  const { data: rightMediaIds, isLoading: isLoadingRightMediaIds, error: errorRightMediaIds } = useQuery(['rightMediaIds'], () => fetchMediaIds(selectedDirectoryIdRight, columnsCountRight));

  // Handlers for selecting and previewing items
  const handleSelectIdLeft = (id: string) => setSelectedIdsLeft((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handleSelectIdRight = (id: string) => setSelectedIdsRight((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handlePreviewItemLeft = (id: string) => console.log(`Previewing item ${id} in source`);
  const handlePreviewItemRight = (id: string) => console.log(`Previewing item ${id} in destination`);
  const handleConfirmDelete = (side: 'left' | 'right') => () => handleDeleteSelected(side);

  // Add handlers for changing columns
  const handleLeftColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Left columns changed to:', count);
      onColumnsChange(activeSide === 'left' ? 'left' : 'right', count);
    }
  };

  const handleRightColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Right columns changed to:', count);
      onColumnsChange('right', count);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isMobile ? (
        <div className="flex flex-col h-full overflow-hidden">
          <MobileViewSwitcher
            viewMode={mobileViewMode}
            onViewModeChange={setMobileViewMode}
          />
          <MobileGalleriesView
            viewMode={mobileViewMode}
            leftContent={
              <GalleryContent
                title="Source"
                mediaIds={leftMediaIds}
                selectedIds={selectedIdsLeft}
                onSelectId={(id) => handleSelectIdLeft(id)}
                isLoading={isLoadingLeftMediaIds}
                isError={!!errorLeftMediaIds}
                error={errorLeftMediaIds}
                columnsCount={columnsCountLeft}
                viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
                onPreviewItem={handlePreviewItemLeft}
                onDeleteSelected={handleConfirmDelete('left')}
                position="source"
                filter={leftFilter}
                onToggleSidebar={onToggleLeftPanel}
                onColumnsChange={handleLeftColumnsChange}
              />
            }
            rightContent={
              <GalleryContent
                title="Destination"
                mediaIds={rightMediaIds}
                selectedIds={selectedIdsRight}
                onSelectId={(id) => handleSelectIdRight(id)}
                isLoading={isLoadingRightMediaIds}
                isError={!!errorRightMediaIds}
                error={errorRightMediaIds}
                columnsCount={columnsCountRight}
                viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
                onPreviewItem={handlePreviewItemRight}
                onDeleteSelected={handleConfirmDelete('right')}
                position="destination"
                filter={rightFilter}
                onToggleSidebar={onToggleRightPanel}
                onColumnsChange={handleRightColumnsChange}
              />
            }
          />
        </div>
      ) : (
        <DesktopGalleriesView
          leftContent={
            <GalleryContent
              title="Source"
              mediaIds={leftMediaIds}
              selectedIds={selectedIdsLeft}
              onSelectId={(id) => handleSelectIdLeft(id)}
              isLoading={isLoadingLeftMediaIds}
              isError={!!errorLeftMediaIds}
              error={errorLeftMediaIds}
              columnsCount={columnsCountLeft}
              onPreviewItem={handlePreviewItemLeft}
              onDeleteSelected={handleConfirmDelete('left')}
              position="source"
              filter={leftFilter}
              onToggleSidebar={onToggleLeftPanel}
              onColumnsChange={handleLeftColumnsChange}
            />
          }
          rightContent={
            <GalleryContent
              title="Destination"
              mediaIds={rightMediaIds}
              selectedIds={selectedIdsRight}
              onSelectId={(id) => handleSelectIdRight(id)}
              isLoading={isLoadingRightMediaIds}
              isError={!!errorRightMediaIds}
              error={errorRightMediaIds}
              columnsCount={columnsCountRight}
              onPreviewItem={handlePreviewItemRight}
              onDeleteSelected={handleConfirmDelete('right')}
              position="destination"
              filter={rightFilter}
              onToggleSidebar={onToggleRightPanel}
              onColumnsChange={handleRightColumnsChange}
            />
          }
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => handleDeleteSelected(activeSide)}
        count={activeSide === 'left' ? selectedIdsLeft.length : selectedIdsRight.length}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleriesContainer;
