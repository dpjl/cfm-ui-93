
import { useCallback } from 'react';

interface UseKeyboardInteractionsProps {
  id: string;
  onSelect: (id: string, extendSelection: boolean) => void;
}

export function useKeyboardInteractions({ id, onSelect }: UseKeyboardInteractionsProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
  }, [id, onSelect]);
  
  return { handleKeyDown };
}
