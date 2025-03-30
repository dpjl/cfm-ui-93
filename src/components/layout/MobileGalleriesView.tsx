
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
  // Déterminer la classe CSS en fonction du mode de vue
  const containerClassName = `mobile-gallery-container mobile-view-${mobileViewMode}`;
  
  return (
    <div className={containerClassName}>
      {/* Les deux galeries sont toujours rendues, mais leur visibilité est contrôlée par CSS */}
      <div className="mobile-gallery mobile-gallery-left">
        {leftContent}
      </div>
      
      <div className="mobile-gallery mobile-gallery-right">
        {rightContent}
      </div>
    </div>
  );
};

export default MobileGalleriesView;
