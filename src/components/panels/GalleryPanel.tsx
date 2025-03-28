
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaIds } from '@/api/imageApi';
import MediaGrid from '../gallery/MediaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface GalleryPanelProps {
  position: 'source' | 'destination';
  onPreview: (id: string) => void;
}

const GalleryPanel: React.FC<GalleryPanelProps> = ({ position, onPreview }) => {
  const [currentDirectory, setCurrentDirectory] = useState('/');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  
  const { data: mediaIds, isLoading, error } = useQuery({
    queryKey: ['mediaIds', position, currentDirectory, currentFilter],
    queryFn: () => fetchMediaIds(currentDirectory, position, currentFilter),
  });
  
  const handleMediaSelect = (id: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedMedia(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id) 
          : [...prev, id]
      );
    } else {
      setSelectedMedia(prev => 
        prev.includes(id) && prev.length === 1 
          ? [] 
          : [id]
      );
    }
  };
  
  // Appelé lorsque le répertoire est changé depuis le panneau latéral
  const handleDirectoryChange = (directory: string) => {
    setCurrentDirectory(directory);
    setSelectedMedia([]);
  };
  
  // Appelé lorsque le filtre est changé depuis le panneau latéral
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setSelectedMedia([]);
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-2 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {position === 'source' ? 'Source' : 'Destination'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {mediaIds ? `${mediaIds.length} éléments` : '0 éléments'}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="aspect-square">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p>Impossible de charger les médias</p>
          </div>
        ) : mediaIds && mediaIds.length > 0 ? (
          <MediaGrid 
            mediaIds={mediaIds} 
            position={position}
            selectedMedia={selectedMedia}
            onSelect={handleMediaSelect}
            onPreview={onPreview}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Aucun média trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPanel;
