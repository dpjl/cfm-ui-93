
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/use-language';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { Columns, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GalleryViewMode } from '@/types/gallery';

interface ColumnSliderProps {
  position: 'left' | 'right';
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  viewType: 'desktop' | 'desktop-single' | 'mobile-split' | 'mobile-single';
  currentMobileViewMode?: GalleryViewMode;
}

const ColumnSlider: React.FC<ColumnSliderProps> = ({
  position,
  value,
  onChange,
  min = 1,
  max = 8,
  step = 1,
  label,
  viewType,
  currentMobileViewMode
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Determine if this slider should be visible based on current view mode
  const isVisible = () => {
    // On desktop device
    if (!isMobile) {
      // On desktop, only show desktop-related sliders and hide mobile ones
      if (viewType.startsWith('mobile')) return false;
      
      // For desktop split view slider
      if (viewType === 'desktop') {
        return currentMobileViewMode === 'both';
      }
      
      // For desktop single/full view slider
      if (viewType === 'desktop-single') {
        return currentMobileViewMode !== 'both';
      }
      
      return true;
    }
    
    // On mobile device
    else {
      // On mobile, only show mobile-related sliders and hide desktop ones
      if (viewType.startsWith('desktop')) return false;
      
      // For mobile split view slider
      if (viewType === 'mobile-split') {
        return currentMobileViewMode === 'both';
      }
      
      // For mobile single/full view slider
      if (viewType === 'mobile-single') {
        return currentMobileViewMode === position || currentMobileViewMode !== 'both';
      }
      
      return true;
    }
  };

  // Don't render anything if this slider shouldn't be visible
  if (!isVisible()) return null;

  // Get appropriate icon based on view type
  const getIcon = () => {
    if (viewType.startsWith('desktop')) return <Monitor className="h-3 w-3" />;
    if (viewType === 'mobile-split') return <Smartphone className="h-3 w-3" />;
    return <Columns className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {getIcon()}
          <span>{label || t('columns')}: {value}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />
    </div>
  );
};

export default ColumnSlider;
