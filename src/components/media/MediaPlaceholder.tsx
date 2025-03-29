
import React from 'react';

interface MediaPlaceholderProps {
  // Pas de props spécifiques nécessaires
}

const MediaPlaceholder = React.forwardRef<HTMLDivElement, MediaPlaceholderProps>(
  (props, ref) => {
    return (
      <div 
        ref={ref}
        className="aspect-square bg-muted/30 rounded-lg"
        role="img"
        aria-label="Loading media item"
      />
    );
  }
);

MediaPlaceholder.displayName = 'MediaPlaceholder';

export default MediaPlaceholder;
