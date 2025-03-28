
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryTree } from '@/api/imageApi';
import DirectoryTree from '../navigation/DirectoryTree';
import ColumnSettings from '../navigation/ColumnSettings';

const SidebarRight: React.FC = () => {
  const { data: directoryTree, isLoading } = useQuery({
    queryKey: ['directoryTree', 'right'],
    queryFn: () => fetchDirectoryTree('right')
  });
  
  return (
    <div className="w-64 border-l border-border bg-card flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={['directories', 'columns']}>
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
            
            <AccordionItem value="columns">
              <AccordionTrigger>Colonnes</AccordionTrigger>
              <AccordionContent>
                <ColumnSettings />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarRight;
