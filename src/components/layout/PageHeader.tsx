
import React from 'react';
import { Button } from '@/components/ui/button';
import { Server, PanelLeft, PanelsLeftRight, PanelRight } from 'lucide-react';
import { GalleryViewMode } from '@/types/gallery';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTheme } from '@/hooks/use-theme';

interface PageHeaderProps {
  onRefresh: () => void;
  isDeletionPending: boolean;
  isSidebarOpen: boolean;
  onCloseSidebars: () => void;
  mobileViewMode: GalleryViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  selectedIdsLeft: string[];
  selectedIdsRight: string[];
  onDelete: () => void;
  onToggleServerPanel: () => void;
  isServerPanelOpen: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  onToggleServerPanel,
  isServerPanelOpen,
  mobileViewMode,
  setMobileViewMode,
}) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  return (
    <header className="relative z-20 flex items-center justify-between gap-2 p-2 md:p-4 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center gap-3">
        <div>
          <img 
            src="/lovable-uploads/logo-cfm.svg" 
            alt="Logo" 
            className={`h-8 md:h-10 w-auto ${theme === 'light' ? 'filter invert(100%) brightness(1.2) contrast(1.1)' : ''}`}
            style={{ maxHeight: '2.5rem', width: 'auto' }}
          />
        </div>
        
        {/* Desktop view mode switcher */}
        {!isMobile && (
          <div className="ml-4 flex gap-2 bg-background/90 shadow-sm border border-border/30 rounded-full p-1">
            <Button
              variant={mobileViewMode === 'left' ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileViewMode('left')}
              className="h-7 w-7 rounded-full"
              title="Source Gallery Only"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant={mobileViewMode === 'both' ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileViewMode('both')}
              className="h-7 w-7 rounded-full"
              title="Split View"
            >
              <PanelsLeftRight className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant={mobileViewMode === 'right' ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileViewMode('right')}
              className="h-7 w-7 rounded-full"
              title="Destination Gallery Only"
            >
              <PanelRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
        
        <Button
          onClick={onToggleServerPanel}
          variant={isServerPanelOpen ? "default" : "outline"}
          size={isMobile ? "icon" : "default"}
          className="relative"
        >
          {isMobile ? (
            <Server className="h-4 w-4" />
          ) : (
            <>
              <Server className="h-4 w-4 mr-2" />
              <span>Serveur</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default PageHeader;
