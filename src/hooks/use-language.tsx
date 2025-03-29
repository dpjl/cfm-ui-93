
import { createContext, useContext, useState, ReactNode } from 'react';

// Liste complète des clés de traduction
type TranslationKey = 
  | 'path'
  | 'date'
  | 'cancel'
  | 'selected'
  | 'download'
  | 'size'
  | 'select_all'
  | 'deselect_all'
  | 'show_dates'
  | 'hide_dates'
  | 'gallery_settings'
  | 'preview'
  | 'delete'
  | 'confirm_delete'
  | 'delete_selected'
  | 'server_status'
  | 'server_info'
  | 'close'
  | 'camera'
  | 'hash'
  | 'duplicates'
  | 'refresh'
  | 'source'
  | 'destination'
  | 'both'
  | 'settings'
  | 'all'
  | 'unique'
  | 'filter'
  | 'loading'
  | 'errorLoadingMedia'
  | 'mediaInformation'
  | 'itemsSelected'
  | 'name'
  | 'dimensions'
  | 'noDetailedInformation';

// Définir les traductions
const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    path: 'Path',
    date: 'Date',
    cancel: 'Cancel',
    selected: 'Selected',
    download: 'Download',
    size: 'Size',
    select_all: 'Select All',
    deselect_all: 'Deselect All',
    show_dates: 'Show Dates',
    hide_dates: 'Hide Dates',
    gallery_settings: 'Gallery Settings',
    preview: 'Preview',
    delete: 'Delete',
    confirm_delete: 'Confirm Delete',
    delete_selected: 'Delete Selected',
    server_status: 'Server Status',
    server_info: 'Server Information',
    close: 'Close',
    camera: 'Camera',
    hash: 'Hash',
    duplicates: 'Duplicates',
    refresh: 'Refresh',
    source: 'Source',
    destination: 'Destination',
    both: 'Both',
    settings: 'Settings',
    all: 'All',
    unique: 'Unique',
    filter: 'Filter',
    loading: 'Loading',
    errorLoadingMedia: 'Error loading media',
    mediaInformation: 'Media Information',
    itemsSelected: 'items selected',
    name: 'Name',
    dimensions: 'Dimensions',
    noDetailedInformation: 'No detailed information available'
  },
  fr: {
    path: 'Chemin',
    date: 'Date',
    cancel: 'Annuler',
    selected: 'Sélectionné',
    download: 'Télécharger',
    size: 'Taille',
    select_all: 'Tout sélectionner',
    deselect_all: 'Tout désélectionner',
    show_dates: 'Afficher les dates',
    hide_dates: 'Masquer les dates',
    gallery_settings: 'Paramètres galerie',
    preview: 'Aperçu',
    delete: 'Supprimer',
    confirm_delete: 'Confirmer suppression',
    delete_selected: 'Supprimer sélection',
    server_status: 'État du serveur',
    server_info: 'Informations serveur',
    close: 'Fermer',
    camera: 'Appareil photo',
    hash: 'Empreinte',
    duplicates: 'Doublons',
    refresh: 'Actualiser',
    source: 'Source',
    destination: 'Destination',
    both: 'Les deux',
    settings: 'Paramètres',
    all: 'Tous',
    unique: 'Uniques',
    filter: 'Filtre',
    loading: 'Chargement',
    errorLoadingMedia: 'Erreur de chargement',
    mediaInformation: 'Informations média',
    itemsSelected: 'éléments sélectionnés',
    name: 'Nom',
    dimensions: 'Dimensions',
    noDetailedInformation: 'Aucune information détaillée disponible'
  }
};

// Créer le contexte de langue
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('fr');

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
