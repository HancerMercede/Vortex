# Vortex - REST Client Application

## Project Overview
- **Type**: Desktop REST Client (Electron + React + TypeScript + Vite)
- **Architecture**: Clean Architecture (domain/application/infrastructure/presentation)
- **Package Manager**: Yarn

## Theme System
Themes are stored in `src/themes/` as CSS files:
- `cyberpunk.css` - Default theme (matches NetrunnerClient.tsx exactly)
- `one-dark.css` - One Dark Pro theme
- `light.css` - Light theme

Themes are loaded via Vite's `?raw` import and applied using a `<style>` tag in the component.

## Running the App
```bash
npm run electron:dev
```

## Key Files
- `src/Vortex.tsx` - Main app component
- `src/themes/cyberpunk.css` - Cyberpunk theme styles
- `src/domain/constants/index.ts` - Default settings (theme: 'cyberpunk')
- `src/components/` - UI components (layout, request, response, shared)

## Components Structure
```
src/components/
├── layout/        - TitleBar, BottomBar
├── request/       - UrlBar, ParamsEditor, HeadersEditor, BodyEditor, AuthEditor
├── response/      - ResponsePanel
└── shared/        - Sidebar, TabBar, EnvPanel, SettingsPanel
```

## State Management
- `src/application/stores/settingsStore.ts` - Settings, environments, panels state
- `src/application/stores/requestStore.ts` - Request/response state

## Theme Switching
Theme is stored in settings and can be changed via SettingsPanel. The theme CSS is applied dynamically in Vortex.tsx using:
```tsx
<style>{THEMES[theme]}</style>
```