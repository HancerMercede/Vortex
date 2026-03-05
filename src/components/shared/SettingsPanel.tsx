import { useSettingsStore } from '../../application/stores/settingsStore';

export function SettingsPanel() {
  const { settings, setSettings, closePanels } = useSettingsStore();

  const updateSetting = (key: string, value: unknown) => {
    setSettings({ [key]: value });
  };

  const exportSettings = () => {
    const data = { settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vortex-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.settings) {
            setSettings(data.settings);
            alert('Settings imported successfully!');
          }
        } catch {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="modal-overlay" onClick={closePanels}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">SETTINGS</span>
          <button className="close-btn" onClick={closePanels}>×</button>
        </div>

        <div className="settings-section">
          <label className="settings-label">REQUEST TIMEOUT (MS)</label>
          <input
            type="number"
            className="kv-input"
            value={settings.timeout}
            onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 30000)}
          />
        </div>

        <div className="settings-section">
          <label className="settings-label checkbox">
            <input
              type="checkbox"
              checked={settings.sslVerification}
              onChange={(e) => updateSetting('sslVerification', e.target.checked)}
            />
            VERIFY SSL CERTIFICATES
          </label>
        </div>

        <div className="settings-section">
          <label className="settings-label">RESPONSE PANEL POSITION</label>
          <div className="layout-toggle">
            <button
              className={`layout-btn ${settings.responsePanelPosition === 'side' ? 'active' : ''}`}
              onClick={() => updateSetting('responsePanelPosition', 'side')}
            >
              ⬌ Side by Side
            </button>
            <button
              className={`layout-btn ${settings.responsePanelPosition === 'bottom' ? 'active' : ''}`}
              onClick={() => updateSetting('responsePanelPosition', 'bottom')}
            >
              ⬍ Bottom
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label className="settings-label checkbox">
            <input
              type="checkbox"
              checked={settings.proxy.enabled}
              onChange={(e) => updateSetting('proxy', { ...settings.proxy, enabled: e.target.checked })}
            />
            USE PROXY
          </label>
          {settings.proxy.enabled && (
            <div className="proxy-fields">
              <select
                className="kv-input"
                value={settings.proxy.protocol}
                onChange={(e) => updateSetting('proxy', { ...settings.proxy, protocol: e.target.value })}
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
              <input
                type="text"
                className="kv-input"
                placeholder="Host"
                value={settings.proxy.host}
                onChange={(e) => updateSetting('proxy', { ...settings.proxy, host: e.target.value })}
              />
              <input
                type="number"
                className="kv-input port"
                placeholder="Port"
                value={settings.proxy.port}
                onChange={(e) => updateSetting('proxy', { ...settings.proxy, port: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="settings-section">
          <label className="settings-label">THEME</label>
          <select
            className="kv-input"
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value)}
          >
            <option value="one-dark">One Dark Pro</option>
            <option value="light">Light</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        </div>

        <div className="settings-section">
          <label className="settings-label">FONT SIZE</label>
          <input
            type="range"
            min="11"
            max="18"
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
          />
          <span className="font-size-value">{settings.fontSize}px</span>
        </div>

        <div className="settings-section">
          <label className="settings-label">IMPORT / EXPORT</label>
          <div className="import-export">
            <button className="add-btn" onClick={importSettings}>
              IMPORT
            </button>
            <button className="add-btn" onClick={exportSettings}>
              EXPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
