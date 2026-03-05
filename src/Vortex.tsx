import cyberpunkTheme from './themes/cyberpunk.css?raw';
import oneDarkTheme from './themes/one-dark.css?raw';
import lightTheme from './themes/light.css?raw';

import { TitleBar } from './components/layout/TitleBar';
import { BottomBar } from './components/layout/BottomBar';
import { Sidebar } from './components/shared/Sidebar';
import { TabBar } from './components/shared/TabBar';
import { EnvPanel } from './components/shared/EnvPanel';
import { SettingsPanel } from './components/shared/SettingsPanel';
import { UrlBar } from './components/request/UrlBar';
import { ParamsEditor } from './components/request/ParamsEditor';
import { HeadersEditor } from './components/request/HeadersEditor';
import { BodyEditor } from './components/request/BodyEditor';
import { AuthEditor } from './components/request/AuthEditor';
import { ResponsePanel } from './components/response/ResponsePanel';

import { useSettingsStore } from './application/stores/settingsStore';
import { useRequestStore } from './application/stores/requestStore';

const THEMES: Record<string, string> = {
  cyberpunk: cyberpunkTheme,
  'one-dark': oneDarkTheme,
  light: lightTheme,
};

export default function Vortex() {
  const { settings, showEnvPanel, showSettingsPanel, closePanels } = useSettingsStore();
  const { requestTab } = useRequestStore();
  
  const currentTheme = THEMES[settings.theme] || THEMES.cyberpunk;

  const renderRequestTab = () => {
    switch (requestTab) {
      case 'PARAMS':
        return <ParamsEditor />;
      case 'HEADERS':
        return <HeadersEditor />;
      case 'BODY':
        return <BodyEditor />;
      case 'AUTH':
        return <AuthEditor />;
      default:
        return <ParamsEditor />;
    }
  };

  return (
    <>
      <style>{currentTheme}</style>
      <div className="app">
        <TitleBar />
        
        <div className="layout">
          <Sidebar />
          
          <main className="main">
            <UrlBar />
            <div className="loading-bar" />
            
            <div className="content">
              <div className="panel">
                <TabBar />
                {renderRequestTab()}
              </div>
              
              <ResponsePanel />
            </div>
          </main>
        </div>

        <BottomBar />

        {showEnvPanel && <EnvPanel onClose={closePanels} />}
        {showSettingsPanel && <SettingsPanel onClose={closePanels} />}
      </div>
    </>
  );
}