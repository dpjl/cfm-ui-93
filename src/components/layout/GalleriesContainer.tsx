
import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds } from '@/api/imageApi';
import { MediaFilter } from '@/components/AppSidebar';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import GalleriesView from './GalleriesView';
import { useGalleryLayout } from '@/hooks/use-gallery-layout';

interface GalleriesContainerProps {
  // Propriétés des colonnes
  columnsCountLeft: number;
  columnsCountRight: number;
  
  // Propriétés de sélection
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Propriétés des répertoires
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  
  // Propriétés de dialogue
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSide: 'left' | 'right';
  deleteMutation: any;
  
  // Propriétés de gestion
  handleDeleteSelected: (side: 'left' | 'right') => void;

  // Propriétés des filtres
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
  
  // Propriétés de panneau latéral
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  
  // Propriétés de colonnes
  onColumnsChange?: (side: 'left' | 'right', count: number) => void;
  
  // État de vue initial
  initialViewMode?: 'left' | 'right' | 'both';
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
  leftFilter = 'all',
  rightFilter = 'all',
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange,
  initialViewMode = 'both'
}) => {
  // Utiliser notre hook custom pour la gestion de l'agencement
  const { 
    viewMode, 
    setViewMode, 
    getViewType, 
    toggleFullView 
  } = useGalleryLayout();
  
  // Initialiser le mode de vue avec la prop initialViewMode si fournie
  React.useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode, setViewMode]);

  // Requêtes pour la galerie de gauche
  const { 
    data: leftMediaIds = [], 
    isLoading: isLoadingLeftMediaIds, 
    error: errorLeftMediaIds 
  } = useQuery({
    queryKey: ['leftMediaIds', selectedDirectoryIdLeft, leftFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdLeft, 'source', leftFilter)
  });
  
  // Requêtes pour la galerie de droite
  const { 
    data: rightMediaIds = [], 
    isLoading: isLoadingRightMediaIds, 
    error: errorRightMediaIds 
  } = useQuery({
    queryKey: ['rightMediaIds', selectedDirectoryIdRight, rightFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdRight, 'destination', rightFilter)
  });

  // Gestionnaires d'événements pour la sélection des éléments
  const handleSelectIdLeft = useCallback((id: string) => {
    setSelectedIdsLeft((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  }, [setSelectedIdsLeft]);
  
  const handleSelectIdRight = useCallback((id: string) => {
    setSelectedIdsRight((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  }, [setSelectedIdsRight]);
  
  // Gestionnaires d'événements pour la prévisualisation des éléments
  const handlePreviewItemLeft = useCallback((id: string) => {
    console.log(`Previewing item ${id} in source`);
  }, []);
  
  const handlePreviewItemRight = useCallback((id: string) => {
    console.log(`Previewing item ${id} in destination`);
  }, []);
  
  // Gestionnaires d'événements pour la confirmation de suppression
  const handleConfirmDelete = useCallback((side: 'left' | 'right') => () => {
    handleDeleteSelected(side);
  }, [handleDeleteSelected]);

  // Gestionnaires pour le changement du nombre de colonnes
  const handleLeftColumnsChange = useCallback((count: number) => {
    if (onColumnsChange) {
      console.log('Left columns changed to:', count);
      onColumnsChange('left', count);
    }
  }, [onColumnsChange]);

  const handleRightColumnsChange = useCallback((count: number) => {
    if (onColumnsChange) {
      console.log('Right columns changed to:', count);
      onColumnsChange('right', count);
    }
  }, [onColumnsChange]);

  // Gestionnaires pour basculer en vue plein écran
  const handleToggleLeftFullView = useCallback(() => {
    toggleFullView('left');
  }, [toggleFullView]);

  const handleToggleRightFullView = useCallback(() => {
    toggleFullView('right');
  }, [toggleFullView]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Utiliser notre nouveau composant GalleriesView unifié */}
      <GalleriesView
        viewMode={viewMode}
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
            viewMode={getViewType()}
            onPreviewItem={handlePreviewItemLeft}
            onDeleteSelected={handleConfirmDelete('left')}
            position="source"
            filter={leftFilter}
            onToggleSidebar={onToggleLeftPanel}
            onColumnsChange={handleLeftColumnsChange}
            mobileViewMode={viewMode}
            onToggleFullView={handleToggleLeftFullView}
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
            viewMode={getViewType()}
            onPreviewItem={handlePreviewItemRight}
            onDeleteSelected={handleConfirmDelete('right')}
            position="destination"
            filter={rightFilter}
            onToggleSidebar={onToggleRightPanel}
            onColumnsChange={handleRightColumnsChange}
            mobileViewMode={viewMode}
            onToggleFullView={handleToggleRightFullView}
          />
        }
      />

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
