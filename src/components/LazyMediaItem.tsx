
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getThumbnailUrl } from '@/api/imageApi';
import { motion } from 'framer-motion';
import MediaItemRenderer from './media/MediaItemRenderer';
import DateDisplay from './media/DateDisplay';
import SelectionCheckbox from './media/SelectionCheckbox';
import { useMediaCache } from '@/hooks/use-media-cache';

interface LazyMediaItemProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, extendSelection: boolean) => void;
  index: number;
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: any) => void;
  position: 'source' | 'destination';
}

// Utilisation de memo pour éviter les re-rendus inutiles
const LazyMediaItem = memo(({
  id,
  selected,
  onSelect,
  index,
  showDates = false,
  updateMediaInfo,
  position
}: LazyMediaItemProps) => {
  const [loaded, setLoaded] = useState(false);
  const [touchStartPoint, setTouchStartPoint] = useState<{x: number, y: number} | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const touchMoveCount = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    freezeOnceVisible: true 
  });
  
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  // Ne charger les infos du média que lorsque l'élément est visible
  const shouldLoadInfo = isIntersecting;
  
  // Charger les infos du média une fois que l'élément est visible
  const { mediaInfo, isLoading } = useMediaInfo(id, shouldLoadInfo, position);
  
  // Nettoyer le timer quand le composant est démonté ou quand l'id change
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [id, longPressTimer]);
  
  // Charger l'URL de la vignette, en utilisant le cache si disponible
  useEffect(() => {
    if (isIntersecting) {
      const cachedUrl = getCachedThumbnailUrl(id, position);
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
        return;
      }
      
      const url = getThumbnailUrl(id, position);
      setThumbnailUrl(url);
      setCachedThumbnailUrl(id, position, url);
    }
  }, [id, isIntersecting, position, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  // Mettre à jour le composant parent avec les infos du média - MAIS UNE SEULE FOIS
  useEffect(() => {
    if (mediaInfo && updateMediaInfo) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo]);
  
  // Déterminer s'il s'agit d'une vidéo en fonction de l'extension du fichier
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Optimisation de la gestion des clics avec useCallback
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Nouvelle implémentation pour le tactile mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Stocker le point de départ du toucher
    const touch = e.touches[0];
    setTouchStartPoint({x: touch.clientX, y: touch.clientY});
    touchMoveCount.current = 0;
    
    // Démarrer le timer pour détecter un appui long
    const timer = setTimeout(() => {
      // Si l'utilisateur n'a pas trop bougé le doigt, considérer comme un appui long
      if (touchMoveCount.current < 10) {
        // Simuler un "Ctrl+click" pour la sélection multiple
        onSelect(id, true);
        
        // Retour haptique sur les appareils qui le supportent
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms est un bon délai pour un appui long
    
    setLongPressTimer(timer);
  }, [id, onSelect]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Incrémenter le compteur de mouvements
    touchMoveCount.current += 1;
    
    // Si l'utilisateur bouge trop, annuler le timer d'appui long
    if (touchMoveCount.current > 10 && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Annuler le timer si l'utilisateur relâche avant la fin
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Vérifier si c'était un tap simple (pas beaucoup de mouvement)
    if (touchMoveCount.current < 10) {
      // C'était un tap simple, traiter comme un clic normal
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, false);
    }
    
    // Réinitialiser l'état pour le prochain toucher
    setTouchStartPoint(null);
  }, [longPressTimer, id, onSelect]);
  
  // Gérer le clavier pour l'accessibilité
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
  }, [id, onSelect]);
  
  // Référence combinée pour l'intersection observer et notre propre ref
  const setCombinedRef = useCallback((node: HTMLDivElement | null) => {
    // Définir la ref d'intersection
    if (typeof elementRef === 'function') {
      elementRef(node);
    } else if (elementRef) {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    
    // Définir notre propre ref
    itemRef.current = node;
  }, [elementRef]);
  
  // Ne rendre qu'un simple placeholder quand l'élément n'est pas dans la vue
  if (!isIntersecting) {
    return (
      <div 
        ref={setCombinedRef} 
        className="aspect-square bg-muted/30 rounded-lg"
        role="img"
        aria-label="Loading media item"
      ></div>
    );
  }
  
  return (
    <div
      ref={setCombinedRef}
      className={cn(
        "image-card group relative", 
        "aspect-square cursor-pointer", 
        selected && "selected",
      )}
      onClick={handleItemClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      aria-label={`Media item ${mediaInfo?.alt || id}`}
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-media-id={id}
      data-selection-state={selected ? 'selected' : 'unselected'}
    >
      {thumbnailUrl && (
        <>
          <MediaItemRenderer
            src={thumbnailUrl}
            alt={mediaInfo?.alt || id}
            isVideo={Boolean(isVideo)}
            onLoad={() => setLoaded(true)}
            loaded={loaded}
          />

          <DateDisplay dateString={mediaInfo?.createdAt} showDate={showDates} />

          <div className="image-overlay pointer-events-none" />
          <SelectionCheckbox
            selected={selected}
            onSelect={(e) => {
              e.stopPropagation();
              onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
            }}
            loaded={loaded}
            mediaId={id}
          />
        </>
      )}
    </div>
  );
});

// Définir un nom d'affichage pour le débogage
LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
