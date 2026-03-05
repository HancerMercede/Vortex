export function getStatusCategory(code: number): string {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirect';
  if (code >= 400 && code < 500) return 'clientError';
  return 'serverError';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function syntaxHighlightJson(json: string | object): string {
  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return `<span style="color:#e06c75">${match.replace(/:$/, '')}</span><span style="color:#5c6370">:</span>`;
          }
          return `<span style="color:#98c379">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span style="color:#d19a66">${match}</span>`;
        if (/null/.test(match)) return `<span style="color:#5c6370">${match}</span>`;
        return `<span style="color:#d19a66">${match}</span>`;
      }
    );
}

export function extractPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
