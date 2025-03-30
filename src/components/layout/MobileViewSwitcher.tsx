
import React from 'react';
import { MobileViewMode } from '@/types/gallery';

interface MobileViewSwitcherProps {
  viewMode: MobileViewMode;
  setViewMode: (mode: MobileViewMode) => void;
  className?: string;
}

// Ce composant est maintenant vide car nous utilisons les boutons dans les barres d'outils des galeries
const MobileViewSwitcher: React.FC<MobileViewSwitcherProps> = () => {
  return null;
};

export default MobileViewSwitcher;
