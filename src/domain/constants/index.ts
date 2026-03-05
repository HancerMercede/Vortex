import { Header, HistoryItem, HttpMethod, Environment, Settings, ProxyConfig } from '../types';

export const DEFAULT_HEADERS: Header[] = [
  { id: 1, key: 'Content-Type', value: 'application/json', enabled: true },
];

export const DEFAULT_HISTORY: HistoryItem[] = [];

export const DEFAULT_ENVIRONMENT: Environment = {
  id: 'default',
  name: 'DEFAULT',
  variables: [
    { id: 1, key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
  ],
};

export const DEFAULT_PROXY: ProxyConfig = {
  enabled: false,
  host: '',
  port: '',
  protocol: 'http',
};

export const DEFAULT_SETTINGS: Settings = {
  timeout: 30000,
  sslVerification: true,
  proxy: DEFAULT_PROXY,
  defaultHeaders: [],
  theme: 'cyberpunk',
  fontSize: 13,
  responsePanelPosition: 'side',
};

export const METHOD_COLORS: Record<HttpMethod, { color: string; bg: string }> = {
  GET:    { color: '#98c379', bg: 'rgba(152,195,121,0.15)' },
  POST:   { color: '#e5c07b', bg: 'rgba(229,192,123,0.15)' },
  PUT:    { color: '#61afef', bg: 'rgba(97,175,239,0.15)' },
  PATCH:  { color: '#c678dd', bg: 'rgba(198,120,221,0.15)' },
  DELETE: { color: '#e06c75', bg: 'rgba(224,108,117,0.15)' },
  HEAD:   { color: '#5c6370', bg: 'rgba(92,99,112,0.15)' },
  OPTIONS:{ color: '#5c6370', bg: 'rgba(92,99,112,0.15)' },
};

export const STATUS_COLORS: Record<string, string> = {
  info: '#61afef',
  success: '#98c379',
  redirect: '#e5c07b',
  clientError: '#e06c75',
  serverError: '#e06c75',
};

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const AUTH_TYPES = ['NO AUTH', 'BEARER TOKEN', 'API KEY', 'BASIC AUTH'] as const;
