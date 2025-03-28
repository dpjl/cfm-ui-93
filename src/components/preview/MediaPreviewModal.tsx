
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Trash2,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchMediaInfo, 
  getMediaUrl,
  fetchMediaIds
} from '@/api/imageApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaPreviewModalProps {
  mediaId: string;
  position: 'source' | 'destination';
  isOpen: boolean;
  onClose: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  mediaId,
  position,
  isOpen,
  onClose
}) => {
  const [currentId, setCurrentId] = useState(mediaId);
  const [showInfo, setShowInfo] = useState(false);
  
  const { data: mediaInfo } = useQuery({
    queryKey: ['mediaInfo', currentId, position],
    queryFn: () => fetchMediaInfo(currentId, position),
    enabled: isOpen,
  });
  
  const { data: allMediaIds } = useQuery({
    queryKey: ['mediaIds', position],
    queryFn: () => fetchMediaIds('/', position, 'all'),
    enabled: isOpen,
  });
  
  const mediaUrl = getMediaUrl(currentId, position);
  
  useEffect(() => {
    if (mediaId !== currentId) {
      setCurrentId(mediaId);
    }
  }, [mediaId]);
  
  const navigateToNext = () => {
    if (!allMediaIds || allMediaIds.length === 0) return;
    
    const currentIndex = allMediaIds.findIndex(id => id === currentId);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % allMediaIds.length;
    setCurrentId(allMediaIds[nextIndex]);
  };
  
  const navigateToPrevious = () => {
    if (!allMediaIds || allMediaIds.length === 0) return;
    
    const currentIndex = allMediaIds.findIndex(id => id === currentId);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + allMediaIds.length) % allMediaIds.length;
    setCurrentId(allMediaIds[prevIndex]);
  };
  
  // Gestionnaire des touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          navigateToNext();
          break;
        case 'ArrowLeft':
          navigateToPrevious();
          break;
        case 'Escape':
          onClose();
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, navigateToNext, navigateToPrevious, onClose, showInfo]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">
            {mediaInfo?.alt || currentId}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative bg-slate-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={mediaUrl} 
                alt={mediaInfo?.alt || currentId}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
              onClick={navigateToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
              onClick={navigateToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
          
          {showInfo && (
            <div className="w-80 border-l bg-card">
              <Tabs defaultValue="info">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="p-0">
                  <ScrollArea className="h-[calc(90vh-160px)]">
                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Nom du fichier</h3>
                        <p className="text-sm text-muted-foreground">{mediaInfo?.alt || currentId}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Date de création</h3>
                        <p className="text-sm text-muted-foreground">
                          {mediaInfo?.createdAt ? new Date(mediaInfo.createdAt).toLocaleString() : 'Non disponible'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Emplacement</h3>
                        <p className="text-sm text-muted-foreground">{position === 'source' ? 'Source' : 'Destination'}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="metadata" className="p-0">
                  <ScrollArea className="h-[calc(90vh-160px)]">
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">Aucune métadonnée disponible</p>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        
        <DialogFooter className="p-4 border-t flex-shrink-0">
          <div className="flex justify-between w-full">
            <div>
              {allMediaIds && (
                <span className="text-sm text-muted-foreground">
                  {allMediaIds.findIndex(id => id === currentId) + 1} sur {allMediaIds.length}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                <span>Télécharger</span>
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Supprimer</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewModal;
