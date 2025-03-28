
import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface MediaItemContainerProps {
  id: string;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

// Optimisé pour réduire les re-rendus et les clignotements
const MediaItemContainer = memo(({
  id,
  selected,
  onClick,
  children
}: MediaItemContainerProps) => {
  return (
    <div
      className={cn(
        "image-card relative aspect-square cursor-pointer transform-gpu",
        "hover:scale-[1.01] transition-transform duration-150",
        selected && "selected"
      )}
      onClick={onClick}
      role="button"
      aria-label={`Media item ${id}`}
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          onClick(mouseEvent as unknown as React.MouseEvent);
        }
      }}
      data-media-id={id}
      style={{
        contain: 'layout style',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation des comparaisons
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected
  );
});

MediaItemContainer.displayName = 'MediaItemContainer';

export default MediaItemContainer;
