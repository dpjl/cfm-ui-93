
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);

  // Find parent gallery element for scroll listening
  useEffect(() => {
    // Find closest gallery container to attach scroll listener
    const findGalleryContainer = () => {
      let element = document.activeElement;
      while (element && !element.classList.contains('gallery-container')) {
        element = element.parentElement;
      }
      return element;
    };

    galleryRef.current = findGalleryContainer() as HTMLElement || 
                         document.querySelector(`.gallery-container`) as HTMLElement;
    
    return () => {
      galleryRef.current = null;
    };
  }, []);

  // Hide button after inactivity
  const hideAfterInactivity = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(true);
    
    // Auto-hide after 3 seconds if drawer is not open
    if (!isOpen) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isOpen]);

  // Setup scroll listener and initial timeout
  useEffect(() => {
    // Show on scroll
    const handleScroll = () => {
      setIsVisible(true);
      hideAfterInactivity();
    };

    // Show on mouse movement
    const handleMouseMove = () => {
      setIsVisible(true);
      hideAfterInactivity();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    
    if (galleryRef.current) {
      galleryRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize timeout
    hideAfterInactivity();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (galleryRef.current) {
        galleryRef.current.removeEventListener('scroll', handleScroll);
      }
      
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hideAfterInactivity]);

  // Reset visibility and timeout when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      hideAfterInactivity();
    }
  }, [isOpen, hideAfterInactivity]);

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

  // Determine button position class based on gallery position
  const buttonPositionClass = position === 'source' 
    ? "top-2 left-2" 
    : "top-2 right-2";

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute ${buttonPositionClass} bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-background/90 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-label={t('select_date')}
          onMouseEnter={() => setIsVisible(true)}
        >
          <Calendar className="h-5 w-5" />
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
