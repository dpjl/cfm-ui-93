
import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useLanguage } from '@/hooks/use-language';

interface DateSelectorProps {
  years: string[];
  yearMonths: string[];
  onSelectYearMonth: (yearMonth: string) => void;
  position: 'source' | 'destination';
}

const DateSelector: React.FC<DateSelectorProps> = ({
  years,
  yearMonths,
  onSelectYearMonth,
  position,
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(years[0] || 'years');
  
  // Fonction pour obtenir tous les mois d'une année spécifique
  const getMonthsForYear = (year: string): string[] => {
    return yearMonths.filter(ym => ym.startsWith(year));
  };
  
  // Format d'affichage pour les mois (YYYY-MM -> mois en texte)
  const formatYearMonth = (yearMonth: string): string => {
    const year = yearMonth.substring(0, 4);
    const month = parseInt(yearMonth.substring(5, 7), 10);
    
    // Noms des mois (ces noms devraient idéalement venir des traductions)
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
      'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };
  
  const handleYearMonthSelect = (yearMonth: string) => {
    onSelectYearMonth(yearMonth);
    setOpen(false);
  };

  return (
    <div className={`fixed bottom-5 ${position === 'source' ? 'left-5' : 'right-5'} z-10`}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background/70 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-md"
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[70vh]">
          <div className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('navigation_temporelle')}</h4>
            
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="years">{t('annees')}</TabsTrigger>
                <TabsTrigger value="months">{t('mois')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="years" className="mt-0">
                <ScrollArea className="h-[40vh]">
                  <div className="grid grid-cols-2 gap-2">
                    {years.map(year => (
                      <Button
                        key={year}
                        variant="outline"
                        onClick={() => {
                          setActiveTab('months');
                          // Automatiquement sélectionner l'année pour montrer ses mois
                          setActiveTab(year);
                        }}
                        className="w-full justify-center"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {years.map(year => (
                <TabsContent key={year} value={year} className="mt-0">
                  <ScrollArea className="h-[40vh]">
                    <div className="grid grid-cols-2 gap-2">
                      {getMonthsForYear(year).map(yearMonth => (
                        <Button
                          key={yearMonth}
                          variant="outline"
                          onClick={() => handleYearMonthSelect(yearMonth)}
                          className="w-full justify-center"
                        >
                          {formatYearMonth(yearMonth)}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DateSelector;
