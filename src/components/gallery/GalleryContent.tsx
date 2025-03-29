
import React from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface GalleryContentProps {
  title: string;
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  onPreviewItem: (id: string) => void;
  onDeleteSelected: () => void;
  filter?: string;
  position?: 'source' | 'destination';
  onToggleSidebar?: () => void;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading,
  isError,
  error,
  columnsCount,
  viewMode = 'single',
  onPreviewItem,
  onDeleteSelected,
  title,
  filter = 'all',
  position = 'source',
  onToggleSidebar
}) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  if (isError) {
    return <div className="p-4 text-red-500">Error: {String(error)}</div>;
  }
  
  if (mediaIds.length === 0) {
    return <div className="p-4">No media items found.</div>;
  }
  
  return (
    <div className="h-full overflow-auto p-2">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div 
        className="grid gap-2" 
        style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}
      >
        {mediaIds.map(id => (
          <div 
            key={id} 
            className={`relative aspect-square rounded-md border ${
              selectedIds.includes(id) ? 'border-primary ring-2 ring-primary' : 'border-border'
            } overflow-hidden cursor-pointer`}
            onClick={() => onSelectId(id)}
          >
            <img 
              src={`/api/thumbnail?id=${id}`} 
              alt={`Media ${id}`} 
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryContent;
