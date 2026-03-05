import { RequestOptions, ResponseData } from '../../domain/types';

declare global {
  interface Window {
    electronAPI?: {
      httpRequest: (options: RequestOptions) => Promise<{
        status: number;
        statusText: string;
        headers: Record<string, string>;
        body: string;
      }>;
    };
  }
}

export interface HttpClientConfig {
  timeout: number;
  verifySsl: boolean;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = { timeout: 30000, verifySsl: true }) {
    this.config = config;
  }

  setConfig(config: Partial<HttpClientConfig>) {
    this.config = { ...this.config, ...config };
  }

  async request(options: RequestOptions): Promise<ResponseData> {
    const startTime = Date.now();
    
    let responseData: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
    };

    if (window.electronAPI) {
      responseData = await window.electronAPI.httpRequest(options);
    } else {
      responseData = await this.fetchRequest(options);
    }

    const elapsed = Date.now() - startTime;
    const size = new Blob([responseData.body]).size;

    const formatted = this.formatResponse(responseData.body, responseData.headers['content-type']);
    const contentType = this.getContentType(responseData.headers['content-type']);

    return {
      status: responseData.status,
      statusText: responseData.statusText,
      elapsed,
      size,
      formatted,
      contentType,
      headers: responseData.headers,
    };
  }

  private async fetchRequest(options: RequestOptions): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers: options.headers,
        signal: controller.signal,
      };

      if (options.body && !['GET', 'HEAD'].includes(options.method)) {
        fetchOptions.body = options.body;
      }

      const response = await fetch(options.url, fetchOptions);
      const body = await response.text();
      
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private formatResponse(body: string, contentType?: string): string {
    if (contentType?.includes('json')) {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    }
    return body;
  }

  private getContentType(contentType?: string): string {
    if (!contentType) return 'text';
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
    return 'text';
  }
}

export const httpClient = new HttpClient();
