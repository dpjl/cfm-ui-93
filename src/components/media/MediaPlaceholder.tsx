
import React, { forwardRef } from 'react';

const MediaPlaceholder = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return (
    <div 
      ref={ref}
      className="aspect-square bg-muted/50 animate-pulse rounded-sm"
      aria-hidden="true"
      {...props}
    />
  );
});

MediaPlaceholder.displayName = 'MediaPlaceholder';

export default MediaPlaceholder;
