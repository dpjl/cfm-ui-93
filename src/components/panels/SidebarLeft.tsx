
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryTree } from '@/api/imageApi';
import DirectoryTree from '../navigation/DirectoryTree';
import FilterOptions from '../navigation/FilterOptions';

const SidebarLeft: React.FC = () => {
  const { data: directoryTree, isLoading } = useQuery({
    queryKey: ['directoryTree', 'left'],
    queryFn: () => fetchDirectoryTree('left')
  });
  
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={['directories', 'filters']}>
            <AccordionItem value="directories">
              <AccordionTrigger>Répertoires</AccordionTrigger>
              <AccordionContent>
                {isLoading ? (
                  <div className="py-2">Chargement...</div>
                ) : directoryTree ? (
                  <DirectoryTree directories={directoryTree} />
                ) : (
                  <div className="py-2 text-muted-foreground">
                    Aucun répertoire disponible
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="filters">
              <AccordionTrigger>Filtres</AccordionTrigger>
              <AccordionContent>
                <FilterOptions />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarLeft;
