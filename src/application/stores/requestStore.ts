import { create } from 'zustand';
import { HttpMethod, Header, HistoryItem, AuthType, AuthData, RequestTab, ResponseTab, ResponseData, Collection, CollectionRequest } from '../../domain/types';
import { DEFAULT_HEADERS, DEFAULT_HISTORY } from '../../domain/constants';
import { saveToStorage, loadArrayFromStorage, STORAGE_KEYS } from '../../infrastructure/storage';

interface RequestState {
  deleteFromHistory: (id: number) => void;
  url: string;
  method: HttpMethod;
  headers: Header[];
  params: Header[];
  body: string;
  authType: AuthType;
  authData: AuthData;
  response: ResponseData | null;
  loading: boolean;
  error: string | null;
  requestTab: RequestTab;
  responseTab: ResponseTab;
  history: HistoryItem[];
  collections: Collection[];
  setUrl: (url: string) => void;
  setMethod: (method: HttpMethod) => void;
  setHeaders: (headers: Header[]) => void;
  setParams: (params: Header[]) => void;
  setBody: (body: string) => void;
  setAuthType: (authType: AuthType) => void;
  setAuthData: (authData: AuthData) => void;
  setRequestTab: (tab: RequestTab) => void;
  setResponseTab: (tab: ResponseTab) => void;
  setResponse: (response: ResponseData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addHeader: () => void;
  updateHeader: (id: number, header: Partial<Header>) => void;
  deleteHeader: (id: number) => void;
  addParam: () => void;
  updateParam: (id: number, param: Partial<Header>) => void;
  deleteParam: (id: number) => void;
  addToHistory: (method: HttpMethod, url: string, status: number) => void;
  selectRequest: (url: string, method: HttpMethod) => void;
  reset: () => void;
  createCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addRequestToCollection: (collectionId: string, request: Omit<CollectionRequest, 'id'>) => void;
  deleteRequestFromCollection: (collectionId: string, requestId: string) => void;
  updateRequestInCollection: (collectionId: string, requestId: string, request: Partial<CollectionRequest>) => void;
  loadRequestFromCollection: (collectionId: string, requestId: string) => void;
  exportCollections: () => void;
  importCollections: (json: string) => void;
}

const defaultAuthData: AuthData = {
  bearerToken: '',
  apiKey: { key: '', value: '', addTo: 'header' },
  basicAuth: { username: '', password: '' },
};

export const useRequestStore = create<RequestState>((set, get) => ({
  url: 'https://jsonplaceholder.typicode.com/users/1',
  method: 'GET',
  headers: DEFAULT_HEADERS,
  params: [],
  body: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}',
  authType: 'NO AUTH',
  authData: defaultAuthData,
  response: null,
  loading: false,
  error: null,
  requestTab: 'PARAMS',
  responseTab: 'BODY',
  history: loadArrayFromStorage(STORAGE_KEYS.HISTORY, DEFAULT_HISTORY),
  collections: loadArrayFromStorage(STORAGE_KEYS.COLLECTIONS, []),

  setUrl: (url) => set({ url }),
  setMethod: (method) => set({ method }),
  setHeaders: (headers) => set({ headers }),
  setParams: (params) => set({ params }),
  setBody: (body) => set({ body }),
  setAuthType: (authType) => set({ authType }),
  setAuthData: (authData) => set({ authData }),
  setRequestTab: (requestTab) => set({ requestTab }),
  setResponseTab: (responseTab) => set({ responseTab }),
  setResponse: (response) => set({ response, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, response: null }),

  addHeader: () => set((state) => ({
    headers: [...state.headers, { id: Date.now(), key: '', value: '', enabled: true }]
  })),

  updateHeader: (id, header) => set((state) => ({
    headers: state.headers.map((h) => h.id === id ? { ...h, ...header } : h)
  })),

  deleteHeader: (id) => set((state) => ({
    headers: state.headers.filter((h) => h.id !== id)
  })),

  addParam: () => set((state) => ({
    params: [...state.params, { id: Date.now(), key: '', value: '', enabled: true }]
  })),

  updateParam: (id, param) => set((state) => ({
    params: state.params.map((p) => p.id === id ? { ...p, ...param } : p)
  })),

  deleteParam: (id) => set((state) => ({
    params: state.params.filter((p) => p.id !== id)
  })),

  addToHistory: (method, url, status) => set((state) => {
    const newHistory = [
      { id: Date.now(), method, url, status },
      ...state.history.slice(0, 19),
    ];
    saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
    return { history: newHistory };
  }),

  selectRequest: (url, method) => set({ url, method }),

  deleteFromHistory: (id) => set((state) => {
    const newHistory = state.history.filter((h) => h.id !== id);
    saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
    return { history: newHistory };
  }),

  reset: () => set({ response: null, error: null, loading: false }),

  createCollection: (name) => set((state) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      requests: [],
      createdAt: Date.now(),
    };
    const newCollections = [...state.collections, newCollection];
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  deleteCollection: (id) => set((state) => {
    const newCollections = state.collections.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  renameCollection: (id, name) => set((state) => {
    const newCollections = state.collections.map((c) =>
      c.id === id ? { ...c, name } : c
    );
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  addRequestToCollection: (collectionId, request) => set((state) => {
    const newCollections = state.collections.map((c) => {
      if (c.id !== collectionId) return c;
      const newRequest: CollectionRequest = {
        ...request,
        id: crypto.randomUUID(),
      };
      return { ...c, requests: [...c.requests, newRequest] };
    });
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  deleteRequestFromCollection: (collectionId, requestId) => set((state) => {
    const newCollections = state.collections.map((c) => {
      if (c.id !== collectionId) return c;
      return { ...c, requests: c.requests.filter((r) => r.id !== requestId) };
    });
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  updateRequestInCollection: (collectionId, requestId, request) => set((state) => {
    const newCollections = state.collections.map((c) => {
      if (c.id !== collectionId) return c;
      return {
        ...c,
        requests: c.requests.map((r) =>
          r.id === requestId ? { ...r, ...request } : r
        ),
      };
    });
    saveToStorage(STORAGE_KEYS.COLLECTIONS, newCollections);
    return { collections: newCollections };
  }),

  loadRequestFromCollection: (collectionId, requestId) => {
    const state = get();
    const collection = state.collections.find((c) => c.id === collectionId);
    if (!collection) return;
    const request = collection.requests.find((r) => r.id === requestId);
    if (!request) return;
    set({
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params,
      body: request.body,
      authType: request.authType,
      authData: request.authData,
      response: null,
      error: null,
    });
  },

  exportCollections: () => {
    const state = get();
    const data = JSON.stringify(state.collections, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vortex-collections.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importCollections: (json) => {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        const current = get().collections;
        const merged = [...current, ...imported.map((c: Collection) => ({ ...c, id: Date.now().toString() + Math.random() }))];
        set({ collections: merged });
        saveToStorage(STORAGE_KEYS.COLLECTIONS, merged);
      }
    } catch (e) {
      console.error('Failed to import collections:', e);
    }
  },
}));
