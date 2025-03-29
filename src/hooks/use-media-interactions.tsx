
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseMediaInteractionsProps {
  id: string;
  onSelect: (id: string, extendSelection: boolean) => void;
}

/**
 * Hook unifié qui gère tous les types d'interactions utilisateur pour les éléments médias
 * (tactile, clavier, souris)
 */
export function useMediaInteractions({ id, onSelect }: UseMediaInteractionsProps) {
  // État pour les interactions tactiles
  const [touchStartPoint, setTouchStartPoint] = useState<{x: number, y: number} | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const touchMoveCount = useRef(0);
  const verticalMoveDistance = useRef(0);
  
  // Nettoyage du timer
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [id, longPressTimer]);
  
  // Gestionnaire de clic souris
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Gestionnaire d'appui sur les touches
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
  }, [id, onSelect]);
  
  // Gestionnaire de début de toucher
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Enregistrer le point de départ
    const touch = e.touches[0];
    setTouchStartPoint({x: touch.clientX, y: touch.clientY});
    touchMoveCount.current = 0;
    verticalMoveDistance.current = 0;
    
    // Démarrer le timer d'appui long
    const timer = setTimeout(() => {
      // Si l'utilisateur n'a pas beaucoup bougé, considérer comme un appui long
      if (touchMoveCount.current < 10) {
        // Simuler Ctrl+clic pour la multi-sélection
        onSelect(id, true);
        
        // Retour haptique sur les appareils compatibles
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms pour un appui long
    
    setLongPressTimer(timer);
  }, [id, onSelect]);
  
  // Gestionnaire de mouvement de toucher
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPoint) return;
    
    // Obtenir la position actuelle
    const touch = e.touches[0];
    const currentY = touch.clientY;
    
    // Calculer la distance de mouvement vertical
    const yDiff = Math.abs(currentY - touchStartPoint.y);
    verticalMoveDistance.current = yDiff;
    
    // Incrémenter le compteur de mouvements
    touchMoveCount.current += 1;
    
    // Annuler l'appui long si l'utilisateur bouge trop
    if ((touchMoveCount.current > 10 || yDiff > 20) && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer, touchStartPoint]);
  
  // Gestionnaire de fin de toucher
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Annuler le timer à la fin du toucher
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Traiter comme un tap uniquement si mouvement minimal ET distance de défilement vertical minimale
    if (touchMoveCount.current < 10 && verticalMoveDistance.current < 15) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, false);
    }
    
    // Réinitialiser pour la prochaine interaction
    setTouchStartPoint(null);
    verticalMoveDistance.current = 0;
  }, [longPressTimer, id, onSelect]);
  
  return {
    handleClick,
    handleKeyDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
