
import React from 'react';
import { motion } from 'framer-motion';
import GalleryContainer from '@/components/GalleryContainer';
import { Separator } from '@/components/ui/separator';
import { MobileViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';

// Define container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

// Définir les props du composant
interface DesktopGalleriesViewProps {
  // Propriétés des colonnes
  columnsCountLeft: number;
  columnsCountRight: number;
  
  // Propriétés des répertoires
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  
  // Propriétés de sélection
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Propriétés de suppression
  handleDeleteSelected: (side: 'left' | 'right') => void;
  deleteDialogOpen: boolean;
  activeSide: 'left' | 'right';
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteMutation: any;
  
  // Propriétés de filtre
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
  
  // Propriétés de vue
  viewMode?: MobileViewMode;
  mobileViewMode?: MobileViewMode;
  
  // Propriétés de panneau latéral
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;

  // Contenu des galeries
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const DesktopGalleriesView: React.FC<DesktopGalleriesViewProps> = ({
  columnsCountLeft,
  columnsCountRight,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  handleDeleteSelected,
  deleteDialogOpen,
  activeSide,
  setDeleteDialogOpen,
  deleteMutation,
  leftFilter = 'all',
  rightFilter = 'all',
  viewMode = 'both',
  mobileViewMode,
  onToggleLeftPanel,
  onToggleRightPanel,
  leftContent,
  rightContent
}) => {
  // Use mobileViewMode if provided, otherwise fall back to viewMode
  const activeViewMode: MobileViewMode = mobileViewMode || viewMode;

  return (
    <div className="flex-1 overflow-hidden bg-background/50 backdrop-blur-sm rounded-lg border-2 border-border/40 shadow-sm relative">
      <div className="flex h-full">
        {/* Left Gallery */}
        <div className={`overflow-hidden transition-all duration-300 ${
          activeViewMode === 'both' ? 'w-1/2' : 
          activeViewMode === 'left' ? 'w-full' : 'w-0'
        }`}>
          {(activeViewMode === 'both' || activeViewMode === 'left') && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              {leftContent}
            </motion.div>
          )}
        </div>

        {/* Gallery Separator - only shown in split view */}
        {activeViewMode === 'both' && (
          <Separator orientation="vertical" className="bg-border/60" />
        )}

        {/* Right Gallery */}
        <div className={`overflow-hidden transition-all duration-300 ${
          activeViewMode === 'both' ? 'w-1/2' : 
          activeViewMode === 'right' ? 'w-full' : 'w-0'
        }`}>
          {(activeViewMode === 'both' || activeViewMode === 'right') && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              {rightContent}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopGalleriesView;
