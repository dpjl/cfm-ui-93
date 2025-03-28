
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  root = null,
  rootMargin = '300px 0px',  // Augmenté pour charger plus tôt
  threshold = 0,
  freezeOnceVisible = false,
  triggerOnce = false,
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const cleanup = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return cleanup;
    
    // Créer un nouvel observer avec des paramètres optimisés
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;
        
        // Réduire les changements d'état inutiles
        if (isVisible !== isIntersecting) {
          setIsIntersecting(isVisible);
          
          if (isVisible) {
            setHasBeenVisible(true);
            
            // Se déconnecter après la première visibilité si triggerOnce
            if (triggerOnce) {
              cleanup();
            }
          }
        }
      },
      { root, rootMargin, threshold }
    );
    
    // Observer immédiatement
    observerRef.current.observe(element);
    
    return cleanup;
  }, [root, rootMargin, threshold, freezeOnceVisible, triggerOnce, cleanup, isIntersecting]);
  
  // Déterminer si le contenu doit être rendu en fonction des options
  const shouldRender = freezeOnceVisible ? isIntersecting || hasBeenVisible : isIntersecting;
  
  return { elementRef, isIntersecting: shouldRender, hasBeenVisible };
}
