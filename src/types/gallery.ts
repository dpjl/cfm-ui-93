
// MobileViewMode now applies to both mobile and desktop views
export type MobileViewMode = 'both' | 'left' | 'right';

// ViewModeType is used for column count calculations
export type ViewModeType = 'desktop' | 'desktop-single' | 'mobile-split' | 'mobile-single';

// Added SelectionMode type here so it can be imported from a common location
export type SelectionMode = 'single' | 'multiple';

// Basic media item interface
export interface MediaItem {
  id: string;
  src?: string;
  alt?: string;
  createdAt?: string;
  isVideo?: boolean;
  directory?: string;
  type?: "image" | "video";
}

// Update MediaFilter type to include all possible values
export type MediaFilter = 'all' | 'unique' | 'duplicates' | 'exclusive' | 'common' | 'favorites' | 'images' | 'videos';

// Ensure all translation keys are properly typed
export type TranslationKey = 
  | 'date' | 'size' | 'camera' | 'path' | 'hash' | 'duplicates'
  | 'noMediaFound' | 'noDirectories'
  | 'media_gallery' | 'too_many_items_to_select' | 'close_sidebars'
  | 'columns' | 'single_selection' | 'multiple_selection'
  | 'desktop_columns' | 'desktop_single_columns' | 'split_columns' | 'single_columns'
  | 'delete_confirmation_title' | 'delete_confirmation_description' | 'deleting'
  | 'gallery.error.title' | 'gallery.error.description'
  | 'gallery.empty.title' | 'gallery.empty.description'
  | 'errorLoadingMedia';
