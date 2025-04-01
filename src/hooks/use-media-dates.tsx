
import { useState, useMemo } from 'react';

export interface MediaDateResponse {
  ids: string[];
  dates: string[];
}

export function useMediaDates(mediaResponse?: MediaDateResponse) {
  // Maps pour l'indexation
  const [idToDateMap, setIdToDateMap] = useState<Map<string, string>>(new Map());
  const [dateToIdsMap, setDateToIdsMap] = useState<Map<string, string[]>>(new Map());
  const [yearMonthToIdsMap, setYearMonthToIdsMap] = useState<Map<string, string[]>>(new Map());
  const [years, setYears] = useState<string[]>([]);
  const [yearMonths, setYearMonths] = useState<string[]>([]);

  // Traitement des données à la réception
  useMemo(() => {
    if (!mediaResponse?.ids || !mediaResponse?.dates) return;

    const newIdToDateMap = new Map<string, string>();
    const newDateToIdsMap = new Map<string, string[]>();
    const newYearMonthToIdsMap = new Map<string, string[]>();
    const uniqueYears = new Set<string>();
    const uniqueYearMonths = new Set<string>();
    
    mediaResponse.ids.forEach((id, index) => {
      const date = mediaResponse.dates[index];
      if (!date) return;
      
      // ID → Date
      newIdToDateMap.set(id, date);
      
      // Date → IDs
      if (!newDateToIdsMap.has(date)) {
        newDateToIdsMap.set(date, []);
      }
      newDateToIdsMap.get(date)?.push(id);
      
      // Année-Mois → IDs
      const yearMonth = date.substring(0, 7); // "YYYY-MM"
      if (!newYearMonthToIdsMap.has(yearMonth)) {
        newYearMonthToIdsMap.set(yearMonth, []);
      }
      newYearMonthToIdsMap.get(yearMonth)?.push(id);
      
      // Collecte des années et mois uniques pour le sélecteur
      const year = date.substring(0, 4);
      uniqueYears.add(year);
      uniqueYearMonths.add(yearMonth);
    });
    
    setIdToDateMap(newIdToDateMap);
    setDateToIdsMap(newDateToIdsMap);
    setYearMonthToIdsMap(newYearMonthToIdsMap);
    
    // Trier les années et les mois par ordre décroissant (plus récent en premier)
    setYears(Array.from(uniqueYears).sort((a, b) => b.localeCompare(a)));
    setYearMonths(Array.from(uniqueYearMonths).sort((a, b) => b.localeCompare(a)));
  }, [mediaResponse]);

  return {
    idToDateMap,
    dateToIdsMap,
    yearMonthToIdsMap,
    years,
    yearMonths,
  };
}
