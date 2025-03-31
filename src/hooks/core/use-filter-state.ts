
import { useState } from 'react';
import { MediaFilter } from '@/components/AppSidebar';

/**
 * Hook de base pour gérer l'état des filtres de médias
 */
export function useFilterState(initialLeftFilter: MediaFilter = 'all', initialRightFilter: MediaFilter = 'all') {
  const [leftFilter, setLeftFilter] = useState<MediaFilter>(initialLeftFilter);
  const [rightFilter, setRightFilter] = useState<MediaFilter>(initialRightFilter);
  
  return {
    leftFilter,
    setLeftFilter,
    rightFilter,
    setRightFilter
  };
}
