import { useState, useRef, useEffect } from 'react';
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
  const isVerticalLayout = settings.responsePanelPosition === 'bottom';
  const [panelHeight, setPanelHeight] = useState(50);
  const panelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !panelRef.current) return;
      const container = panelRef.current.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const percentage = ((e.clientY - rect.top) / rect.height) * 100;
      setPanelHeight(Math.min(Math.max(percentage, 20), 80));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };
  
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
            
            <div 
              ref={panelRef}
              className={`content ${isVerticalLayout ? 'content-vertical' : 'content-horizontal'}`}
              style={isVerticalLayout ? { gridTemplateRows: `${panelHeight}% 6px 1fr` } : undefined}
            >
              <div className="panel">
                <TabBar />
                {renderRequestTab()}
              </div>
              
              {isVerticalLayout && (
                <div className="panel-resizer" onMouseDown={handleResizeStart} />
              )}
              
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
