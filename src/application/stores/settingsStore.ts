import { create } from 'zustand';
import { Environment, EnvironmentVariable, Settings } from '../../domain/types';
import { DEFAULT_ENVIRONMENT, DEFAULT_SETTINGS } from '../../domain/constants';
import { saveToStorage, loadFromStorage, loadArrayFromStorage, STORAGE_KEYS } from '../../infrastructure/storage';

interface SettingsState {
  settings: Settings;
  environments: Environment[];
  activeEnvironment: string;
  showEnvPanel: boolean;
  showSettingsPanel: boolean;
  setSettings: (settings: Partial<Settings>) => void;
  toggleEnvPanel: () => void;
  toggleSettingsPanel: () => void;
  closePanels: () => void;
  setActiveEnvironment: (id: string) => void;
  addEnvironment: (name: string) => void;
  deleteEnvironment: (id: string) => void;
  addVariable: (envId: string) => void;
  updateVariable: (envId: string, varId: number, updates: Partial<EnvironmentVariable>) => void;
  deleteVariable: (envId: string, varId: number) => void;
  getVariables: () => Record<string, string>;
  substituteVariables: (text: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  environments: loadArrayFromStorage(STORAGE_KEYS.ENVIRONMENTS, [DEFAULT_ENVIRONMENT]),
  activeEnvironment: 'default',
  showEnvPanel: false,
  showSettingsPanel: false,

  setSettings: (newSettings) => set((state) => {
    const merged = { ...state.settings, ...newSettings };
    saveToStorage(STORAGE_KEYS.SETTINGS, merged);
    return { settings: merged };
  }),

  toggleEnvPanel: () => set((state) => ({ 
    showEnvPanel: !state.showEnvPanel, 
    showSettingsPanel: false 
  })),

  toggleSettingsPanel: () => set((state) => ({ 
    showSettingsPanel: !state.showSettingsPanel, 
    showEnvPanel: false 
  })),

  closePanels: () => set({ showEnvPanel: false, showSettingsPanel: false }),

  setActiveEnvironment: (id) => set({ activeEnvironment: id }),

  addEnvironment: (name) => set((state) => {
    const newEnv: Environment = { id: Date.now().toString(), name, variables: [] };
    const envs = [...state.environments, newEnv];
    saveToStorage(STORAGE_KEYS.ENVIRONMENTS, envs);
    return { environments: envs, activeEnvironment: newEnv.id };
  }),

  deleteEnvironment: (id) => set((state) => {
    const envs = state.environments.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.ENVIRONMENTS, envs);
    return { 
      environments: envs, 
      activeEnvironment: state.activeEnvironment === id 
        ? (envs[0]?.id || 'default') 
        : state.activeEnvironment 
    };
  }),

  addVariable: (envId) => set((state) => {
    const envs = state.environments.map((e) => 
      e.id === envId 
        ? { ...e, variables: [...e.variables, { id: Date.now(), key: '', value: '', enabled: true }] }
        : e
    );
    saveToStorage(STORAGE_KEYS.ENVIRONMENTS, envs);
    return { environments: envs };
  }),

  updateVariable: (envId, varId, updates) => set((state) => {
    const envs = state.environments.map((e) => 
      e.id === envId 
        ? { ...e, variables: e.variables.map((v) => v.id === varId ? { ...v, ...updates } : v) }
        : e
    );
    saveToStorage(STORAGE_KEYS.ENVIRONMENTS, envs);
    return { environments: envs };
  }),

  deleteVariable: (envId, varId) => set((state) => {
    const envs = state.environments.map((e) => 
      e.id === envId 
        ? { ...e, variables: e.variables.filter((v) => v.id !== varId) }
        : e
    );
    saveToStorage(STORAGE_KEYS.ENVIRONMENTS, envs);
    return { environments: envs };
  }),

  getVariables: () => {
    const state = get();
    const env = state.environments.find((e) => e.id === state.activeEnvironment);
    if (!env) return {};
    return env.variables
      .filter((v) => v.enabled && v.key)
      .reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {});
  },

  substituteVariables: (text) => {
    const vars = get().getVariables();
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
  },
}));
