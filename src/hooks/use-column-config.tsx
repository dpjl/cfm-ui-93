import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { GalleryViewMode } from '@/types/gallery';

export type ColumnConfigKey = 
  | 'desktop-left' 
  | 'desktop-right' 
  | 'mobile-split-left' 
  | 'mobile-split-right' 
  | 'mobile-single-left' 
  | 'mobile-single-right';

// Default values
const DEFAULT_CONFIG = {
  'desktop-left': 5,
  'desktop-right': 5,
  'mobile-split-left': 2,
  'mobile-split-right': 2,
  'mobile-single-left': 4,
  'mobile-single-right': 4
};

export type ColumnConfig = typeof DEFAULT_CONFIG;

export function useColumnConfig() {
  const [config, setConfig] = useState<ColumnConfig>(DEFAULT_CONFIG);
  const isMobile = useIsMobile();
  
  // Load saved configuration from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('gallery-column-config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading column config:', error);
      // Fall back to defaults
      setConfig(DEFAULT_CONFIG);
    }
  }, []);
  
  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('gallery-column-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving column config:', error);
    }
  }, [config]);
  
  // Helper function to update a specific configuration
  const updateConfig = (key: ColumnConfigKey, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };
  
  // Helper function to get the current column count
  const getCurrentColumnCount = (position: 'left' | 'right', mobileViewMode: GalleryViewMode): number => {
    if (isMobile) {
      if (mobileViewMode === 'both') {
        return config[`mobile-split-${position}`];
      } else {
        return config[`mobile-single-${position}`];
      }
    } else {
      return config[`desktop-${position}`];
    }
  };
  
  return {
    config,
    updateConfig,
    getCurrentColumnCount
  };
}
