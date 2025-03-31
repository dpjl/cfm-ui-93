
import { GalleryViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { useMutation } from '@tanstack/react-query';

// Interface du contexte
export interface GalleryContextType {
  // Directory state
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  setSelectedDirectoryIdLeft: (id: string) => void;
  setSelectedDirectoryIdRight: (id: string) => void;
  
  // Column management
  getCurrentColumnsLeft: () => number;
  getCurrentColumnsRight: () => number;
  updateColumnCount: (side: 'left' | 'right', count: number) => void;
  getColumnValuesForViewMode?: (side: 'left' | 'right') => { [key: string]: number };
  
  // Selection state
  selectedIdsLeft: string[];
  selectedIdsRight: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  activeSide: 'left' | 'right';
  setActiveSide: React.Dispatch<React.SetStateAction<'left' | 'right'>>;
  selectionMode: 'single' | 'multiple';
  toggleSelectionMode: () => void;
  
  // UI state
  viewMode: GalleryViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  closeBothSidebars: () => void;
  toggleFullView: (side: 'left' | 'right') => void;
  toggleServerPanel: () => void;
  
  // Filters
  leftFilter: MediaFilter;
  rightFilter: MediaFilter;
  setLeftFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  setRightFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  
  // Dialog state
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  serverPanelOpen: boolean;
  setServerPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Actions
  handleRefresh: () => void;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  handleDelete: () => void;
  handleDownloadMedia: (id: string, position: 'source' | 'destination') => Promise<void>;
  handleDownloadSelected: (ids: string[], position: 'source' | 'destination') => Promise<void>;
  deleteMutation: ReturnType<typeof useMutation>;
  
  // Utilities
  isMobile: boolean;
  getViewModeType: (side: 'left' | 'right') => ViewModeType;
}
