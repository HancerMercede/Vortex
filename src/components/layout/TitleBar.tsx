import { FC } from 'react';
import { useSettingsStore } from '../../application/stores';

export const TitleBar: FC = () => {
  const { toggleEnvPanel, toggleSettingsPanel, activeEnvironment, environments } = useSettingsStore();
  const currentEnv = environments.find(e => e.id === activeEnvironment);

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon" />
        VORTEX
      </div>
      <span className="logo-sep">//</span>
      <span className="header-subtitle">REST CLIENT v1.0</span>
      <div className="header-right">
        <button className="env-btn" onClick={toggleEnvPanel}>
          ENV {currentEnv ? `• ${currentEnv.name}` : ''}
        </button>
        <button className="settings-btn" onClick={toggleSettingsPanel}>
          SETTINGS
        </button>
      </div>
    </header>
  );
};