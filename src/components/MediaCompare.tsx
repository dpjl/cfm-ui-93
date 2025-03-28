
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainHeader from './layout/MainHeader';
import GalleryPanel from './panels/GalleryPanel';
import SidebarLeft from './panels/SidebarLeft';
import SidebarRight from './panels/SidebarRight';
import MediaPreviewModal from './preview/MediaPreviewModal';
import { useMediaQuery } from '@/hooks/use-media-query';

const MediaCompare: React.FC = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPreviewId, setCurrentPreviewId] = useState<string | null>(null);
  const [currentPreviewPosition, setCurrentPreviewPosition] = useState<'source' | 'destination'>('source');
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);
  
  const handleMediaPreview = (id: string, position: 'source' | 'destination') => {
    setCurrentPreviewId(id);
    setCurrentPreviewPosition(position);
    setPreviewOpen(true);
  };
  
  const closePreview = () => {
    setPreviewOpen(false);
  };
  
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col bg-background">
        <MainHeader 
          toggleLeftSidebar={toggleLeftSidebar}
          toggleRightSidebar={toggleRightSidebar}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
        />
        
        {isMobile ? (
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="source" className="h-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="source">Source</TabsTrigger>
                <TabsTrigger value="destination">Destination</TabsTrigger>
              </TabsList>
              <TabsContent value="source" className="h-[calc(100%-40px)]">
                <div className="flex h-full relative">
                  {leftSidebarOpen && <SidebarLeft />}
                  <GalleryPanel 
                    position="source" 
                    onPreview={(id) => handleMediaPreview(id, 'source')}
                  />
                </div>
              </TabsContent>
              <TabsContent value="destination" className="h-[calc(100%-40px)]">
                <div className="flex h-full relative">
                  {rightSidebarOpen && <SidebarRight />}
                  <GalleryPanel 
                    position="destination" 
                    onPreview={(id) => handleMediaPreview(id, 'destination')}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex relative">
              {leftSidebarOpen && <SidebarLeft />}
              <GalleryPanel 
                position="source" 
                onPreview={(id) => handleMediaPreview(id, 'source')}
              />
            </div>
            
            <div className="panel-divider" />
            
            <div className="flex-1 flex relative">
              <GalleryPanel 
                position="destination" 
                onPreview={(id) => handleMediaPreview(id, 'destination')}
              />
              {rightSidebarOpen && <SidebarRight />}
            </div>
          </div>
        )}
        
        {previewOpen && currentPreviewId && (
          <MediaPreviewModal 
            mediaId={currentPreviewId}
            position={currentPreviewPosition}
            isOpen={previewOpen}
            onClose={closePreview}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default MediaCompare;
