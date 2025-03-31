
import React from 'react';
import { MobileViewMode } from '@/types/gallery';
import { useGalleryLayout } from '@/hooks/use-gallery-layout';

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
  const { getGalleryClasses } = useGalleryLayout(mobileViewMode);
  
  return (
    <div className="flex-1 overflow-hidden">
      {/* Left Gallery - always in DOM but visibility controlled by CSS */}
      <div className={getGalleryClasses('left')}>
        {leftContent}
      </div>
      
      {/* Right Gallery - always in DOM but visibility controlled by CSS */}
      <div className={getGalleryClasses('right')}>
        {rightContent}
      </div>
    </div>
  );
};

export default MobileGalleriesView;
