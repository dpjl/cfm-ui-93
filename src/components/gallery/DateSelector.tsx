
import React, { useState, useCallback } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed bottom-2 right-2 bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-background/90 z-[999] pointer-events-auto"
          aria-label={t('select_date')}
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 z-[999]" 
        align="end" 
        sideOffset={16}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            {selectedYear !== null && (
              <Button variant="ghost" size="sm" onClick={handleBackToYears} className="p-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h3 className="font-medium">
              {selectedYear !== null
                ? `${selectedYear} - ${t('select_date')}`
                : t('select_date')}
            </h3>
          </div>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
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
      </PopoverContent>
    </Popover>
  );
};

export default DateSelector;
