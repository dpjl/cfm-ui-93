
/**
 * Utilitaires simplifiés pour les calculs de grille de galerie
 */

/**
 * Calcule la largeur d'un élément en fonction de la largeur du conteneur, du nombre de colonnes et de l'espacement
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Calculer la largeur totale des espaces
  const totalGapWidth = gap * (columnsCount - 1);
  // Calculer la largeur des éléments en divisant l'espace restant
  return Math.floor((containerWidth - totalGapWidth) / columnsCount);
}

/**
 * Calcule la hauteur d'un élément en fonction de sa largeur et de l'affichage des dates
 */
export function calculateItemHeight(itemWidth: number, showDates: boolean = false): number {
  return itemWidth + (showDates ? 40 : 0);
}

/**
 * Calcule le nombre de lignes nécessaires en fonction du nombre d'éléments et de colonnes
 */
export function calculateRowCount(itemCount: number, columnsCount: number): number {
  return Math.ceil(itemCount / columnsCount);
}

/**
 * Calcule l'index d'un élément à partir des indices de ligne et de colonne
 */
export function calculateItemIndex(rowIndex: number, columnIndex: number, columnsCount: number): number {
  return rowIndex * columnsCount + columnIndex;
}

/**
 * Vérifie si un élément existe à un index donné
 */
export function itemExistsAtIndex(rowIndex: number, columnIndex: number, columnsCount: number, totalItems: number): boolean {
  const index = calculateItemIndex(rowIndex, columnIndex, columnsCount);
  return index < totalItems;
}

/**
 * Calcule le style de cellule avec les ajustements d'espacement appropriés
 */
export function calculateCellStyle(
  originalStyle: React.CSSProperties,
  gap: number
): React.CSSProperties {
  return {
    ...originalStyle,
    width: `${parseFloat(originalStyle.width as string) - gap}px`,
    height: `${parseFloat(originalStyle.height as string) - gap}px`,
    padding: 0,
  };
}
