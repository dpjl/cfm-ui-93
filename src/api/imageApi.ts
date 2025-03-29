
import { API_BASE_URL } from './constants';

export interface MediaItem {
  id: string;
  name?: string;
  type?: 'image' | 'video';
  path?: string;
  createdAt?: string;
}

export interface DetailedMediaInfo {
  alt?: string;
  createdAt?: string | null;
  name?: string;
  path?: string;
  size?: string;
  cameraModel?: string;
  hash?: string;
  duplicatesCount?: number;
  dimensions?: string;
}

export interface DirectoryNode {
  id: string;
  name: string;
  children?: DirectoryNode[];
  path?: string;
  position?: 'left' | 'right';
}

// Mock directories for each position
const mockDirectories: Record<string, DirectoryNode[]> = {
  left: [
    {
      id: 'dir-1-left',
      name: 'Photos 2023',
      position: 'left',
      children: [
        {
          id: 'dir-1-1-left',
          name: 'Vacances été',
          position: 'left'
        },
        {
          id: 'dir-1-2-left',
          name: 'Anniversaires',
          position: 'left',
          children: [
            {
              id: 'dir-1-2-1-left',
              name: 'Julie',
              position: 'left'
            },
            {
              id: 'dir-1-2-2-left',
              name: 'Thomas',
              position: 'left'
            }
          ]
        }
      ]
    },
    {
      id: 'dir-2-left',
      name: 'Photos 2022',
      position: 'left',
      children: [
        {
          id: 'dir-2-1-left',
          name: 'Mariage',
          position: 'left'
        },
        {
          id: 'dir-2-2-left',
          name: 'Voyage Italie',
          position: 'left'
        }
      ]
    }
  ],
  right: [
    {
      id: 'dir-1-right',
      name: 'Collection Triée',
      position: 'right',
      children: [
        {
          id: 'dir-1-1-right',
          name: 'Meilleurs portraits',
          position: 'right'
        },
        {
          id: 'dir-1-2-right',
          name: 'Paysages',
          position: 'right'
        }
      ]
    },
    {
      id: 'dir-2-right',
      name: 'Archives',
      position: 'right',
      children: [
        {
          id: 'dir-2-1-right',
          name: 'Vacances 2020',
          position: 'right'
        },
        {
          id: 'dir-2-2-right',
          name: 'Divers',
          position: 'right'
        }
      ]
    }
  ]
};

// Génère environ 200 IDs médias
function generateMockMediaIds(count: number = 200): string[] {
  return Array.from({ length: count }, (_, i) => `mock-media-${i + 1}`);
}

// Cache des médias générés pour une cohérence entre les appels
const mockMediaCache: Record<string, string[]> = {
  'source': generateMockMediaIds(212),
  'destination': generateMockMediaIds(195)
};

// Fetch directory tree
export const fetchDirectoryTree = async (position?: 'left' | 'right'): Promise<DirectoryNode[]> => {
  try {
    const pos = position || 'left';
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return mock directories
    return mockDirectories[pos];
  } catch (error) {
    console.error('Error fetching directory tree:', error);
    return [];
  }
};

// Fetch media IDs
export const fetchMediaIds = async (
  directory: string, 
  position: 'source' | 'destination',
  filter: string = 'all'
): Promise<string[]> => {
  try {
    // En environnement de production, on ferait un appel à l'API
    const url = `${API_BASE_URL}/media?directory=${directory}&filter=${filter}`;
    
    if (process.env.NODE_ENV === 'development' || !API_BASE_URL) {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Générer ou récupérer les médias mockés du cache
      const mockMedia = mockMediaCache[position] || generateMockMediaIds();
      
      // Appliquer le filtre
      if (filter === 'duplicates') {
        return mockMedia.filter((_, i) => i % 5 === 0).slice(0, 30); // ~15% sont des doublons
      } else if (filter === 'unique') {
        return mockMedia.filter((_, i) => i % 5 !== 0); // le reste sont des uniques
      }
      
      return mockMedia;
    }
    
    // Si en production, faire l'appel API réel
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch media IDs: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching media IDs:', error);
    return [];
  }
};

// Fetch detailed media info
export const fetchMediaInfo = async (id: string, position: 'source' | 'destination'): Promise<DetailedMediaInfo> => {
  try {
    const url = `${API_BASE_URL}/info?id=${id}&directory=${position}`;
    
    // If in development or API_BASE_URL is not set, return mock data
    if (process.env.NODE_ENV === 'development' || !API_BASE_URL) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Return mock info
      return {
        alt: `Media ${id}`,
        createdAt: new Date().toISOString(),
        name: `IMG_${id}.jpg`,
        path: `/media/${position}/IMG_${id}.jpg`,
        size: '4.2 MB',
        cameraModel: 'Canon EOS R5',
        hash: '8f7d56a1c3b2e9f0d4e5a6b7',
        duplicatesCount: 0,
        dimensions: '3840x2160'
      };
    }
    
    // If in production, make actual API call
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch media info: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching media info:', error);
    return {};
  }
};

// Get thumbnail URL
export const getThumbnailUrl = (id: string, position: 'source' | 'destination'): string => {
  // Si l'ID commence par 'mock-media-', on génère une URL d'image aléatoire avec Picsum
  if (id.startsWith('mock-media-')) {
    // Extraire le numéro de l'ID pour avoir une image cohérente
    const idNum = parseInt(id.replace('mock-media-', '')) || Math.floor(Math.random() * 1000);
    const seed = idNum % 1000;
    
    // Déterminer si c'est une vidéo (env. 15% des éléments)
    const isVideo = seed % 100 < 15;
    
    if (isVideo) {
      // Retourner un placeholder pour les vidéos
      return `https://placehold.co/400x400/4338ca/white?text=Video+${seed}`;
    } else {
      // Retourner une image Picsum avec une graine cohérente
      return `https://picsum.photos/seed/${id}/400/400`;
    }
  }
  
  // Pour les IDs non-mock, on utiliserait l'API réelle
  return `${API_BASE_URL}/thumbnail?id=${id}&directory=${position}`;
};

// Get full media URL
export const getMediaUrl = (id: string, position: 'source' | 'destination'): string => {
  // Pour les IDs mockés, utiliser Picsum avec une plus grande résolution
  if (id.startsWith('mock-media-')) {
    const idNum = parseInt(id.replace('mock-media-', '')) || Math.floor(Math.random() * 1000);
    const seed = idNum % 1000;
    
    // Déterminer si c'est une vidéo
    const isVideo = seed % 100 < 15;
    
    if (isVideo) {
      // Retourner un placeholder pour les vidéos en taille originale
      return `https://placehold.co/1920x1080/4338ca/white?text=Video+${seed}+Preview`;
    } else {
      // Retourner une image Picsum en grande taille
      return `https://picsum.photos/seed/${id}/1200/800`;
    }
  }
  
  // Pour les IDs non-mock, on utiliserait l'API réelle
  return `${API_BASE_URL}/media?id=${id}&directory=${position}`;
};

// Delete images
export const deleteImages = async (imageIds: string[]): Promise<{ success: boolean, message: string }> => {
  try {
    const url = `${API_BASE_URL}/images`;
    
    // If in development or API_BASE_URL is not set, simulate deletion
    if (process.env.NODE_ENV === 'development' || !API_BASE_URL) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate successful deletion
      console.log(`Mock deleted images: ${imageIds.join(', ')}`);
      return { success: true, message: `Successfully deleted ${imageIds.length} images` };
    }
    
    // If in production, make actual API call
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete images: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting images:', error);
    return { success: false, message: 'Failed to delete images' };
  }
};
