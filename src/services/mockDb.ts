import { Resource, Tutorial, Artist } from '../types';
import { resolvePath } from '../utils/pathUtils';

const RESOURCES_KEY = 'eduhub_resources';
const RESOURCES_VERSION_KEY = 'eduhub_resources_version';

const TUTORIALS_KEY = 'eduhub_tutorials';
const TUTORIALS_VERSION_KEY = 'eduhub_tutorials_version';

const ARTISTS_KEY = 'eduhub_artists';

// Default structure for initialization (before fetch)
const DEFAULT_DB = {
  version: 0,
  resources: [],
  tutorials: [],
  artists: []
};

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse localStorage payload', error);
    return fallback;
  }
};

// Load the global database from public/database.json and sync with localStorage
export const initializeDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(resolvePath(`/database.json?t=${Date.now()}`));
    if (!response.ok) throw new Error('Failed to fetch database.json');
    
    const remoteDb = await response.json();
    const remoteVersion = remoteDb.version;

    const currentStoredVersion = parseInt(localStorage.getItem('eduhub_db_version') || '0');
    const hasArtists = !!localStorage.getItem(ARTISTS_KEY);

    if (remoteVersion > currentStoredVersion || !hasArtists) {
      console.log(`Updating database. Remote: v${remoteVersion}, Local: v${currentStoredVersion}, Missing Artists: ${!hasArtists}`);
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(remoteDb.resources));
      localStorage.setItem(TUTORIALS_KEY, JSON.stringify(remoteDb.tutorials));
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(remoteDb.artists || []));
      localStorage.setItem('eduhub_db_version', remoteVersion.toString());
      
      // Keep legacy keys for compatibility if needed, or update them
      localStorage.setItem(RESOURCES_VERSION_KEY, remoteVersion.toString());
      localStorage.setItem(TUTORIALS_VERSION_KEY, remoteVersion.toString());
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

export const getResources = (): Resource[] => {
  const stored = localStorage.getItem(RESOURCES_KEY);
  return parseJSON<Resource[]>(stored, []);
};

export const addResource = (resource: Resource): void => {
  const current = getResources();
  const updated = [resource, ...current];
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const deleteResource = (id: string): void => {
  const current = getResources();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const updateResource = (id: string, updates: Partial<Resource>): void => {
  const current = getResources();
  const updated = current.map(r => (r.id === id ? { ...r, ...updates } : r));
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const toggleFeaturedResource = (id: string): void => {
  const current = getResources();
  const updated = current.map(r => r.id === id ? { ...r, isFeatured: !r.isFeatured } : r);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};

export const getTutorials = (): Tutorial[] => {
  const stored = localStorage.getItem(TUTORIALS_KEY);
  return parseJSON<Tutorial[]>(stored, []);
};

export const addTutorial = (tutorial: Tutorial): void => {
  const current = getTutorials();
  const updated = [tutorial, ...current];
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const updateTutorial = (id: string, updates: Partial<Tutorial>): void => {
  const current = getTutorials();
  const updated = current.map(t => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const deleteTutorial = (id: string): void => {
  const current = getTutorials();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const toggleFeaturedTutorial = (id: string): void => {
  const current = getTutorials();
  const updated = current.map(t => t.id === id ? { ...t, isFeatured: !t.isFeatured } : t);
  localStorage.setItem(TUTORIALS_KEY, JSON.stringify(updated));
};

export const getArtists = (): Artist[] => {
  const stored = localStorage.getItem(ARTISTS_KEY);
  return parseJSON<Artist[]>(stored, []);
};

export const addArtist = (artist: Artist): void => {
  const current = getArtists();
  const updated = [artist, ...current];
  localStorage.setItem(ARTISTS_KEY, JSON.stringify(updated));
};

// Admin Export Feature
export const exportDatabase = (): string => {
  const resources = getResources();
  const tutorials = getTutorials();
  const artists = getArtists();
  // Bump version by 1 for the export
  const currentVersion = parseInt(localStorage.getItem('eduhub_db_version') || '0');
  const newVersion = currentVersion + 1;
  
  const exportData = {
    version: newVersion,
    resources,
    tutorials,
    artists
  };

  // Update local version so subsequent exports increment correctly
  localStorage.setItem('eduhub_db_version', newVersion.toString());
  
  return JSON.stringify(exportData, null, 2);
};
