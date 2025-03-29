
import React from 'react';
import { useQuery } from '@tanstack/react-query';
// Since there's no fetchDirectoryTree in the API, let's use mock data for now
import FolderTree from '@/components/FolderTree';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DirectoryNode } from '@/types/api';

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
  
  // Mock directory tree data
  const directoryTree: DirectoryNode[] = [
    {
      id: 'root',
      name: 'Root',
      children: [
        {
          id: 'photos',
          name: 'Photos',
          children: [
            { id: 'photos-2023', name: '2023' },
            { id: 'photos-2022', name: '2022' },
          ]
        },
        {
          id: 'videos',
          name: 'Videos',
        }
      ]
    }
  ];

  const isLoading = false;

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
