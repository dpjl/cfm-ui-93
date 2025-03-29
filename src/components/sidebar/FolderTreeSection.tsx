
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryTree } from '@/api/imageApi';
import FolderTree from '@/components/FolderTree';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderTreeSectionProps {
  selectedDirectoryId: string;
  onSelectDirectory: (directoryId: string) => void;
  position: 'left' | 'right';
}

const FolderTreeSection: React.FC<FolderTreeSectionProps> = ({
  selectedDirectoryId,
  onSelectDirectory,
  position,
}) => {
  const { t } = useLanguage();
  
  // Fetch directory tree data with position=left or right
  const { 
    data: directoryTree = [], 
    isLoading 
  } = useQuery({
    queryKey: [`directoryTree${position === 'left' ? 'Left' : 'Right'}`],
    queryFn: () => fetchDirectoryTree(position)
  });

  return (
    <ScrollArea className="flex-1 h-[calc(100%-52px)]">
      <div className="p-3">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div 
                key={index} 
                className="h-4 bg-muted rounded-md animate-pulse" 
              />
            ))}
          </div>
        ) : (
          <FolderTree 
            directories={directoryTree}
            selectedDirectoryId={selectedDirectoryId}
            onSelectDirectory={onSelectDirectory}
            position={position}
          />
        )}
      </div>
    </ScrollArea>
  );
};

export default FolderTreeSection;
