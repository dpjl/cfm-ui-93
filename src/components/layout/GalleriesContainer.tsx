
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

// Define the props interfaces that were missing
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

// Define the GalleriesContainerProps interface
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

  // Fetch media IDs for left and right columns
  const { data: leftMediaIds = [], isLoading: isLoadingLeftMediaIds, error: errorLeftMediaIds } = useQuery({
    queryKey: ['leftMediaIds', selectedDirectoryIdLeft, leftFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdLeft, 'source', leftFilter as string)
  });
  
  const { data: rightMediaIds = [], isLoading: isLoadingRightMediaIds, error: errorRightMediaIds } = useQuery({
    queryKey: ['rightMediaIds', selectedDirectoryIdRight, rightFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdRight, 'destination', rightFilter as string)
  });

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
      onColumnsChange('left', count);
    }
  };

  const handleRightColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Right columns changed to:', count);
      onColumnsChange('right', count);
    }
  };

  // Handlers for toggling maximize/minimize
  const handleToggleLeftMaximize = () => {
    setMobileViewMode(mobileViewMode === 'left' ? 'both' : 'left');
  };

  const handleToggleRightMaximize = () => {
    setMobileViewMode(mobileViewMode === 'right' ? 'both' : 'right');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {isMobile ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-grow h-full overflow-hidden">
            <MobileGalleriesView
              mobileViewMode={mobileViewMode}
              leftContent={
                <GalleryContent
                  title="Source"
                  mediaIds={leftMediaIds || []}
                  selectedIds={selectedIdsLeft}
                  onSelectId={handleSelectIdLeft}
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
                  mobileViewMode={mobileViewMode}
                  onToggleMaximize={handleToggleLeftMaximize}
                />
              }
              rightContent={
                <GalleryContent
                  title="Destination"
                  mediaIds={rightMediaIds || []}
                  selectedIds={selectedIdsRight}
                  onSelectId={handleSelectIdRight}
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
                  mobileViewMode={mobileViewMode}
                  onToggleMaximize={handleToggleRightMaximize}
                />
              }
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
          leftContent={
            <GalleryContent
              title="Source"
              mediaIds={leftMediaIds || []}
              selectedIds={selectedIdsLeft}
              onSelectId={handleSelectIdLeft}
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
              mobileViewMode={mobileViewMode}
              onToggleMaximize={handleToggleLeftMaximize}
            />
          }
          rightContent={
            <GalleryContent
              title="Destination"
              mediaIds={rightMediaIds || []}
              selectedIds={selectedIdsRight}
              onSelectId={handleSelectIdRight}
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
              mobileViewMode={mobileViewMode}
              onToggleMaximize={handleToggleRightMaximize}
            />
          }
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
