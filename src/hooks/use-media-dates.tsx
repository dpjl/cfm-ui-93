
import { useState, useCallback, useMemo } from 'react';
import { MediaListResponse } from '@/types/gallery';

interface MediaDateIndex {
  // Maps ID to date
  idToDate: Map<string, string>;
  // Maps year-month to first index in the array
  yearMonthToIndex: Map<string, number>;
  // Available years in descending order
  years: number[];
  // Available months for each year
  monthsByYear: Map<number, number[]>;
}

export function useMediaDates(mediaListResponse?: MediaListResponse) {
  const [currentYearMonth, setCurrentYearMonth] = useState<string | null>(null);

  // Construire les index à partir des données reçues
  const dateIndex = useMemo(() => {
    if (!mediaListResponse?.mediaIds || !mediaListResponse?.mediaDates) {
      return {
        idToDate: new Map(),
        yearMonthToIndex: new Map(),
        years: [],
        monthsByYear: new Map()
      };
    }

    const { mediaIds, mediaDates } = mediaListResponse;
    const idToDate = new Map<string, string>();
    const yearMonthToIndex = new Map<string, number>();
    const yearMonthSet = new Set<string>();
    const yearSet = new Set<number>();
    const monthsByYear = new Map<number, Set<number>>();

    // Construire les maps et sets
    for (let i = 0; i < mediaIds.length; i++) {
      const id = mediaIds[i];
      const date = mediaDates[i];
      
      if (date) {
        // Mettre en correspondance ID et date
        idToDate.set(id, date);
        
        // Extraire année et mois
        const [year, month] = date.split('-').map(Number);
        
        if (!isNaN(year) && !isNaN(month)) {
          const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
          
          // Enregistrer la première occurrence de cette année-mois
          if (!yearMonthToIndex.has(yearMonth)) {
            yearMonthToIndex.set(yearMonth, i);
          }
          
          // Mémoriser l'année-mois
          yearMonthSet.add(yearMonth);
          
          // Mémoriser l'année
          yearSet.add(year);
          
          // Mémoriser le mois pour cette année
          if (!monthsByYear.has(year)) {
            monthsByYear.set(year, new Set<number>());
          }
          monthsByYear.get(year)?.add(month);
        }
      }
    }

    // Convertir les sets en arrays triés
    const years = Array.from(yearSet).sort((a, b) => b - a); // Tri descendant
    
    const monthsByYearMap = new Map<number, number[]>();
    monthsByYear.forEach((months, year) => {
      monthsByYearMap.set(year, Array.from(months).sort((a, b) => a - b));
    });

    return {
      idToDate,
      yearMonthToIndex,
      years,
      monthsByYear: monthsByYearMap
    };
  }, [mediaListResponse]);

  // Fonctions pour la navigation par date
  const scrollToYearMonth = useCallback((year: number, month: number, gridRef: React.RefObject<any>) => {
    const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
    const index = dateIndex.yearMonthToIndex.get(yearMonth);
    
    if (index !== undefined && gridRef.current) {
      gridRef.current.scrollToItem({
        align: 'start',
        rowIndex: Math.floor(index / gridRef.current.props.columnCount)
      });
      setCurrentYearMonth(yearMonth);
      return true;
    }
    return false;
  }, [dateIndex]);

  const getDateForId = useCallback((id: string): string | undefined => {
    return dateIndex.idToDate.get(id);
  }, [dateIndex]);

  return {
    dateIndex,
    currentYearMonth,
    scrollToYearMonth,
    getDateForId,
    setCurrentYearMonth
  };
}
