
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Calendar, CalendarOff, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GallerySelectionBarProps {
  selectedIds: string[];
  mediaIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  showDates: boolean;
  onToggleDates: () => void;
  viewMode?: 'single' | 'split';
}

const GallerySelectionBar: React.FC<GallerySelectionBarProps> = ({
  selectedIds,
  mediaIds,
  onSelectAll,
  onDeselectAll,
  showDates,
  onToggleDates,
  viewMode = 'single'
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const isCompactMode = isMobile && viewMode === 'split';
  
  // Vérifier si le bouton "sélectionner tout" doit être désactivé
  const isTooManyItems = mediaIds.length > 100;
  
  return (
    <div className="flex items-center justify-between w-full bg-background/90 backdrop-blur-sm py-1.5 px-3 rounded-md z-10 shadow-sm border border-border/30">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div> {/* Wrapper pour permettre au Tooltip de fonctionner avec un bouton désactivé */}
                <Button
                  onClick={onSelectAll}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isTooManyItems}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isTooManyItems ? (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <p>{t('too_many_items_to_select')}</p>
                </div>
              ) : (
                <p>{t('select_all')}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onDeselectAll}
                variant="outline"
                size="icon"
                className="h-7 w-7"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{t('deselect_all')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleDates}
                variant={showDates ? "default" : "outline"}
                size="icon"
                className="h-7 w-7"
              >
                {showDates ? (
                  <Calendar className="h-3.5 w-3.5" />
                ) : (
                  <CalendarOff className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{showDates ? t('hide_dates') : t('show_dates')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className={`text-xs text-muted-foreground`}>
        {selectedIds.length}/{mediaIds.length} {!isCompactMode && t('selected')}
      </div>
    </div>
  );
};

export default GallerySelectionBar;
