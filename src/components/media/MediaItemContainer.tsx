
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MediaItemContainerProps {
  id: string;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

// A focused component just for the container and click handling
const MediaItemContainer = memo(({
  id,
  selected,
  onClick,
  children
}: MediaItemContainerProps) => {
  return (
    <div
      className={cn(
        "image-card relative aspect-square cursor-pointer",
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
    >
      {children}
    </div>
  );
});

MediaItemContainer.displayName = 'MediaItemContainer';

export default MediaItemContainer;
