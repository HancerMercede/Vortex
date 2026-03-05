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
src/
├── domain/           # Types, constants, utilities
├── application/      # Stores, hooks
├── infrastructure/  # Electron API, storage
├── components/       # UI components
│   ├── layout/      # TitleBar, BottomBar
│   ├── request/     # UrlBar, ParamsEditor, HeadersEditor, BodyEditor, AuthEditor
│   ├── response/    # ResponsePanel
│   └── shared/      # Sidebar, TabBar, EnvPanel, SettingsPanel
└── themes/          # CSS themes (cyberpunk, one-dark, light)
electron/
├── main.cjs         # Electron main process
└── preload.cjs      # IPC bridge
```

## Keyboard Shortcuts

- `Ctrl+Enter` - Send request
- `Ctrl+N` - New request

## License

MIT
