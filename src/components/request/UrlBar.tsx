import { useRequestStore } from '../../application/stores/requestStore';
import { HTTP_METHODS } from '../../domain/constants';

export function UrlBar() {
  const url = useRequestStore((state) => state.url) || '';
  const method = useRequestStore((state) => state.method) || 'GET';
  const loading = useRequestStore((state) => state.loading) || false;
  const setUrl = useRequestStore((state) => state.setUrl);
  const setMethod = useRequestStore((state) => state.setMethod);
  const addToHistory = useRequestStore((state) => state.addToHistory);
  const reset = useRequestStore((state) => state.reset);

  const handleSend = async () => {
    if (!url.trim()) return;
    
    reset();
    useRequestStore.setState({ loading: true });
    
    try {
      const res = await fetch(url, { method });
      const data = await res.text();
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      addToHistory(method, url, res.status);
      useRequestStore.setState({ 
        loading: false, 
        response: { 
          status: res.status, 
          statusText: res.statusText, 
          headers: responseHeaders, 
          body: data,
          time: 0,
          size: data.length
        } 
      });
    } catch (err: any) {
      useRequestStore.setState({ 
        loading: false, 
        error: err.message 
      });
    }
  };

  return (
    <div className="url-bar">
      <div className="method-select">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className={`method-${method?.toLowerCase()}`}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="url-input-wrap">
        <input
          className="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      <button
        className={`send-btn${loading ? ' loading' : ''}`}
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? '⟳ SENDING' : '▶ SEND'}
      </button>
    </div>
  );
}
