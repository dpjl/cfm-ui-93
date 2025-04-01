
import React, { useCallback, RefObject } from 'react';

type RefType<T> = React.RefObject<T> | React.RefCallback<T> | null | undefined;

/**
 * Hook permettant de combiner plusieurs références React (forwardRef et useRef)
 */
export function useCombinedRef<T>(elementRef: RefType<T>, localRef: React.RefObject<T>) {
  const setCombinedRef = useCallback((node: T | null) => {
    // Handle reference passed from parent
    if (elementRef) {
      // Handle based on ref type
      if (typeof elementRef === 'function') {
        (elementRef as React.RefCallback<T>)(node);
      } else if (elementRef && 'current' in elementRef) {
        try {
          (elementRef as React.MutableRefObject<T | null>).current = node;
        } catch (error) {
          console.warn('Could not set ref, it might be read-only', error);
        }
      }
    }
    
    // Set local ref
    if (localRef && typeof localRef === 'object' && 'current' in localRef) {
      try {
        // Essayer de mettre à jour la référence locale
        (localRef as React.MutableRefObject<T | null>).current = node;
      } catch (error) {
        console.warn('Could not set local ref, it might be read-only', error);
      }
    }
  }, [elementRef, localRef]);

  return setCombinedRef;
}
