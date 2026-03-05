# Vortex - REST Client

A desktop REST Client application built with React, TypeScript, and Electron.

## Features

- Send HTTP requests (GET, POST, PUT, DELETE, PATCH)
- Request management with tabs (Params, Headers, Body, Auth)
- Response viewer with Body, Headers, and Timeline tabs
- Collections to organize and save requests
- History tracking with date grouping
- Search functionality for collections and history
- Import/Export collections as JSON
- Multiple themes: Cyberpunk, One Dark, Light
- Resizable sidebar with width persistence
- Response panel layout toggle (side-by-side or bottom)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Desktop**: Electron 40
- **Build**: Vite 6
- **State Management**: Zustand
- **Architecture**: Clean Architecture
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended) or npm

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Run in development mode
yarn electron:dev
```

### Build

```bash
# Build for production
yarn electron:build
```

The executable will be created in `release/win-unpacked/Vortex.exe`

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
│   ├── components/         # Presentation layer (UI)
│   │   ├── layout/         # Layout components
│   │   │   ├── TitleBar.tsx
│   │   │   └── BottomBar.tsx
│   │   ├── request/        # Request editor components
│   │   │   ├── UrlBar.tsx
│   │   │   ├── ParamsEditor.tsx      # Query parameters editor
│   │   │   ├── HeadersEditor.tsx
│   │   │   ├── BodyEditor.tsx
│   │   │   └── AuthEditor.tsx
│   │   ├── response/       # Response display
│   │   │   └── ResponsePanel.tsx
│   │   └── shared/         # Shared components
│   │       ├── Sidebar.tsx       # Collections & history sidebar
│   │       ├── TabBar.tsx        # Request tabs
│   │       ├── EnvPanel.tsx      # Environment variables
│   │       └── SettingsPanel.tsx # Theme & settings
│   │
│   ├── themes/             # CSS theme files
│   │   ├── cyberpunk.css   # Cyberpunk theme (default)
│   │   ├── one-dark.css   # One Dark Pro theme
│   │   └── light.css      # Light theme
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
├── vite.config.ts         # Vite configuration
├── tsconfig.json
├── AGENTS.md             # Agent instructions
├── DEVELOPER_GUIDE.md    # Developer documentation
└── CHANGELOG.md          # Version history
```

## Clean Architecture Layers

### 1. Domain Layer (`src/domain/`)
- **Types**: Pure TypeScript interfaces (no dependencies)
- **Constants**: App-wide constants like default settings, theme names

### 2. Application Layer (`src/application/`)
- **Stores**: Zustand stores managing application state
- **Hooks**: Business logic like `useRequestExecution.ts`

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Storage**: LocalStorage wrapper for persistence
- **Electron API**: HttpClient class that wraps Electron IPC

### 4. Presentation Layer (`src/components/`)
- React components
- UI logic and presentation
- Event handlers that delegate to application layer

## Keyboard Shortcuts

- `Ctrl+Enter` - Send request
- `Ctrl+N` - New request

## License

MIT
