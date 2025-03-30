
import React, { useEffect } from 'react';
import ColumnSlider from '@/components/sidebar/ColumnSlider';
import { useLanguage } from '@/hooks/use-language';
import { MobileViewMode } from '@/types/gallery';

interface ColumnSlidersProps {
  position: 'left' | 'right';
  columnSettings: {
    desktopColumns: number;
    desktopSingleColumns: number;
    mobileSplitColumns: number;
    mobileSingleColumns: number;
    updateDesktopColumns: (value: number) => void;
    updateDesktopSingleColumns: (value: number) => void;
    updateMobileSplitColumns: (value: number) => void;
    updateMobileSingleColumns: (value: number) => void;
    getColumnCount: (viewMode: string) => number;
    updateColumnCount: (viewMode: string, value: number) => void;
  };
  mobileViewMode: MobileViewMode;
  onColumnsChange?: (viewMode: string, count: number) => void;
  columnsState?: {
    [key: string]: number;
  };
}

const ColumnSliders: React.FC<ColumnSlidersProps> = ({
  position,
  columnSettings,
  mobileViewMode,
  onColumnsChange,
  columnsState = {}
}) => {
  const { t } = useLanguage();

  // Handle changes to columns and immediately update parent
  const handleColumnsChange = (viewMode: string, count: number) => {
    // Mettre à jour localement
    columnSettings.updateColumnCount(viewMode, count);
    
    // Propager le changement au parent si nécessaire
    if (onColumnsChange) {
      console.log(`Column change: ${position} ${viewMode} to ${count}`);
      onColumnsChange(viewMode, count);
    }
  };

  // Effet pour synchroniser les valeurs externes avec les curseurs locaux
  useEffect(() => {
    if (!columnsState || Object.keys(columnsState).length === 0) return;
    
    // Pour chaque mode de vue, vérifier si nous avons une valeur externe
    const modes = ['desktop', 'desktop-single', 'mobile-split', 'mobile-single'];
    modes.forEach(mode => {
      if (columnsState[mode] !== undefined) {
        const externalValue = columnsState[mode];
        const currentValue = columnSettings.getColumnCount(mode);
        
        // Si les valeurs sont différentes, mettre à jour localement
        if (externalValue !== currentValue) {
          console.log(`Syncing slider for ${position} ${mode} from ${currentValue} to ${externalValue}`);
          columnSettings.updateColumnCount(mode, externalValue);
        }
      }
    });
  }, [columnsState, position, columnSettings]);

  return (
    <div className="space-y-2">
      <ColumnSlider 
        position={position}
        value={columnSettings.desktopColumns}
        onChange={(value) => {
          handleColumnsChange('desktop', value);
        }}
        min={2}
        max={10}
        label={t('desktop_columns')}
        viewType="desktop"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={columnSettings.desktopSingleColumns}
        onChange={(value) => {
          handleColumnsChange('desktop-single', value);
        }}
        min={2}
        max={10}
        label={t('desktop_single_columns')}
        viewType="desktop-single"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={columnSettings.mobileSplitColumns}
        onChange={(value) => {
          handleColumnsChange('mobile-split', value);
        }}
        min={1}
        max={4}
        label={t('split_columns')}
        viewType="mobile-split"
        currentMobileViewMode={mobileViewMode}
      />
      
      <ColumnSlider 
        position={position}
        value={columnSettings.mobileSingleColumns}
        onChange={(value) => {
          handleColumnsChange('mobile-single', value);
        }}
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
