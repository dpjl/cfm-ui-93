import { GalleryViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';

// Base gallery props that are common to most gallery components
export interface BaseGalleryProps {
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  columnsCountLeft: number;
  columnsCountRight: number;
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  deleteDialogOpen: boolean;
  activeSide: 'left' | 'right';
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteMutation: any;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
}

// Props specific to mobile/desktop view mode handling
export interface ViewModeProps {
  mobileViewMode?: GalleryViewMode; // Optional for backward compatibility
  setMobileViewMode?: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  viewMode?: GalleryViewMode; // Used for consistency in some components
}

// Props for sidebar toggle functionality
export interface SidebarToggleProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}
