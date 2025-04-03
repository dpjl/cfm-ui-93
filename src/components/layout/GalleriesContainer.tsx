
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { fetchMediaIds } from '@/api/imageApi';
import { GalleryViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import GalleriesView from './GalleriesView';

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
  handleDelete: () => void;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
}

interface SidebarToggleProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

interface GalleriesContainerProps extends BaseGalleryProps, SidebarToggleProps {
  mobileViewMode: GalleryViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
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
  handleDelete,
  mobileViewMode,
  setMobileViewMode,
  leftFilter,
  rightFilter,
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange
}) => {
  const isMobile = useIsMobile();

  // Toggle full view handlers
  const handleToggleLeftFullView = () => {
    if (mobileViewMode === 'left') {
      setMobileViewMode('both');
    } else {
      setMobileViewMode('left');
    }
  };

  const handleToggleRightFullView = () => {
    if (mobileViewMode === 'right') {
      setMobileViewMode('both');
    } else {
      setMobileViewMode('right');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GalleriesView
        selectedDirectoryIdLeft={selectedDirectoryIdLeft}
        selectedDirectoryIdRight={selectedDirectoryIdRight}
        columnsCountLeft={columnsCountLeft}
        columnsCountRight={columnsCountRight}
        selectedIdsLeft={selectedIdsLeft}
        setSelectedIdsLeft={setSelectedIdsLeft}
        selectedIdsRight={selectedIdsRight}
        setSelectedIdsRight={setSelectedIdsRight}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        activeSide={activeSide}
        deleteMutation={deleteMutation}
        handleDeleteSelected={handleDeleteSelected}
        handleDelete={handleDelete}
        onToggleLeftPanel={onToggleLeftPanel}
        onToggleRightPanel={onToggleRightPanel}
        onColumnsChange={onColumnsChange || ((side, count) => {})}
        mobileViewMode={mobileViewMode}
        onToggleFullView={side => side === 'left' ? handleToggleLeftFullView() : handleToggleRightFullView()}
        leftFilter={leftFilter}
        rightFilter={rightFilter}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        selectedIds={activeSide === 'left' ? selectedIdsLeft : selectedIdsRight}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleriesContainer;
