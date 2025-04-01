
import React, { useState, useCallback } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-media-query';

interface DateSelectorProps {
  years: number[];
  monthsByYear: Map<number, number[]>;
  onSelectYearMonth: (year: number, month: number) => void;
  position: 'source' | 'destination';
}

const DateSelector: React.FC<DateSelectorProps> = ({
  years,
  monthsByYear,
  onSelectYearMonth,
  position
}) => {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleSelectMonth = useCallback((month: number) => {
    if (selectedYear !== null) {
      onSelectYearMonth(selectedYear, month);
      setIsOpen(false);
      setSelectedYear(null);
    }
  }, [selectedYear, onSelectYearMonth]);

  const handleBackToYears = useCallback(() => {
    setSelectedYear(null);
  }, []);

  const getMonthName = (month: number): string => {
    const monthNames = [
      t('january'), t('february'), t('march'), t('april'),
      t('may'), t('june'), t('july'), t('august'),
      t('september'), t('october'), t('november'), t('december')
    ];
    return monthNames[month - 1] || '';
  };

  // Classe de positionnement dynamique basée sur le type d'appareil
  const buttonPositionClass = isMobile
    ? "fixed bottom-16 right-3 z-[100]" // Position fixe plus haute sur mobile avec z-index élevé
    : "absolute bottom-2 right-2 z-50"; // Position originale sur desktop

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`${buttonPositionClass} bg-background/90 backdrop-blur-sm border border-primary/30 shadow-md hover:bg-background/95 transition-all duration-300`}
          aria-label={t('select_date')}
        >
          <Calendar className={`h-5 w-5 ${isMobile ? 'text-primary' : ''}`} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {selectedYear !== null && (
              <Button variant="ghost" size="sm" onClick={handleBackToYears} className="p-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {selectedYear !== null
              ? `${selectedYear} - ${t('select_date')}`
              : t('select_date')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {selectedYear === null ? (
            <div className="grid grid-cols-3 gap-2">
              {years.map(year => (
                <Button 
                  key={year} 
                  variant="outline"
                  onClick={() => handleSelectYear(year)}
                  className="h-14"
                >
                  {year}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {monthsByYear.get(selectedYear)?.map(month => (
                <Button
                  key={month}
                  variant="outline"
                  onClick={() => handleSelectMonth(month)}
                  className="h-14"
                >
                  {getMonthName(month)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DateSelector;
