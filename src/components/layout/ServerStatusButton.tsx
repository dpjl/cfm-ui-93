
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { fetchServerStatus } from '@/api/serverApi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ServerStatusButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: serverStatus, isLoading, error } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: fetchServerStatus,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={error ? 'text-destructive' : ''}
              >
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Informations sur le serveur</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Statut du serveur</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-4 text-center">Chargement des informations...</div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            Impossible de se connecter au serveur.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Répertoire source</div>
              <div className="font-mono text-sm truncate">{serverStatus?.sourceDirectory}</div>
              
              <div className="text-muted-foreground">Répertoire destination</div>
              <div className="font-mono text-sm truncate">{serverStatus?.destinationDirectory}</div>
              
              <div className="text-muted-foreground">Fichiers source</div>
              <div>{serverStatus?.sourceFileCount}</div>
              
              <div className="text-muted-foreground">Fichiers destination</div>
              <div>{serverStatus?.destinationFileCount}</div>
              
              <div className="text-muted-foreground">Dernière exécution</div>
              <div>{new Date(serverStatus?.lastExecutionDate || "").toLocaleString()}</div>
              
              <div className="text-muted-foreground">Format de destination</div>
              <div className="font-mono text-sm">{serverStatus?.destinationFormat}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${serverStatus?.isAccessible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{serverStatus?.isAccessible ? 'Connecté' : 'Déconnecté'}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServerStatusButton;
