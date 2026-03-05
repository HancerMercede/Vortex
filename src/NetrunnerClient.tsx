import React, { useState, useCallback, useRef, FC, ChangeEvent, KeyboardEvent } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type TabId = "params" | "headers" | "body" | "auth";

interface KVRow { id: number; key: string; value: string; }
interface HistoryItem { method: HttpMethod; path: string; url: string; }
interface ResponseState { status: number; statusText: string; body: string; time: number; size: number; }

// ── Constants ──────────────────────────────────────────────────────────────
const HISTORY: HistoryItem[] = [
  { method: "GET",    path: "/users/10", url: "https://jsonplaceholder.typicode.com/users/10" },
  { method: "GET",    path: "/users/1",  url: "https://jsonplaceholder.typicode.com/users/1"  },
  { method: "GET",    path: "/users",    url: "https://jsonplaceholder.typicode.com/users"    },
  { method: "POST",   path: "/posts",    url: "https://jsonplaceholder.typicode.com/posts"    },
  { method: "PUT",    path: "/posts/1",  url: "https://jsonplaceholder.typicode.com/posts/1"  },
  { method: "DELETE", path: "/posts/1",  url: "https://jsonplaceholder.typicode.com/posts/1"  },
];

// ── Syntax highlighter ─────────────────────────────────────────────────────
function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m)) return /:$/.test(m)
          ? `<span class="json-key">${m}</span>`
          : `<span class="json-str">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
        if (/null/.test(m))       return `<span class="json-null">${m}</span>`;
        return `<span class="json-num">${m}</span>`;
      }
    )
    .replace(/([{}\[\],:])/g, `<span class="json-punct">$1</span>`);
}

// ── KV Editor ─────────────────────────────────────────────────────────────
interface KVEditorProps {
  rows: KVRow[];
  setRows: (r: KVRow[]) => void;
}

const KVEditor: FC<KVEditorProps> = ({ rows, setRows }) => {
  const next = useRef(100);
  const add    = (): void => setRows([...rows, { id: next.current++, key: "", value: "" }]);
  const remove = (id: number): void => setRows(rows.filter(r => r.id !== id));
  const update = (id: number, f: "key" | "value", v: string): void =>
    setRows(rows.map(r => r.id === id ? { ...r, [f]: v } : r));

  return (
    <div className="panel-body">
      <div id="params-list">
        {rows.map(row => (
          <div key={row.id} className="kv-row">
            <input className="kv-input" placeholder="key"   value={row.key}   onChange={(e: ChangeEvent<HTMLInputElement>) => update(row.id, "key",   e.target.value)} />
            <input className="kv-input" placeholder="value" value={row.value} onChange={(e: ChangeEvent<HTMLInputElement>) => update(row.id, "value", e.target.value)} />
            <button className="kv-delete" onClick={() => remove(row.id)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={add}>+ ADD ROW</button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function NetrunnerClient() {
  const [method,     setMethod]     = useState<HttpMethod>("GET");
  const [url,        setUrl]        = useState("https://jsonplaceholder.typicode.com/users/10");
  const [activeTab,  setActiveTab]  = useState<TabId>("params");
  const [params,     setParams]     = useState<KVRow[]>([{ id: 1, key: "", value: "" }]);
  const [headers,    setHeaders]    = useState<KVRow[]>([{ id: 1, key: "Content-Type", value: "application/json" }]);
  const [body,       setBody]       = useState("");
  const [authToken,  setAuthToken]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [response,   setResponse]   = useState<ResponseState | null>(null);
  const [activeHist, setActiveHist] = useState(0);

  const sendRequest = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResponse(null);
    const hdrs: Record<string, string> = {};
    headers.forEach(h => { if (h.key) hdrs[h.key] = h.value; });
    if (authToken) hdrs["Authorization"] = `Bearer ${authToken}`;
    const start = performance.now();
    try {
      const opts: RequestInit = { method, headers: hdrs };
      if (["POST","PUT","PATCH"].includes(method) && body) opts.body = body;
      const res  = await fetch(url, opts);
      const text = await res.text();
      setResponse({ status: res.status, statusText: res.statusText, body: text, time: Math.round(performance.now() - start), size: new Blob([text]).size });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setResponse({ status: 0, statusText: "ERROR", body: `// NETWORK ERROR\n\n${msg}`, time: 0, size: 0 });
    }
    setLoading(false);
  }, [url, method, headers, body, authToken]);

  // ── Response HTML ──
  let responseHtml = "";
  if (response) {
    if (response.status === 0) {
      responseHtml = `<div class="error-state">${response.body}</div>`;
    } else {
      try {
        const parsed = JSON.parse(response.body);
        responseHtml = `<pre>${highlight(JSON.stringify(parsed, null, 2))}</pre>`;
      } catch {
        responseHtml = `<pre style="color:#c8e8f0">${response.body}</pre>`;
      }
    }
  }

  const statusCls = response
    ? response.status < 300 ? "status-200"
    : response.status < 500 ? "status-4xx"
    : "status-5xx"
    : "";

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── HEADER ── */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon" />
            NETRUNNER
          </div>
          <span className="logo-sep">//</span>
          <span className="header-subtitle">REST CLIENT v2.077</span>
          <div className="header-right">
            <div className="status-dot" />
            <span className="status-text">ONLINE</span>
          </div>
        </header>

        <div className="layout">

          {/* ── SIDEBAR ── */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">// Recent</div>
              {HISTORY.map((h, i) => (
                <div
                  key={i}
                  className={`sidebar-item${activeHist === i ? " active" : ""}`}
                  onClick={() => { setActiveHist(i); setMethod(h.method); setUrl(h.url); }}
                >
                  <span className={`method-badge badge-${h.method.toLowerCase()}`}>
                    {h.method === "DELETE" ? "DEL" : h.method}
                  </span>
                  <span className="sidebar-path">{h.path}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="main">

            {/* URL BAR */}
            <div className="url-bar">
              <div className="method-select">
                <select
                  value={method}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setMethod(e.target.value as HttpMethod)}
                  className={`method-${method.toLowerCase()}`}
                >
                  {(["GET","POST","PUT","PATCH","DELETE"] as HttpMethod[]).map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="url-input-wrap">
                <input
                  className="url-input"
                  value={url}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && sendRequest()}
                  placeholder="https://api.target.net/endpoint"
                />
              </div>
              <button
                className={`send-btn${loading ? " loading" : ""}`}
                onClick={sendRequest}
                disabled={loading}
              >
                {loading ? "⟳ SENDING" : "▶ SEND"}
              </button>
            </div>

            {/* LOADING BAR */}
            <div className={`loading-bar${loading ? " active" : ""}`} />

            {/* CONTENT */}
            <div className="content">

              {/* REQUEST PANEL */}
              <div className="panel">
                <div className="panel-tabs">
                  {(["params","headers","body","auth"] as TabId[]).map(t => (
                    <div
                      key={t}
                      className={`panel-tab${activeTab === t ? " active" : ""}`}
                      onClick={() => setActiveTab(t)}
                    >
                      {t.toUpperCase()}
                    </div>
                  ))}
                </div>

                {activeTab === "params"  && <KVEditor rows={params}  setRows={setParams}  />}
                {activeTab === "headers" && <KVEditor rows={headers} setRows={setHeaders} />}
                {activeTab === "body" && (
                  <div className="panel-body">
                    <textarea
                      className="body-editor"
                      value={body}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                      placeholder='{ "key": "value" }'
                    />
                  </div>
                )}
                {activeTab === "auth" && (
                  <div className="panel-body">
                    <div className="kv-row">
                      <input
                        className="kv-input"
                        placeholder="Bearer token"
                        value={authToken}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setAuthToken(e.target.value)}
                        style={{ gridColumn: "1 / -1" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* RESPONSE PANEL */}
              <div className="response-panel">
                <div className="response-header">
                  <span className="response-title">// Response</span>
                  {response && (
                    <div className="response-meta">
                      <span className={`status-badge ${statusCls}`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="meta-item"><span>{response.time}ms</span></span>
                      <span className="meta-item"><span>{response.size}B</span></span>
                    </div>
                  )}
                </div>
                <div className="response-body">
                  {!response ? (
                    <div className="empty-state">
                      <div className="empty-icon" />
                      <div className="empty-text">Awaiting transmission</div>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: responseHtml }} />
                  )}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── All CSS (pixel-perfect match to original HTML) ─────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #020408;
    color: #c8e8f0;
    font-family: 'Share Tech Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  /* scanlines */
  .app::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
    pointer-events: none; z-index: 9999;
  }

  /* grid */
  .app::after {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  /* ── HEADER ── */
  .header {
    display: flex; align-items: center; gap: 24px;
    padding: 0 20px; height: 48px; flex-shrink: 0;
    background: #060c12; border-bottom: 1px solid #0d2d3d;
    position: relative; overflow: hidden; z-index: 10;
  }

  .header::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #00f5ff, #ff006e, transparent);
    animation: scanH 4s linear infinite;
  }

  @keyframes scanH { 0%,100%{opacity:0.3} 50%{opacity:1} }

  .logo {
    font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 900;
    color: #00f5ff; letter-spacing: 4px;
    text-shadow: 0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.4);
    display: flex; align-items: center; gap: 10px;
    animation: glitch 6s ease-in-out infinite;
  }

  @keyframes glitch {
    0%,100%{ text-shadow: 0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.4); }
    25%{ text-shadow: -2px 0 #ff006e, 2px 0 #00f5ff, 0 0 20px #00f5ff; }
    75%{ text-shadow: 2px 0 #ff006e, -2px 0 #00f5ff, 0 0 20px #00f5ff; }
  }

  .logo-icon {
    width: 24px; height: 24px;
    border: 2px solid #00f5ff; transform: rotate(45deg);
    position: relative; box-shadow: 0 0 10px #00f5ff; flex-shrink: 0;
  }

  .logo-icon::before {
    content: ''; position: absolute; inset: 4px;
    background: #00f5ff; box-shadow: 0 0 8px #00f5ff;
  }

  .logo-sep { color: #2a4a5a; font-size: 12px; }

  .header-subtitle {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 500;
    color: #2a4a5a; letter-spacing: 3px; text-transform: uppercase;
  }

  .header-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }

  .status-dot {
    width: 6px; height: 6px; background: #00ff88;
    border-radius: 50%; box-shadow: 0 0 8px #00ff88;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .status-text {
    font-family: 'Rajdhani', sans-serif; font-size: 11px;
    color: #00b060; letter-spacing: 2px; text-transform: uppercase;
  }

  /* ── LAYOUT ── */
  .layout {
    display: grid; grid-template-columns: 220px 1fr;
    flex: 1; overflow: hidden; position: relative; z-index: 1;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    background: #060c12; border-right: 1px solid #0d2d3d; overflow-y: auto;
  }

  .sidebar::-webkit-scrollbar { width: 3px; }
  .sidebar::-webkit-scrollbar-track { background: #060c12; }
  .sidebar::-webkit-scrollbar-thumb { background: #00a8b0; }

  .sidebar-section { padding: 16px 12px; }

  .sidebar-label {
    font-family: 'Rajdhani', sans-serif; font-size: 10px; font-weight: 700;
    color: #2a4a5a; letter-spacing: 3px; text-transform: uppercase;
    padding: 0 8px; margin-bottom: 8px;
  }

  .sidebar-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 2px; cursor: pointer;
    border: 1px solid transparent; margin-bottom: 2px;
    transition: all 0.15s; position: relative; overflow: hidden;
  }

  .sidebar-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0;
    background: linear-gradient(90deg, rgba(0,245,255,0.15), transparent);
    transition: width 0.2s;
  }

  .sidebar-item:hover::before,
  .sidebar-item.active::before { width: 100%; }

  .sidebar-item:hover,
  .sidebar-item.active { border-color: #1a4a5a; background: #0a1520; }
  .sidebar-item.active  { border-color: rgba(0,245,255,0.3); }

  .sidebar-path { font-size: 12px; color: #5a8a9a; }

  /* ── METHOD BADGES ── */
  .method-badge {
    font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 2px;
    font-family: 'Orbitron', monospace; min-width: 36px; text-align: center; border: 1px solid;
  }

  .badge-get    { color:#00ff88; border-color:#00ff88; background:rgba(0,255,136,0.08); }
  .badge-post   { color:#ff9500; border-color:#ff9500; background:rgba(255,149,0,0.08); }
  .badge-put    { color:#00b4ff; border-color:#00b4ff; background:rgba(0,180,255,0.08); }
  .badge-patch  { color:#ff9500; border-color:#ff9500; background:rgba(255,149,0,0.08); }
  .badge-delete { color:#ff006e; border-color:#ff006e; background:rgba(255,0,110,0.08); }

  /* ── MAIN ── */
  .main {
    display: grid; grid-template-rows: auto 2px 1fr;
    overflow: hidden; background: #0a1520;
  }

  /* ── URL BAR ── */
  .url-bar {
    display: flex; gap: 12px; align-items: center;
    padding: 16px 20px; background: #060c12; border-bottom: 1px solid #0d2d3d;
  }

  .method-select { position: relative; }

  .method-select select {
    appearance: none; background: #0d1e2e;
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    padding: 10px 32px 10px 14px; border-radius: 2px; cursor: pointer;
    letter-spacing: 1px; outline: none; border: 1px solid; transition: all 0.2s;
  }

  .method-select select.method-get    { color:#00ff88; border-color:rgba(0,255,136,0.4); box-shadow:0 0 12px rgba(0,255,136,0.1); }
  .method-select select.method-post   { color:#ff9500; border-color:rgba(255,149,0,0.4); box-shadow:0 0 12px rgba(255,149,0,0.1); }
  .method-select select.method-put    { color:#00b4ff; border-color:rgba(0,180,255,0.4); box-shadow:0 0 12px rgba(0,180,255,0.1); }
  .method-select select.method-patch  { color:#ff9500; border-color:rgba(255,149,0,0.4); box-shadow:0 0 12px rgba(255,149,0,0.1); }
  .method-select select.method-delete { color:#ff006e; border-color:rgba(255,0,110,0.4); box-shadow:0 0 12px rgba(255,0,110,0.1); }

  .method-select::after {
    content: '▾'; position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%); color: #00f5ff; pointer-events: none; font-size: 10px;
  }

  .url-input-wrap { flex: 1; position: relative; }

  .url-input-wrap::before {
    content: '//'; position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); color: #2a4a5a; font-size: 13px; pointer-events: none;
  }

  .url-input {
    width: 100%; background: #0d1e2e; border: 1px solid #1a4a5a; color: #00f5ff;
    font-family: 'Share Tech Mono', monospace; font-size: 13px;
    padding: 10px 14px 10px 36px; border-radius: 2px; outline: none;
    transition: all 0.2s; box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
  }

  .url-input::placeholder { color: #2a4a5a; }
  .url-input:focus {
    border-color: rgba(0,245,255,0.5);
    box-shadow: 0 0 20px rgba(0,245,255,0.1), inset 0 0 20px rgba(0,0,0,0.3);
  }

  .send-btn {
    background: transparent; border: 1px solid #00f5ff; color: #00f5ff;
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    padding: 10px 24px; border-radius: 2px; cursor: pointer; letter-spacing: 2px;
    text-transform: uppercase; position: relative; overflow: hidden;
    transition: all 0.2s; box-shadow: 0 0 15px rgba(0,245,255,0.1);
  }

  .send-btn::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(0,245,255,0.15);
    transform: translateX(-100%); transition: transform 0.3s;
  }

  .send-btn:hover::before { transform: translateX(0); }
  .send-btn:hover { box-shadow: 0 0 25px rgba(0,245,255,0.3); text-shadow: 0 0 10px #00f5ff; }

  .send-btn.loading { animation: btnPulse 0.8s ease-in-out infinite; }

  @keyframes btnPulse {
    0%,100%{ border-color:#00f5ff; color:#00f5ff; }
    50%{ border-color:#ff006e; color:#ff006e; box-shadow:0 0 20px rgba(255,0,110,0.3); }
  }

  /* ── LOADING BAR ── */
  .loading-bar { height: 2px; background: transparent; }
  .loading-bar.active {
    background: linear-gradient(90deg, transparent, #00f5ff, #ff006e, transparent);
    background-size: 200% 100%;
    animation: loadBar 0.8s linear infinite;
  }
  @keyframes loadBar { 0%{background-position:-100% 0} 100%{background-position:200% 0} }

  /* ── CONTENT ── */
  .content { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }

  .panel { display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid #0d2d3d; }

  .panel-tabs {
    display: flex; border-bottom: 1px solid #0d2d3d;
    background: #060c12; padding: 0 20px;
  }

  .panel-tab {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 600;
    color: #2a4a5a; letter-spacing: 2px; text-transform: uppercase;
    padding: 12px 16px; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.2s;
  }

  .panel-tab:hover { color: #5a8a9a; }
  .panel-tab.active { color: #00f5ff; border-bottom-color: #00f5ff; text-shadow: 0 0 8px #00f5ff; }

  .panel-body { flex: 1; padding: 20px; overflow-y: auto; }
  .panel-body::-webkit-scrollbar { width: 3px; }
  .panel-body::-webkit-scrollbar-thumb { background: #00a8b0; }

  /* ── KV EDITOR ── */
  .kv-row {
    display: grid; grid-template-columns: 1fr 1fr 32px;
    gap: 8px; margin-bottom: 8px; align-items: center;
  }

  .kv-input {
    background: #0d1e2e; border: 1px solid #0d2d3d; color: #c8e8f0;
    font-family: 'Share Tech Mono', monospace; font-size: 12px;
    padding: 8px 12px; border-radius: 2px; outline: none; transition: border-color 0.2s;
  }

  .kv-input::placeholder { color: #2a4a5a; }
  .kv-input:focus { border-color: #00a8b0; }

  .kv-delete {
    background: transparent; border: 1px solid #0d2d3d; color: #2a4a5a;
    width: 32px; height: 32px; border-radius: 2px; cursor: pointer; font-size: 16px;
    transition: all 0.2s; display: flex; align-items: center; justify-content: center;
  }

  .kv-delete:hover { border-color: #ff006e; color: #ff006e; }

  .add-row-btn {
    background: transparent; border: 1px dashed #1a4a5a; color: #2a4a5a;
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 2px; padding: 8px; width: 100%; cursor: pointer;
    border-radius: 2px; text-transform: uppercase; margin-top: 4px; transition: all 0.2s;
  }

  .add-row-btn:hover { border-color: #00f5ff; color: #00f5ff; }

  /* ── BODY EDITOR ── */
  .body-editor {
    width: 100%; height: 100%; min-height: 200px;
    background: #0d1e2e; border: 1px solid #0d2d3d; color: #00ff88;
    font-family: 'Share Tech Mono', monospace; font-size: 12px;
    padding: 14px; border-radius: 2px; outline: none; resize: none; line-height: 1.6;
  }

  .body-editor:focus { border-color: #00a8b0; }
  .body-editor::placeholder { color: #2a4a5a; }

  /* ── RESPONSE PANEL ── */
  .response-panel { display: flex; flex-direction: column; overflow: hidden; }

  .response-header {
    display: flex; align-items: center; gap: 16px;
    padding: 0 20px; border-bottom: 1px solid #0d2d3d;
    background: #060c12; min-height: 44px;
  }

  .response-title {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700;
    color: #2a4a5a; letter-spacing: 3px; text-transform: uppercase;
  }

  .response-meta { margin-left: auto; display: flex; gap: 16px; align-items: center; }

  .status-badge {
    font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 2px; letter-spacing: 1px; border: 1px solid;
  }

  .status-200 { color:#00ff88; border-color:#00ff88; background:rgba(0,255,136,0.08); box-shadow:0 0 10px rgba(0,255,136,0.15); }
  .status-4xx { color:#ff006e; border-color:#ff006e; background:rgba(255,0,110,0.08); }
  .status-5xx { color:#ffe600; border-color:#ffe600; background:rgba(255,230,0,0.08); }

  .meta-item { font-size: 11px; color: #2a4a5a; font-family: 'Rajdhani', sans-serif; font-weight: 500; letter-spacing: 1px; }
  .meta-item span { color: #5a8a9a; }

  .response-body { flex: 1; padding: 20px; overflow-y: auto; font-size: 12px; line-height: 1.7; }
  .response-body::-webkit-scrollbar { width: 3px; }
  .response-body::-webkit-scrollbar-thumb { background: #00a8b0; }

  .response-body pre {
    white-space: pre-wrap; word-break: break-all;
    font-family: 'Share Tech Mono', monospace; font-size: 12px; line-height: 1.7;
  }

  /* ── JSON HIGHLIGHT ── */
  .json-key   { color: #c8e8f0; }
  .json-str   { color: #00ff88; }
  .json-num   { color: #00f5ff; }
  .json-bool  { color: #ffe600; }
  .json-null  { color: #ff006e; }
  .json-punct { color: #2a4a5a; }

  /* ── EMPTY STATE ── */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; gap: 16px; opacity: 0.3;
  }

  .empty-icon {
    width: 48px; height: 48px; border: 2px solid #00f5ff;
    transform: rotate(45deg); position: relative;
  }

  .empty-icon::before {
    content: ''; position: absolute; inset: 10px; border: 2px solid #00f5ff;
  }

  .empty-text {
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase; color: #5a8a9a;
  }

  /* ── ERROR STATE ── */
  .error-state {
    color: #ff006e; font-family: 'Share Tech Mono', monospace; font-size: 12px;
    padding: 16px; border: 1px solid rgba(255,0,110,0.3); border-radius: 2px;
    background: rgba(255,0,110,0.05); line-height: 1.6; white-space: pre-wrap;
  }

  select option { background: #0d1e2e; color: #c8e8f0; }
`;
