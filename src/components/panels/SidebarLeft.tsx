
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryTree } from '@/api/imageApi';
import DirectoryTree from '../navigation/DirectoryTree';
import FilterOptions from '../navigation/FilterOptions';

// Define interface to ensure compatibility
interface DirectoryNodeWithPath {
  name: string;
  path: string;
  children?: DirectoryNodeWithPath[];
}

const SidebarLeft: React.FC = () => {
  const { data: directoryTreeData, isLoading } = useQuery({
    queryKey: ['directoryTree', 'left'],
    queryFn: () => fetchDirectoryTree('left')
  });
  
  // Transform the API response to ensure it has the 'path' property
  const transformDirectoryTree = (nodes: any[] = []): DirectoryNodeWithPath[] => {
    return nodes.map(node => ({
      name: node.name,
      path: node.id || node.path || node.name, // Use id as path if available
      children: node.children ? transformDirectoryTree(node.children) : undefined
    }));
  };
  
  const directoryTree = directoryTreeData ? transformDirectoryTree(directoryTreeData) : [];
  
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
                ) : directoryTree.length > 0 ? (
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
