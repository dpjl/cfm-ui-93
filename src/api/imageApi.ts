
import { API_BASE_URL } from './constants';

export const getMediaIds = async (directory: string = 'source'): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/media?directory=${directory}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media IDs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching media IDs:', error);
    throw error;
  }
};

export const getMediaInfo = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/info?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media info: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching media info:', error);
    throw error;
  }
};

export const getMediaThumbnailUrl = (id: string): string => {
  return `${API_BASE_URL}/thumbnail?id=${id}`;
};

export const getMediaUrl = (id: string): string => {
  return `${API_BASE_URL}/media?id=${id}`;
};

export const deleteImages = async (directory: string, imageIds: string[]): Promise<void> => {
  console.log(`Sending DELETE request to ${API_BASE_URL}/images?directory=${directory}`);
  console.log('Request body:', { imageIds });
  
  try {
    const response = await fetch(`${API_BASE_URL}/images?directory=${directory}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete images: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting images:', error);
    throw error;
  }
};
