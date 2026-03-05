import { useRequestStore } from '../../application/stores/requestStore';

export function HeadersEditor() {
  const headers = useRequestStore((state) => state.headers) || [];
  const addHeader = useRequestStore((state) => state.addHeader);
  const updateHeader = useRequestStore((state) => state.updateHeader);
  const deleteHeader = useRequestStore((state) => state.deleteHeader);

  return (
    <div className="panel-body">
      <div id="headers-list">
        {headers.map((h) => (
          <div key={h.id} className="kv-row">
            <input
              className="kv-input"
              placeholder="key"
              value={h.key}
              onChange={(e) => updateHeader(h.id, { ...h, key: e.target.value })}
            />
            <input
              className="kv-input"
              placeholder="value"
              value={h.value}
              onChange={(e) => updateHeader(h.id, { ...h, value: e.target.value })}
            />
            <button className="kv-delete" onClick={() => deleteHeader(h.id)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={addHeader}>+ ADD ROW</button>
    </div>
  );
}
