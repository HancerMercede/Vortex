const STORAGE_KEYS = {
  SETTINGS: 'vortex_settings',
  ENVIRONMENTS: 'vortex_environments',
  HISTORY: 'vortex_history',
  COLLECTIONS: 'vortex_collections',
} as const;

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return { ...defaultValue, ...JSON.parse(saved) } as T;
  } catch {
    return defaultValue;
  }
}

export function loadArrayFromStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
}

export { STORAGE_KEYS };
