import { useSettingsStore } from '../store';

export function EnvPanel() {
  const {
    environments,
    activeEnvironment,
    setActiveEnvironment,
    addEnvironment,
    deleteEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
    closePanels,
  } = useSettingsStore();

  const currentEnv = environments.find((e) => e.id === activeEnvironment) || environments[0];

  return (
    <div className="modal-overlay" onClick={closePanels}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">ENVIRONMENTS</span>
          <button className="close-btn" onClick={closePanels}>×</button>
        </div>

        <div className="env-selector">
          <select
            value={activeEnvironment}
            onChange={(e) => setActiveEnvironment(e.target.value)}
            className="kv-input"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
          <button
            className="add-btn"
            onClick={() => {
              const name = prompt('Environment name:');
              if (name) addEnvironment(name);
            }}
          >
            + NEW
          </button>
          {environments.length > 1 && (
            <button
              className="add-btn delete"
              onClick={() => {
                if (confirm('Delete this environment?')) deleteEnvironment(activeEnvironment);
              }}
            >
              DELETE
            </button>
          )}
        </div>

        <div className="env-header">
          <span>VARIABLE</span>
          <span>VALUE</span>
          <span></span>
        </div>

        <div className="env-list">
          {currentEnv?.variables.map((variable) => (
            <div key={variable.id} className="env-row">
              <input
                type="checkbox"
                checked={variable.enabled}
                onChange={(e) => updateVariable(currentEnv.id, variable.id, { enabled: e.target.checked })}
              />
              <input
                type="text"
                className="kv-input"
                placeholder="variable_name"
                value={variable.key}
                onChange={(e) => updateVariable(currentEnv.id, variable.id, { key: e.target.value })}
              />
              <input
                type="text"
                className="kv-input"
                placeholder="value"
                value={variable.value}
                onChange={(e) => updateVariable(currentEnv.id, variable.id, { value: e.target.value })}
              />
              <button
                className="kv-delete"
                onClick={() => deleteVariable(currentEnv.id, variable.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          className="add-btn"
          onClick={() => addVariable(currentEnv?.id)}
        >
          + ADD VARIABLE
        </button>

        <div className="env-hint">
          Use &#123;&#123;variable&#125;&#125; in URL, headers, or body
        </div>
      </div>
    </div>
  );
}
