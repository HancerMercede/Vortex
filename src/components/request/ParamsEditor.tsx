import { useRequestStore } from '../../application/stores/requestStore';

export function ParamsEditor() {
  const params = useRequestStore((state) => state.params) || [];
  const addParam = useRequestStore((state) => state.addParam);
  const updateParam = useRequestStore((state) => state.updateParam);
  const deleteParam = useRequestStore((state) => state.deleteParam);

  return (
    <div className="panel-body">
      <div id="params-list">
        {params.map((p) => (
          <div key={p.id} className="kv-row">
            <input
              className="kv-input"
              placeholder="key"
              value={p.key}
              onChange={(e) => updateParam(p.id, { ...p, key: e.target.value })}
            />
            <input
              className="kv-input"
              placeholder="value"
              value={p.value}
              onChange={(e) => updateParam(p.id, { ...p, value: e.target.value })}
            />
            <button className="kv-delete" onClick={() => deleteParam(p.id)}>×</button>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={addParam}>+ ADD ROW</button>
    </div>
  );
}
