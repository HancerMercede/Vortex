# Vortex - Developer Guide

## Project Overview

**Vortex** is a desktop REST Client application built with Electron + React + TypeScript + Vite.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Desktop**: Electron 40
- **Build**: Vite 6
- **State Management**: Zustand
- **Architecture**: Clean Architecture
- **Package Manager**: Yarn

## Project Structure

```
Vortex/
├── electron/                 # Electron main process
│   ├── main.cjs             # Main process entry (window creation, IPC, HTTP requests)
│   └── preload.cjs          # Preload script (secure bridge between main & renderer)
│
├── src/
│   ├── domain/              # Domain layer (pure business logic)
│   │   ├── types/           # TypeScript interfaces
│   │   │   └── index.ts     # HistoryItem, Collection, Request types
│   │   └── constants/       # App constants
│   │       └── index.ts     # Default settings, theme names
│   │
│   ├── application/         # Application layer (use cases)
│   │   ├── stores/          # Zustand state stores
│   │   │   ├── requestStore.ts    # Request/response state, history, collections
│   │   │   └── settingsStore.ts   # Theme, environments, toast notifications
│   │   └── hooks/
│   │       └── useRequestExecution.ts  # Request execution logic
│   │
│   ├── infrastructure/     # Infrastructure layer
│   │   ├── storage/         # LocalStorage persistence
│   │   │   └── index.ts     # saveToStorage, loadFromStorage functions
│   │   └── electron/
│   │       └── api.ts       # HttpClient class for making HTTP requests
│   │
│   ├── presentation/       # Presentation layer (UI)
│   │   └── components/
│   │       ├── layout/      # Layout components
│   │       │   ├── TitleBar.tsx
│   │       │   └── BottomBar.tsx
│   │       ├── request/    # Request editor components
│   │       │   ├── UrlBar.tsx
│   │       │   ├── ParamsEditor.tsx      # Query parameters editor
│   │       │   ├── HeadersEditor.tsx
│   │       │   ├── BodyEditor.tsx
│   │       │   └── AuthEditor.tsx
│   │       ├── response/   # Response display
│   │       │   └── ResponsePanel.tsx
│   │       └── shared/     # Shared components
│   │           ├── Sidebar.tsx       # Collections & history sidebar
│   │           ├── TabBar.tsx        # Request tabs
│   │           ├── EnvPanel.tsx      # Environment variables
│   │           └── SettingsPanel.tsx # Theme & settings
│   │
│   ├── themes/             # CSS theme files
│   │   ├── cyberpunk.css   # Cyberpunk theme (default)
│   │   ├── one-dark.css   # One Dark Pro theme
│   │   └── light.css       # Light theme
│   │
│   ├── Vortex.tsx         # Main app component
│   └── main.tsx           # React entry point
│
├── dist/                   # Vite production build output
├── release/               # Electron packaged app
│   └── win-unpacked/
│       └── Vortex.exe     # Portable executable
│
├── package.json
├── vite.config.ts         # Vite configuration (base: './' required for Electron)
├── tsconfig.json
├── AGENTS.md             # Agent instructions
└── DEVELOPER_GUIDE.md    # This file
```

## Clean Architecture Layers

### 1. Domain Layer (`src/domain/`)
- **Types**: Pure TypeScript interfaces (no dependencies)
- **Constants**: App-wide constants like default settings, theme names

### 2. Application Layer (`src/application/`)
- **Stores**: Zustand stores managing application state
- **Hooks**: Business logic like `useRequestExecution.ts`
- Contains business logic for:
  - Making HTTP requests
  - Managing request history
  - Collections CRUD
  - Environment variables

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Storage**: LocalStorage wrapper for persistence
- **Electron API**: HttpClient class that wraps Electron IPC or fetch

### 4. Presentation Layer (`src/components/`)
- React components
- UI logic and presentation
- Event handlers that delegate to application layer

## Key Files

### Electron Main Process (`electron/main.cjs`)
- Creates BrowserWindow with Electron
- Handles menu bar
- IPC handler for HTTP requests (uses Node's http/https modules)
- Loads dev server in development, dist folder in production

### HttpClient (`src/infrastructure/electron/api.ts`)
- Wrapper for making HTTP requests
- Works in two modes:
  - In Electron: uses `window.electronAPI.httpRequest()` via IPC
  - In browser: uses native `fetch()`

### Request Execution (`src/application/hooks/useRequestExecution.ts`)
- Builds the full URL with query params
- Handles headers, body, authentication
- Executes request via HttpClient
- Adds successful requests to history

### State Management

**requestStore.ts** manages:
- Current request (url, method, headers, params, body, auth)
- Response data (status, body, headers, timing)
- Request history (stored in localStorage)
- Collections (stored in localStorage)
- Export/import collections as JSON

**settingsStore.ts** manages:
- Current theme (cyberpunk, one-dark, light)
- Environments (dev, staging, prod)
- Variable substitution in requests
- Toast notifications
- Panel visibility states
- Timeout & SSL verification settings

## Theme System

Themes are stored as CSS files in `src/themes/`. Each theme contains:
- Color scheme
- Component styling
- Scrollbar customization

The theme CSS is loaded dynamically and applied via a `<style>` tag in Vortex.tsx based on the selected theme in settings.

## Building for Production

```bash
# Development
npx vite build           # Build React app
npx electron-builder --win portable  # Package as exe
```

The exe is output to `release/win-unpacked/Vortex.exe`.

## Important Configuration

### vite.config.ts
```ts
export default defineConfig({
  base: './',  // Required for Electron - makes asset paths relative
  plugins: [react()],
})
```

### electron/main.cjs
```js
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

if (isDev) {
  mainWindow.loadURL('http://localhost:5173');
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}
```

## Common Issues

1. **React app not showing in production**: Ensure `base: './'` in vite.config.ts
2. **Asset paths broken**: Use relative paths (`./assets/`) not absolute (`/assets/`)
3. **Build fails**: Ensure no Electron processes are running before building

## Request Flow

1. User fills in URL, method, params, headers, body, auth in UI components
2. User clicks "Send" button in UrlBar
3. `useRequestExecution` hook builds full URL with query params
4. HttpClient sends request via Electron IPC (or fetch in browser)
5. Electron main process makes actual HTTP request using Node's http/https
6. Response is returned to renderer and stored in requestStore
7. ResponsePanel displays the response
8. Request is added to history in requestStore
