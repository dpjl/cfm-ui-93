
// MobileViewMode now applies to both mobile and desktop views
export type MobileViewMode = 'both' | 'left' | 'right';

// ViewModeType is used for column count calculations
export type ViewModeType = 'desktop' | 'desktop-single' | 'mobile-split' | 'mobile-single';

// Media item for gallery display
export interface MediaItem {
  id: string;
  alt?: string;
  createdAt?: string;
  isVideo?: boolean;
}

// Ensure all translation keys are properly typed
export type TranslationKey = 
  | 'date' | 'size' | 'camera' | 'path' | 'hash' | 'duplicates'
  | 'noMediaFound' | 'noDirectories'
  | 'media_gallery' | 'too_many_items_to_select' | 'close_sidebars'
  | 'columns' | 'single_selection' | 'multiple_selection'
  | 'desktop_columns' | 'desktop_single_columns' | 'split_columns' | 'single_columns'
  | 'delete_confirmation_title' | 'delete_confirmation_description' | 'deleting';
