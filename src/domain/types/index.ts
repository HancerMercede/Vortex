export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type RequestTab = 'PARAMS' | 'HEADERS' | 'BODY' | 'AUTH';
export type ResponseTab = 'BODY' | 'HEADERS' | 'TIMELINE';

export type AuthType = 'NO AUTH' | 'BEARER TOKEN' | 'API KEY' | 'BASIC AUTH';

export interface Header {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthData {
  bearerToken: string;
  apiKey: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
  basicAuth: {
    username: string;
    password: string;
  };
}

export interface HistoryItem {
  id: number;
  method: HttpMethod;
  url: string;
  status: number;
}

export interface ResponseData {
  status: number;
  statusText: string;
  elapsed: number;
  size: number;
  formatted: string;
  contentType: string;
  headers: Record<string, string>;
}

export interface RequestOptions {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: string;
  protocol: 'http' | 'https' | 'socks5';
}

export interface Settings {
  timeout: number;
  sslVerification: boolean;
  proxy: ProxyConfig;
  defaultHeaders: Header[];
  theme: string;
  fontSize: number;
}

export interface CollectionRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  params: Header[];
  body: string;
  authType: AuthType;
  authData: AuthData;
}

export interface Collection {
  id: string;
  name: string;
  requests: CollectionRequest[];
  createdAt: number;
}
