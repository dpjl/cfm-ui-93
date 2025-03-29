
import React from 'react';
import { GalleryProvider, useGallery } from '@/contexts/GalleryContext';
import UnifiedVirtualizedGrid from './UnifiedVirtualizedGrid';
import { GalleryEmpty, GalleryError, GalleryLoading } from './GalleryStates';
import GalleryToolbar from './GalleryToolbar';
import MediaInfoPanel from '../media/MediaInfoPanel';
import MediaPreview from '../MediaPreview';
import { DetailedMediaInfo } from '@/api/imageApi';

// Contenu interne de la galerie qui utilise le contexte
const GalleryContent: React.FC = () => {
  const { 
    mediaIds, 
    selectedIds, 
    isLoading, 
    isError, 
    error, 
    selectItem,
    selectionMode,
    toggleSelectionMode,
    selectAll,
    deselectAll,
    deleteSelected,
    mediaInfoMap,
    position
  } = useGallery();
  
  // Vérifier l'état de chargement
  if (isLoading) {
    return <GalleryLoading />;
  }
  
  // Vérifier l'état d'erreur
  if (isError) {
    return <GalleryError error={error} />;
  }
  
  // Vérifier si la galerie est vide
  if (mediaIds.length === 0) {
    return <GalleryEmpty />;
  }

  // État pour le panneau d'informations
  const shouldShowInfoPanel = selectedIds.length > 0;
  
  // État pour l'aperçu
  const [previewMediaId, setPreviewMediaId] = React.useState<string | null>(null);
  
  // Déterminer si un élément est une vidéo
  const isVideoPreview = (id: string): boolean => {
    const info = mediaInfoMap.get(id);
    if (info) {
      const fileName = info.alt?.toLowerCase() || '';
      return fileName.endsWith('.mp4') || fileName.endsWith('.mov');
    }
    return false;
  };
  
  // Ouvrir l'aperçu d'un média
  const handleOpenPreview = (id: string) => {
    setPreviewMediaId(id);
  };
  
  // Fermer l'aperçu d'un média
  const handleClosePreview = () => {
    setPreviewMediaId(null);
  };
  
  // Naviguer dans l'aperçu (suivant/précédent)
  const handleNavigatePreview = (direction: 'next' | 'prev') => {
    if (!previewMediaId) return;
    
    const currentIndex = mediaIds.indexOf(previewMediaId);
    if (currentIndex === -1) return;
    
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Boucler si nécessaire
    if (newIndex >= mediaIds.length) newIndex = 0;
    if (newIndex < 0) newIndex = mediaIds.length - 1;
    
    setPreviewMediaId(mediaIds[newIndex]);
  };
  
  // Fermer le panneau d'informations en désélectionnant tout
  const handleCloseInfoPanel = () => {
    deselectAll();
  };
  
  return (
    <div className="flex flex-col h-full relative">
      <GalleryToolbar
        mediaIds={mediaIds}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        viewMode="single"
        position={position}
        selectionMode={selectionMode}
        onToggleSelectionMode={toggleSelectionMode}
      />
      
      <div className="flex-1 overflow-hidden relative scrollbar-vertical">
        {shouldShowInfoPanel && (
          <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
            <MediaInfoPanel
              selectedIds={selectedIds}
              onOpenPreview={handleOpenPreview}
              onDeleteSelected={deleteSelected}
              onDownloadSelected={() => console.log('Download', selectedIds)}
              mediaInfoMap={mediaInfoMap}
              selectionMode={selectionMode}
              position={position}
              onClose={handleCloseInfoPanel}
            />
          </div>
        )}
        
        <UnifiedVirtualizedGrid position={position} />
      </div>
      
      {previewMediaId && (
        <MediaPreview 
          mediaId={previewMediaId}
          isVideo={isVideoPreview(previewMediaId)}
          onClose={handleClosePreview}
          onNext={mediaIds.length > 1 ? () => handleNavigatePreview('next') : undefined}
          onPrevious={mediaIds.length > 1 ? () => handleNavigatePreview('prev') : undefined}
          hasNext={mediaIds.length > 1}
          hasPrevious={mediaIds.length > 1}
          position={position}
        />
      )}
    </div>
  );
};

// Composant externe qui fournit le contexte
interface GalleryProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  onPreviewMedia?: (id: string) => void;
  onDeleteSelected: () => void;
  position?: 'source' | 'destination';
  filter?: 'all' | 'favorites' | 'images' | 'videos'; // Affiner le type
  onToggleSidebar?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading = false,
  isError = false,
  error = null,
  columnsCount,
  viewMode = 'single',
  onDeleteSelected,
  position = 'source',
  filter = 'all',
  onToggleSidebar
}) => {
  // Cette fonction adapte l'API externe à l'API interne du contexte
  const handleSelectId = (id: string) => {
    onSelectId(id);
  };
  
  return (
    <GalleryProvider
      mediaIds={mediaIds}
      selectedIds={selectedIds}
      setSelectedIds={(ids) => {
        // Pour maintenir la compatibilité, nous n'implémentons qu'une sélection à la fois
        const idsToToggle = ids.filter(id => !selectedIds.includes(id))
                              .concat(selectedIds.filter(id => !ids.includes(id)));
        
        idsToToggle.forEach(id => handleSelectId(id));
      }}
      columnsCount={columnsCount}
      position={position}
      isLoading={isLoading}
      isError={isError}
      error={error}
      filter={filter}
      onDeleteSelected={onDeleteSelected}
      onToggleSidebar={onToggleSidebar}
      initialSelectionMode="multiple"
    >
      <GalleryContent />
    </GalleryProvider>
  );
};

export default Gallery;
