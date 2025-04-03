
/**
 * Utilitaires pour la synchronisation des mois entre galeries
 */

/**
 * Convertit un format "année-mois" en objet { year, month }
 */
export function parseYearMonth(yearMonth: string): { year: number; month: number } | null {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  
  if (isNaN(year) || isNaN(month)) {
    return null;
  }
  
  return { year, month };
}

/**
 * Formate un objet { year, month } en chaîne "année-mois"
 */
export function formatYearMonth(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`;
}

/**
 * Calcule la hauteur estimée d'un groupe de médias en pixels
 */
export function calculateMonthHeight(
  itemCount: number, 
  columnsCount: number, 
  itemHeight: number
): number {
  const rowsCount = Math.ceil(itemCount / columnsCount);
  return rowsCount * itemHeight;
}

/**
 * Trouve le mois précédent ou suivant dans une liste triée de mois
 */
export function findAdjacentMonth(
  yearMonths: string[], 
  currentYearMonth: string, 
  direction: 'prev' | 'next'
): string | null {
  const currentIndex = yearMonths.indexOf(currentYearMonth);
  if (currentIndex === -1) return null;
  
  const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
  
  if (targetIndex >= 0 && targetIndex < yearMonths.length) {
    return yearMonths[targetIndex];
  }
  
  return null;
}

/**
 * Calcule le pourcentage de progression dans un mois basé sur la position de défilement
 */
export function calculateMonthProgress(
  scrollTop: number,
  monthStartPosition: number,
  monthHeight: number
): number {
  if (monthHeight <= 0) return 0;
  
  const positionInMonth = scrollTop - monthStartPosition;
  const progress = positionInMonth / monthHeight;
  
  return Math.min(Math.max(0, progress), 1);
}
