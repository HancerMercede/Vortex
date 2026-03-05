import { useRequestStore } from '../../application/stores/requestStore';
import { ResponseTab } from '../../domain/types';

function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m)) return /:$/.test(m)
          ? `<span class="json-key">${m}</span>`
          : `<span class="json-str">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
        if (/null/.test(m)) return `<span class="json-null">${m}</span>`;
        return `<span class="json-num">${m}</span>`;
      }
    )
    .replace(/([{}\[\],:])/g, `<span class="json-punct">$1</span>`);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function ResponsePanel() {
  const response = useRequestStore((state) => state.response);
  const error = useRequestStore((state) => state.error);
  const loading = useRequestStore((state) => state.loading);
  const responseTab = useRequestStore((state) => state.responseTab);
  const setResponseTab = useRequestStore((state) => state.setResponseTab);

  const getStatusClass = () => {
    if (!response) return '';
    if (response.status < 300) return 'status-200';
    if (response.status < 500) return 'status-4xx';
    return 'status-5xx';
  };

  const renderContent = () => {
    if (error) {
      return <div className="error-state">⚠ ERROR: {error}</div>;
    }

    if (!response && !loading) {
      return (
        <div className="empty-state">
          <div className="empty-icon" />
          <div className="empty-text">Awaiting transmission</div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="loading-text">TRANSMITTING...</div>
        </div>
      );
    }

    if (responseTab === 'BODY') {
      try {
        const parsed = JSON.parse(response.body);
        return <pre className="json-pre" dangerouslySetInnerHTML={{ __html: highlight(JSON.stringify(parsed, null, 2)) }} />;
      } catch {
        return <pre className="json-pre">{response.body}</pre>;
      }
    }

    if (responseTab === 'HEADERS') {
      const headers = response.headers as Record<string, string> || {};
      return (
        <div className="headers-list">
          {Object.entries(headers).map(([k, v]) => (
            <div key={k} className="header-row">
              <span className="header-key">{k}</span>
              <span className="header-value">{v}</span>
            </div>
          ))}
        </div>
      );
    }

    if (responseTab === 'TIMELINE') {
      const items = [
        { label: 'DNS LOOKUP', pct: 5, color: '#c678dd' },
        { label: 'TCP CONNECT', pct: 15, color: '#61afef' },
        { label: 'TLS HANDSHAKE', pct: 20, color: '#e5c07b' },
        { label: 'REQUEST SENT', pct: 2, color: '#98c379' },
        { label: 'WAITING TTFB', pct: 50, color: '#c678dd' },
        { label: 'DOWNLOAD', pct: 8, color: '#61afef' },
      ];
      return (
        <div className="timeline">
          {items.map((item) => (
            <div key={item.label} className="timeline-item">
              <span className="timeline-label">{item.label}</span>
              <div className="timeline-bar">
                <div
                  className="timeline-progress"
                  style={{ background: item.color, width: `${item.pct}%` }}
                />
              </div>
              <span className="timeline-value" style={{ color: item.color }}>
                {Math.round((response.time || 0) * item.pct / 100)}ms
              </span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="response-panel">
      <div className="panel-tabs">
        <div className="tab-group">
          {(['BODY', 'HEADERS', 'TIMELINE'] as ResponseTab[]).map((tab) => (
            <div
              key={tab}
              className={`panel-tab${responseTab === tab ? ' active' : ''}`}
              onClick={() => setResponseTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        {response && (
          <div className="response-meta">
            <span className={`status-badge ${getStatusClass()}`}>
              {response.status} {response.statusText}
            </span>
            <span className="meta-item">{response.time}ms</span>
            <span className="meta-item">{formatBytes(response.size)}</span>
          </div>
        )}
      </div>
      <div className="response-body">
        {renderContent()}
      </div>
    </div>
  );
}
