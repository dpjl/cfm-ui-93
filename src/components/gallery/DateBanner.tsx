
import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DateBannerProps {
  date: string | null;
}

/**
 * Composant qui affiche un bandeau avec la date du premier élément visible
 * Le bandeau s'affiche en haut de la galerie
 */
const DateBanner: React.FC<DateBannerProps> = ({ date }) => {
  if (!date) return null;

  return (
    <div className="absolute top-2 left-0 right-0 z-10 flex justify-center pointer-events-none">
      <div className="bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-md shadow-sm border border-border/30 flex items-center gap-2">
        <Calendar size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">{date}</span>
      </div>
    </div>
  );
};

export default DateBanner;
