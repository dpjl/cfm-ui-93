
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GallerySelectionBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onDelete: () => void;
}

const GallerySelectionBar: React.FC<GallerySelectionBarProps> = ({
  selectedCount,
  onDeselectAll,
  onDelete,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-30 mx-auto flex w-fit items-center gap-2 rounded-lg bg-background p-2 shadow-lg">
      <span className="px-2 text-sm font-medium">
        {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>
      <Button variant="ghost" onClick={onDeselectAll} size="sm">
        Désélectionner
      </Button>
      <Button variant="ghost" onClick={onDelete} size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4 text-destructive" />
        <span className="ml-1">Supprimer</span>
      </Button>
    </div>
  );
};

export default GallerySelectionBar;
