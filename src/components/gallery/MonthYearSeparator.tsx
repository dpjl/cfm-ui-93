
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface MonthYearSeparatorProps {
  label: string;
}

const MonthYearSeparator: React.FC<MonthYearSeparatorProps> = ({ label }) => {
  // Extraire le mois et l'année du label (ex: "Janvier 2023")
  const parts = label.split(' ');
  const month = parts[0];
  const year = parts[1] || '';

  return (
    <motion.div 
      className="flex items-center justify-center w-full h-full p-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex flex-col items-center justify-center bg-muted/20 backdrop-blur-sm rounded-lg p-2 w-[90%] h-[90%] shadow-subtle border border-muted/30">
        {/* Icône de calendrier en arrière-plan légèrement transparente */}
        <div className="absolute opacity-15 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Calendar className="w-12 h-12 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
        
        {/* Texte du mois et de l'année */}
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-foreground/80">{month}</span>
          <span className="text-lg font-bold text-foreground">{year}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MonthYearSeparator;
