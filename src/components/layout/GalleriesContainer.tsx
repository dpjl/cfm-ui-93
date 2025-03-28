
import React from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import MobileGalleriesView from './MobileGalleriesView';
import DesktopGalleriesView from './DesktopGalleriesView';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { BaseGalleryProps, ViewModeProps, SidebarToggleProps } from '@/types/gallery-props';

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
  leftFilter = 'all',
  rightFilter = 'all',
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  const isMobile = useIsMobile();
  
  console.log(`GalleriesContainer rendering with columns: left=${columnsCountLeft}, right=${columnsCountRight}`);
  
  // Create props object for desktop/mobile views
  const sharedProps = {
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
    leftFilter,
    rightFilter,
    onToggleLeftPanel,
    onToggleRightPanel
  };
  
  // Return appropriate view based on device type
  if (isMobile) {
    return (
      <MobileGalleriesView
        {...sharedProps}
        mobileViewMode={mobileViewMode}
        setMobileViewMode={setMobileViewMode}
      />
    );
  }

  return (
    <DesktopGalleriesView
      {...sharedProps}
      viewMode={mobileViewMode}
      mobileViewMode={mobileViewMode}
    />
  );
};

export default GalleriesContainer;
