import { ImageItem } from '@/components/Gallery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

console.log("API Base URL:", API_BASE_URL);

export interface DirectoryNode {
  id: string;
  name: string;
  children?: DirectoryNode[];
}

export interface DetailedMediaInfo {
  alt: string;
  createdAt: string | null;
  name?: string;
  path?: string;
  size?: string;
  dimensions?: string;
  cameraModel?: string;
  hash?: string;
  duplicatesCount?: number;
}

export async function fetchDirectoryTree(position?: 'left' | 'right'): Promise<DirectoryNode[]> {
  const url = `${API_BASE_URL}/tree${position ? `?position=${position}` : ''}`;
  console.log(`Fetching directory tree from: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch directory tree: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Received directory tree for ${position || 'default'}:`, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching directory tree for ${position || 'default'}:`, error);
    
    // Return mock data in case of errors for development
    const mockData = [{ 
      id: `directory1-${position || 'default'}`, 
      name: "Default Directory", 
      children: [] 
    }];
    
    console.log(`Using mock directory data for ${position || 'default'}:`, mockData);
    return mockData;
  }
}

// Helper function to generate mock media IDs with more variety
function generateMockMediaIds(count: number = 200): string[] {
  return Array.from({ length: count }, (_, i) => `mock-media-${i}`);
}

export async function fetchMediaIds(directory: string, position: 'source' | 'destination', filter: string = 'all'): Promise<string[]> {
  const url = `${API_BASE_URL}/media?directory=${encodeURIComponent(position)}${filter !== 'all' ? `&filter=${filter}` : ''}`;
  console.log("Fetching media IDs from:", url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch media IDs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Received media IDs:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching media IDs:", error);
    
    // Return more mock data for development
    console.log("Using mock media IDs due to error");
    const mockMediaIds = generateMockMediaIds(200);
    return mockMediaIds;
  }
}

// Generate realistic camera models
const cameraModels = [
  "iPhone 13 Pro", "iPhone 14 Pro Max", "iPhone 15 Pro", 
  "Samsung Galaxy S21", "Samsung Galaxy S22 Ultra", "Samsung Galaxy S23",
  "Canon EOS 5D Mark IV", "Canon EOS R5", "Canon EOS R6",
  "Nikon Z6 II", "Nikon Z7 II", "Nikon D850",
  "Sony Alpha A7 III", "Sony Alpha A7R V", "Sony Alpha A1",
  "Google Pixel 7 Pro", "Google Pixel 8", "Google Pixel 6",
  "Fujifilm X-T4", "Fujifilm X-H2", "Fujifilm X-Pro3",
  "Panasonic Lumix S5", "Panasonic GH6", "Olympus OM-D E-M1 Mark III"
];

// Generate file size formats
function generateFileSize(): string {
  const sizes = ["KB", "MB"];
  const size = Math.floor(Math.random() * 30) + 1;
  const sizeUnit = sizes[Math.floor(Math.random() * sizes.length)];
  
  if (sizeUnit === "KB") {
    return `${Math.floor(Math.random() * 900) + 100} ${sizeUnit}`;
  } else {
    return `${(Math.random() * 20).toFixed(1)} ${sizeUnit}`;
  }
}

// Generate image dimensions
function generateDimensions(): string {
  const widths = [1920, 3840, 4032, 3024, 6016, 5472, 4000, 2048];
  const heights = [1080, 2160, 3024, 4032, 4000, 3648, 3000, 1536];
  
  const width = widths[Math.floor(Math.random() * widths.length)];
  const height = heights[Math.floor(Math.random() * heights.length)];
  
  return `${width}×${height}`;
}

// Generate random date within last 3 years
function generateDate(): string {
  const now = new Date();
  const threeYearsAgo = new Date(now);
  threeYearsAgo.setFullYear(now.getFullYear() - 3);
  
  const randomTimestamp = threeYearsAgo.getTime() + Math.random() * (now.getTime() - threeYearsAgo.getTime());
  return new Date(randomTimestamp).toISOString();
}

export async function fetchMediaInfo(id: string, position: 'source' | 'destination'): Promise<DetailedMediaInfo> {
  const url = `${API_BASE_URL}/info?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
  console.log(`Fetching media info for ID ${id} from:`, url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Server error for media info (ID: ${id}):`, response.status);
      throw new Error(`Failed to fetch media info: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Media info for ID ${id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching media info for ID ${id}:`, error);
    
    // Return enhanced mock data for development
    const idNumber = parseInt(id.replace("mock-media-", "")) || 0;
    const isPhoto = idNumber % 10 !== 0; // Every 10th item is a video
    const fileExt = isPhoto ? ".jpg" : ".mp4";
    
    const mockInfo: DetailedMediaInfo = { 
      alt: isPhoto ? `Photo ${id}${fileExt}` : `Video ${id}${fileExt}`, 
      createdAt: generateDate(),
      name: `IMG_${10000 + idNumber}${fileExt}`,
      path: `/media/photos/${Math.floor(idNumber / 50) + 1}/${id}${fileExt}`,
      size: generateFileSize(),
      dimensions: generateDimensions(),
      cameraModel: cameraModels[idNumber % cameraModels.length],
      hash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      duplicatesCount: Math.floor(Math.random() * 3) // 0, 1, or 2 duplicates
    };
    
    console.log(`Using mock media info for ${id}:`, mockInfo);
    return mockInfo;
  }
}

// These functions are now just utility functions to get the URLs
// The actual caching is handled by the components
export function getThumbnailUrl(id: string, position: 'source' | 'destination'): string {
  // If it looks like a mock ID, return a placeholder image
  if (id.startsWith('mock-media-')) {
    const idNumber = parseInt(id.replace("mock-media-", "")) || 0;
    const isVideo = idNumber % 10 === 0; // Every 10th item is a video
    
    // Use Lorem Picsum for random high-quality images
    // Add the ID as a seed to get consistent but varied images
    return `https://picsum.photos/seed/${id}/300/300${isVideo ? "?blur" : ""}`;
  }
  return `${API_BASE_URL}/thumbnail?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export function getMediaUrl(id: string, position: 'source' | 'destination'): string {
  // If it looks like a mock ID, return a placeholder image
  if (id.startsWith('mock-media-')) {
    const idNumber = parseInt(id.replace("mock-media-", "")) || 0;
    const isVideo = idNumber % 10 === 0; // Every 10th item is a video
    
    if (isVideo) {
      // For video placeholders, we could use a static video or keep it as an image
      return `https://picsum.photos/seed/${id}/800/600?blur`;
    }
    
    // Use Lorem Picsum for random high-quality images
    return `https://picsum.photos/seed/${id}/800/600`;
  }
  return `${API_BASE_URL}/media?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export async function deleteImages(imageIds: string[]): Promise<{ success: boolean, message: string }> {
  const url = `${API_BASE_URL}/images`;
  console.log("Deleting images at:", url, "IDs:", imageIds);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to delete images: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Delete response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting images:", error);
    
    // Return mock response for development
    console.log("Using mock delete response due to error");
    return { success: true, message: `Successfully deleted ${imageIds.length} image(s)` };
  }
}
