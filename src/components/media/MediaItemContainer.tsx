
import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface MediaItemContainerProps {
  id: string;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const MediaItemContainer = memo(({
  id,
  selected,
  onClick,
  children
}: MediaItemContainerProps) => {
  return (
    <div
      className={cn(
        "relative aspect-square cursor-pointer",
        selected && "ring-2 ring-primary ring-offset-2"
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
    >
      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected
  );
});

MediaItemContainer.displayName = 'MediaItemContainer';

export default MediaItemContainer;
