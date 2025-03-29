
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DirectoryNode } from '@/api/imageApi';
import { useLanguage } from '@/hooks/use-language';

interface FolderTreeProps {
  directories: DirectoryNode[];
  selectedDirectoryId: string;
  onSelectDirectory: (directoryId: string) => void;
  level?: number;
  position: 'left' | 'right';
}

const STORAGE_KEY_PREFIX = 'folder-tree-expanded-';

const FolderTree: React.FC<FolderTreeProps> = ({
  directories,
  selectedDirectoryId,
  onSelectDirectory,
  level = 0,
  position
}) => {
  const { t } = useLanguage();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Storage key for this specific tree position
  const storageKey = `${STORAGE_KEY_PREFIX}${position}`;

  // Load expanded folders state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        setExpandedFolders(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Failed to load folder tree state:', error);
    }
  }, [storageKey]);

  // Ensure the selected directory's parents are expanded
  useEffect(() => {
    if (!selectedDirectoryId) return;
    
    // Find the directory and all its parent directories
    const ensureParentsExpanded = (dirs: DirectoryNode[], targetId: string, parentIds: string[] = []): string[] | null => {
      for (const dir of dirs) {
        if (dir.id === targetId) {
          return parentIds; // Found the target, return the path to it
        }
        
        if (dir.children && dir.children.length > 0) {
          const result = ensureParentsExpanded(dir.children, targetId, [...parentIds, dir.id]);
          if (result) {
            return result;
          }
        }
      }
      
      return null; // Target not found in this branch
    };
    
    const parentIds = ensureParentsExpanded(directories, selectedDirectoryId);
    
    if (parentIds && parentIds.length > 0) {
      const newExpandedState = { ...expandedFolders };
      parentIds.forEach(id => {
        newExpandedState[id] = true;
      });
      
      setExpandedFolders(newExpandedState);
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(newExpandedState));
    }
  }, [selectedDirectoryId, directories, expandedFolders, storageKey]);

  // Toggle folder expansion
  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpandedState = {
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId]
    };
    
    setExpandedFolders(newExpandedState);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(newExpandedState));
  };

  // Check if folder is currently expanded
  const isFolderExpanded = (folderId: string) => {
    return !!expandedFolders[folderId];
  };

  if (!directories || directories.length === 0) {
    return (
      <div className="px-2 py-1 text-xs text-muted-foreground">
        {t('noDirectories')}
      </div>
    );
  }

  return (
    <ul className={cn("space-y-0.5", level > 0 ? "ml-2" : "")}>
      {directories.map((directory) => {
        const hasChildren = directory.children && directory.children.length > 0;
        const isExpanded = isFolderExpanded(directory.id);
        const isSelected = selectedDirectoryId === directory.id;
        
        return (
          <li key={directory.id}>
            <div 
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-xs transition-colors",
                isSelected ? "bg-accent text-accent-foreground font-medium" : ""
              )}
              onClick={() => onSelectDirectory(directory.id)}
            >
              {hasChildren ? (
                <span 
                  className="w-2.5 h-2.5 flex items-center justify-center"
                  onClick={(e) => toggleFolder(directory.id, e)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-2.5 w-2.5" />
                  ) : (
                    <ChevronRight className="h-2.5 w-2.5" />
                  )}
                </span>
              ) : (
                <span className="w-2.5 h-2.5" />
              )}
              
              {isSelected ? (
                <FolderOpen className="h-2.5 w-2.5 text-accent-foreground" />
              ) : (
                <Folder className="h-2.5 w-2.5" />
              )}
              
              <span className="truncate text-xs">{directory.name}</span>
            </div>
            
            {hasChildren && (isExpanded || isSelected) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FolderTree
                  directories={directory.children}
                  selectedDirectoryId={selectedDirectoryId}
                  onSelectDirectory={onSelectDirectory}
                  level={level + 1}
                  position={position}
                />
              </motion.div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FolderTree;
