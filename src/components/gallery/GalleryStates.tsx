
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, AlertTriangle, FolderOpen } from 'lucide-react';

interface GalleryLoadingProps {
  columns?: number;
}

export const GalleryLoading: React.FC<GalleryLoadingProps> = ({ columns = 4 }) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col h-full">
      <div className="grid gap-2 p-4 grow" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns * 3 }).map((_, i) => (
          <div 
            key={i}
            className="aspect-square bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    </div>
  );
};

interface GalleryErrorProps {
  error?: unknown;
}

export const GalleryError: React.FC<GalleryErrorProps> = ({ error }) => {
  const { t } = useLanguage();
  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AlertTriangle size={48} className="text-destructive mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('errorLoadingMedia')}</h3>
      <p className="text-muted-foreground mb-4">{t('errorLoadingMedia')}</p>
      <div className="p-4 bg-destructive/10 rounded-md text-sm text-destructive w-full max-w-md overflow-auto">
        <pre className="whitespace-pre-wrap">{errorMessage}</pre>
      </div>
    </motion.div>
  );
};

export const GalleryEmpty: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FolderOpen size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('noMediaFound')}</h3>
      <p className="text-muted-foreground">{t('noMediaFound')}</p>
    </motion.div>
  );
};
