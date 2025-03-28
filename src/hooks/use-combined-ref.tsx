
import React, { useCallback } from 'react';

type RefType<T> = React.RefObject<T> | React.RefCallback<T> | null | undefined;

export function useCombinedRef<T>(elementRef: RefType<T>, localRef: React.RefObject<T>) {
  const setCombinedRef = useCallback((node: T | null) => {
    // Handle intersection observer ref
    if (elementRef) {
      // Handle based on ref type
      if (typeof elementRef === 'function') {
        (elementRef as React.RefCallback<T>)(node);
      } else if (elementRef && 'current' in elementRef) {
        // Only set current if it's a ref object with a current property
        (elementRef as React.MutableRefObject<T | null>).current = node;
      }
    }
    
    // Set local ref
    if (localRef) {
      localRef.current = node;
    }
  }, [elementRef, localRef]);

  return setCombinedRef;
}
