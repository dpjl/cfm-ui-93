
import React from 'react';

interface MediaPlaceholderProps {
  // Aucune prop nécessaire pour le placeholder
}

const MediaPlaceholder = React.forwardRef<HTMLDivElement, MediaPlaceholderProps>(
  (props, ref) => {
    return (
      <div 
        ref={ref}
        className="aspect-square bg-muted/30 rounded-lg"
        role="img"
        aria-label="Loading media item"
      ></div>
    );
  }
);

MediaPlaceholder.displayName = 'MediaPlaceholder';

export default MediaPlaceholder;
