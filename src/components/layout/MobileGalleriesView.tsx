
import React from 'react';
import { MobileViewMode } from '@/types/gallery';

interface MobileGalleriesViewProps {
  // Propriétés de vue
  mobileViewMode: MobileViewMode;
  
  // Contenu des galeries
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const MobileGalleriesView: React.FC<MobileGalleriesViewProps> = ({
  mobileViewMode,
  leftContent,
  rightContent
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Left Gallery (Source) */}
      {(mobileViewMode === 'left' || mobileViewMode === 'both') && (
        <div className={`transition-all duration-300 h-full ${
          mobileViewMode === 'both' ? 'w-1/2 float-left' : 'w-full'
        }`}>
          {leftContent}
        </div>
      )}
      
      {/* Right Gallery (Destination) */}
      {(mobileViewMode === 'right' || mobileViewMode === 'both') && (
        <div className={`transition-all duration-300 h-full ${
          mobileViewMode === 'both' ? 'w-1/2 float-right' : 'w-full'
        }`}>
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default MobileGalleriesView;
