
import React from 'react';
import { motion } from 'framer-motion';

interface MonthYearSeparatorProps {
  label: string;
}

const MonthYearSeparator: React.FC<MonthYearSeparatorProps> = ({ label }) => {
  return (
    <motion.div 
      className="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-muted/20 backdrop-blur-sm sticky top-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-sm sm:text-base md:text-lg font-medium text-foreground/90">{label}</h3>
    </motion.div>
  );
};

export default MonthYearSeparator;
