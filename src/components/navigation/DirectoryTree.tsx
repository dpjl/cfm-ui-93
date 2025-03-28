
import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DirectoryNode {
  name: string;
  path: string;
  children?: DirectoryNode[];
}

interface DirectoryTreeProps {
  directories: DirectoryNode[];
  level?: number;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ directories, level = 0 }) => {
  const [expandedDirs, setExpandedDirs] = useState<string[]>([]);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);

  const toggleExpand = (path: string) => {
    setExpandedDirs(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  const handleSelect = (path: string) => {
    setSelectedDir(path);
    // Ici on pourrait aussi émettre un événement vers le composant parent
  };

  return (
    <ul className={cn(level > 0 ? "pl-4" : "")}>
      {directories.map((dir) => {
        const isExpanded = expandedDirs.includes(dir.path);
        const isSelected = selectedDir === dir.path;
        const hasChildren = dir.children && dir.children.length > 0;

        return (
          <li key={dir.path} className="py-1">
            <div 
              className={cn(
                "flex items-center space-x-1 rounded-md py-1 px-2 hover:bg-secondary cursor-pointer",
                isSelected && "bg-primary/10"
              )}
              onClick={() => handleSelect(dir.path)}
            >
              {hasChildren && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(dir.path);
                  }}
                  className="h-4 w-4 p-0 flex items-center justify-center text-muted-foreground"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                ) : (
                  <Folder className="h-4 w-4 text-amber-500" />
                )
              ) : (
                <Folder className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm truncate">{dir.name}</span>
            </div>
            
            {hasChildren && isExpanded && (
              <DirectoryTree directories={dir.children} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default DirectoryTree;
