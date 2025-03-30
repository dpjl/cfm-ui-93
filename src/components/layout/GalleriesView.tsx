
import React from 'react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { MobileViewMode } from '@/types/gallery';

// Variants d'animation pour les conteneurs
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

interface GalleriesViewProps {
  // Propriétés de vue
  viewMode: MobileViewMode;
  
  // Contenu des galeries
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const GalleriesView: React.FC<GalleriesViewProps> = ({
  viewMode,
  leftContent,
  rightContent
}) => {
  // Les deux galeries restent montées dans le DOM, mais peuvent être masquées visuellement
  return (
    <div className="flex-1 overflow-hidden bg-background/50 backdrop-blur-sm rounded-lg border-2 border-border/40 shadow-sm relative">
      <div className="flex h-full">
        {/* Left Gallery - always mounted but visibility controlled by classes */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${viewMode === 'both' ? 'w-1/2' : viewMode === 'left' ? 'w-full' : 'w-0'}
          `}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={viewMode === 'both' || viewMode === 'left' ? "visible" : "hidden"}
            className="h-full"
            // Permet aux événements de souris de passer à travers quand invisible
            style={{
              pointerEvents: viewMode === 'both' || viewMode === 'left' ? 'auto' : 'none'
            }}
          >
            {leftContent}
          </motion.div>
        </div>

        {/* Gallery Separator - only visible in split view */}
        {viewMode === 'both' && (
          <Separator orientation="vertical" className="bg-border/60" />
        )}

        {/* Right Gallery - always mounted but visibility controlled by classes */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${viewMode === 'both' ? 'w-1/2' : viewMode === 'right' ? 'w-full' : 'w-0'}
          `}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={viewMode === 'both' || viewMode === 'right' ? "visible" : "hidden"}
            className="h-full"
            // Permet aux événements de souris de passer à travers quand invisible
            style={{
              pointerEvents: viewMode === 'both' || viewMode === 'right' ? 'auto' : 'none'
            }}
          >
            {rightContent}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GalleriesView;
