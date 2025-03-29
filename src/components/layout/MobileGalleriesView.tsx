
import React from 'react';
import GalleryContainer from '@/components/GalleryContainer';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import MobileViewSwitcher from './MobileViewSwitcher';

interface MobileGalleriesViewProps {
  columnsCountLeft: number;
  columnsCountRight: number;
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  deleteDialogOpen: boolean;
  activeSide: 'left' | 'right' | null;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteMutation: any;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const MobileGalleriesView: React.FC<MobileGalleriesViewProps> = ({
  columnsCountLeft,
  columnsCountRight,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  handleDeleteSelected,
  deleteDialogOpen,
  activeSide,
  setDeleteDialogOpen,
  deleteMutation,
  leftFilter = 'all' as MediaFilter,
  rightFilter = 'all' as MediaFilter,
  mobileViewMode,
  setMobileViewMode,
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Left Gallery (Source) */}
      {(mobileViewMode === 'left' || mobileViewMode === 'both') && (
        <div className={`transition-all duration-300 h-full ${
          mobileViewMode === 'both' ? 'w-1/2 float-left' : 'w-full'
        }`}>
          <GalleryContainer
            title="Source Gallery"
            directory={selectedDirectoryIdLeft}
            position="left"
            columnsCount={columnsCountLeft}
            selectedIds={selectedIdsLeft}
            setSelectedIds={setSelectedIdsLeft}
            onDeleteSelected={() => handleDeleteSelected('left')}
            deleteDialogOpen={deleteDialogOpen && activeSide === 'left'}
            setDeleteDialogOpen={setDeleteDialogOpen}
            deleteMutation={deleteMutation}
            hideHeader={true}
            viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
            filter={leftFilter}
            onToggleSidebar={onToggleLeftPanel}
          />
        </div>
      )}
      
      {/* Right Gallery (Destination) */}
      {(mobileViewMode === 'right' || mobileViewMode === 'both') && (
        <div className={`transition-all duration-300 h-full ${
          mobileViewMode === 'both' ? 'w-1/2 float-right' : 'w-full'
        }`}>
          <GalleryContainer
            title="Destination Gallery"
            directory={selectedDirectoryIdRight}
            position="right"
            columnsCount={columnsCountRight}
            selectedIds={selectedIdsRight}
            setSelectedIds={setSelectedIdsRight}
            onDeleteSelected={() => handleDeleteSelected('right')}
            deleteDialogOpen={deleteDialogOpen && activeSide === 'right'}
            setDeleteDialogOpen={setDeleteDialogOpen}
            deleteMutation={deleteMutation}
            hideHeader={true}
            viewMode={mobileViewMode === 'both' ? 'split' : 'single'} 
            filter={rightFilter}
            onToggleSidebar={onToggleRightPanel}
          />
        </div>
      )}
      
      <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center z-20">
        <MobileViewSwitcher 
          viewMode={mobileViewMode}
          setViewMode={setMobileViewMode}
          mobileViewMode={mobileViewMode}
          setMobileViewMode={setMobileViewMode}
        />
      </div>
    </div>
  );
};

export default MobileGalleriesView;
