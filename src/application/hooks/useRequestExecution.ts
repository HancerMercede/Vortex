import { useCallback } from 'react';
import { useRequestStore, useSettingsStore } from '../stores';
import { HttpClient } from '../../infrastructure/electron/api';
import { HttpMethod, Header } from '../../domain/types';

export function useRequestExecution() {
  const { 
    url, 
    method, 
    headers, 
    params,
    body, 
    authType, 
    authData, 
    setResponse, 
    setLoading, 
    setError, 
    addToHistory 
  } = useRequestStore();

  const { settings, substituteVariables } = useSettingsStore();

  const execute = useCallback(async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse(null);

    const client = new HttpClient({
      timeout: settings.timeout,
      verifySsl: settings.sslVerification,
    });
    
    try {
      const enabledHeaders = headers.filter((h) => h.enabled && h.key);
      let requestHeaders: Record<string, string> = {};
      
      enabledHeaders.forEach((h: Header) => {
        const key = substituteVariables(h.key);
        const value = substituteVariables(h.value);
        requestHeaders[key] = value;
      });

      let requestUrl = substituteVariables(url);
      
      const enabledParams = params.filter((p) => p.enabled && p.key);
      if (enabledParams.length > 0) {
        const queryString = enabledParams
          .map((p) => `${encodeURIComponent(substituteVariables(p.key))}=${encodeURIComponent(substituteVariables(p.value))}`)
          .join('&');
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl = `${requestUrl}${separator}${queryString}`;
      }
      
      let requestBody = !['GET', 'HEAD'].includes(method) && body.trim() 
        ? substituteVariables(body) 
        : undefined;

      if (authType === 'BEARER TOKEN' && authData.bearerToken) {
        requestHeaders['Authorization'] = `Bearer ${substituteVariables(authData.bearerToken)}`;
      }

      if (authType === 'BASIC AUTH' && authData.basicAuth.username) {
        const credentials = btoa(
          `${substituteVariables(authData.basicAuth.username)}:${substituteVariables(authData.basicAuth.password)}`
        );
        requestHeaders['Authorization'] = `Basic ${credentials}`;
      }

      if (authType === 'API KEY' && authData.apiKey.key && authData.apiKey.value) {
        const key = substituteVariables(authData.apiKey.key);
        const value = substituteVariables(authData.apiKey.value);
        
        if (authData.apiKey.addTo === 'header') {
          requestHeaders[key] = value;
        } else {
          const separator = requestUrl.includes('?') ? '&' : '?';
          requestUrl = `${requestUrl}${separator}${key}=${encodeURIComponent(value)}`;
        }
      }

      const response = await client.request({
        url: requestUrl,
        method: method as HttpMethod,
        headers: requestHeaders,
        body: requestBody,
      });

      setResponse(response);
      addToHistory(method, url, response.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, params, body, authType, authData, settings, substituteVariables, setResponse, setLoading, setError, addToHistory]);

  return { execute };
}
