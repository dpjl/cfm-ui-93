
import React from 'react';
import { LanguageProvider } from '@/hooks/use-language';
import { useIsMobile } from '@/hooks/use-breakpoint';
import ServerStatusPanel from '@/components/ServerStatusPanel';
import GalleryLayout from '@/components/layout/GalleryLayout';
import GalleryPageHeader from '@/components/layout/GalleryPageHeader';
import { useGalleryState } from '@/hooks/use-gallery-state';

const Index = () => {
  const isMobile = useIsMobile();
  const galleryState = useGalleryState();
  
  const isSidebarOpen = galleryState.leftPanelOpen || galleryState.rightPanelOpen;

  return (
    <LanguageProvider>
      <div className="h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <ServerStatusPanel 
          isOpen={galleryState.serverPanelOpen}
          onOpenChange={galleryState.setServerPanelOpen}
        />
        
        <GalleryPageHeader 
          onRefresh={galleryState.handleRefresh}
          isDeletionPending={galleryState.deleteMutation.isPending}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebars={galleryState.closeBothSidebars}
          galleryViewMode={galleryState.viewMode}
          setGalleryViewMode={galleryState.setViewMode}
          selectedIdsLeft={galleryState.selectedIdsLeft}
          selectedIdsRight={galleryState.selectedIdsRight}
          onDelete={galleryState.handleDelete}
          onToggleServerPanel={() => galleryState.setServerPanelOpen(!galleryState.serverPanelOpen)}
          isServerPanelOpen={galleryState.serverPanelOpen}
        />
        
        <GalleryLayout 
          selectedDirectoryIdLeft={galleryState.selectedDirectoryIdLeft}
          setSelectedDirectoryIdLeft={galleryState.setSelectedDirectoryIdLeft}
          selectedDirectoryIdRight={galleryState.selectedDirectoryIdRight}
          setSelectedDirectoryIdRight={galleryState.setSelectedDirectoryIdRight}
          columnsCountLeft={galleryState.getCurrentColumnsLeft()}
          columnsCountRight={galleryState.getCurrentColumnsRight()}
          onLeftColumnsChange={(count) => galleryState.updateColumnCount('left', count)}
          onRightColumnsChange={(count) => galleryState.updateColumnCount('right', count)}
          selectedIdsLeft={galleryState.selectedIdsLeft}
          setSelectedIdsLeft={galleryState.setSelectedIdsLeft}
          selectedIdsRight={galleryState.selectedIdsRight}
          setSelectedIdsRight={galleryState.setSelectedIdsRight}
          deleteDialogOpen={galleryState.deleteDialogOpen}
          setDeleteDialogOpen={galleryState.setDeleteDialogOpen}
          activeSide={galleryState.activeSide}
          deleteMutation={galleryState.deleteMutation}
          handleDeleteSelected={galleryState.handleDeleteSelected}
          leftPanelOpen={galleryState.leftPanelOpen}
          toggleLeftPanel={galleryState.toggleLeftPanel}
          rightPanelOpen={galleryState.rightPanelOpen}
          toggleRightPanel={galleryState.toggleRightPanel}
          viewMode={galleryState.viewMode}
          setViewMode={galleryState.setViewMode}
          leftFilter={galleryState.leftFilter}
          setLeftFilter={galleryState.setLeftFilter}
          rightFilter={galleryState.rightFilter}
          setRightFilter={galleryState.setRightFilter}
        />
      </div>
    </LanguageProvider>
  );
};

export default Index;
