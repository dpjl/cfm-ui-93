
import React from 'react';
import ColumnSlider from '@/components/sidebar/ColumnSlider';
import { useLanguage } from '@/hooks/use-language';
import { MobileViewMode } from '@/types/gallery';

interface ColumnSlidersProps {
  position: 'left' | 'right';
  columnValues: {
    [key: string]: number;
  };
  mobileViewMode: MobileViewMode;
  onColumnsChange?: (count: number) => void;
  currentViewMode?: string;
}

const ColumnSliders: React.FC<ColumnSlidersProps> = ({
  position,
  columnValues,
  mobileViewMode,
  onColumnsChange,
  currentViewMode
}) => {
  const { t } = useLanguage();
  
  // Les valeurs sont maintenant entièrement contrôlées par le parent
  const handleChange = (count: number) => {
    if (onColumnsChange) {
      onColumnsChange(count);
    }
  };

  // Récupérer les valeurs de colonne directement depuis les props
  const desktopColumns = columnValues['desktop'] || 5;
  const desktopSingleColumns = columnValues['desktop-single'] || 6;
  const mobileSplitColumns = columnValues['mobile-split'] || 2;
  const mobileSingleColumns = columnValues['mobile-single'] || 4;

  return (
    <div className="space-y-2">
      <ColumnSlider 
        position={position}
        value={desktopColumns}
        onChange={handleChange}
        min={2}
        max={10}
        label={t('desktop_columns')}
        viewType="desktop"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={desktopSingleColumns}
        onChange={handleChange}
        min={2}
        max={10}
        label={t('desktop_single_columns')}
        viewType="desktop-single"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={mobileSplitColumns}
        onChange={handleChange}
        min={1}
        max={4}
        label={t('split_columns')}
        viewType="mobile-split"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={mobileSingleColumns}
        onChange={handleChange}
        min={2}
        max={6}
        label={t('single_columns')}
        viewType="mobile-single"
        currentMobileViewMode={mobileViewMode}
      />
    </div>
  );
};

export default ColumnSliders;
