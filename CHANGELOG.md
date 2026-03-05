# Vortex - REST Client Changelog

## Project Overview
- **Name**: Vortex
- **Type**: Desktop REST Client Application
- **Tech Stack**: React + TypeScript + Electron + Vite
- **Package Manager**: Yarn
- **Architecture**: Clean Architecture (domain/application/infrastructure/presentation layers)

---

## History

### 2026-03-01 - Project Setup & Architecture
- Initialized React + Vite + TypeScript project
- Set up Electron for desktop capabilities
- Created Clean Architecture folder structure:
  - `src/domain/` - Types, constants, utilities
  - `src/application/` - Stores, hooks
  - `src/infrastructure/` - Electron API, storage
  - `src/components/` - UI components (layout, request, response, shared)

### 2026-03-01 - Tauri to Electron Migration
- Started with Tauri (Rust backend)
- Encountered MSVC linker issues during build
- Migrated to Electron for simpler build process

### 2026-03-02 - Component Implementation
- Created all UI components as `.tsx` files:
  - **Layout**: TitleBar, BottomBar
  - **Request**: UrlBar, ParamsEditor, HeadersEditor, BodyEditor, AuthEditor
  - **Response**: ResponsePanel
  - **Shared**: Sidebar, TabBar, ResizablePanel, EnvPanel, SettingsPanel
- Implemented state management with Zustand stores:
  - `requestStore.ts` - Request state
  - `settingsStore.ts` - Settings & environments

### 2026-03-02 - Feature Implementation
- ENV panel with environment variables management
- SETTINGS panel with timeout, SSL, proxy, import/export options
- PARAMS tab for query parameters (KV Editor)
- AUTH types: Bearer Token, API Key, Basic Auth
- Resizable panels functionality

### 2026-03-05 - Response Panel Layout & Design Fixes
- Added response panel position toggle (side-by-side or bottom) in Settings
- Made response panel resizable in bottom layout mode
- Fixed continuous border lines between panels (not cut)
- Unified tab styling between request and response panels
- Added Developer Guide (DEVELOPER_GUIDE.md)

---

### 2026-03-04 - Sidebar Improvements & Scrollbar Fixes
- Made search bar sticky at top while scrolling
- Hidden all scrollbars (X and Y) but kept scrolling functionality
- Sidebar width now persists after reload
- Fixed delete button z-index on recent history items
- Fixed X scrollbar appearing when resizing sidebar
- Updated all 3 themes (cyberpunk, one-dark, light)

---

### 2026-03-04 - Search, Import/Export & Bug Fixes
- Added search functionality to filter collections and history
- Added import/export collections as JSON
- Added duplicate request detection with toast notifications
- Fixed collection count showing 0 when searching by collection name
- Fixed expanded collection showing "No requests" when searching
- Updated CSS for all 3 themes (search input, gear icon, import/export menu)

---

### 2026-03-03 - Theme Implementation
- Started with One Dark Pro theme
- Applied cyberpunk theme from NetrunnerClient.tsx reference
- Renamed main files:
  - `Zephyr.jsx` → `Vortex.tsx`
  - `styles.js` → `styles.ts`
- Fixed PARAMS section - converted from inline styles to CSS classes matching NetrunnerClient.tsx
- Fixed HEADERS section - converted from inline styles to CSS classes matching NetrunnerClient.tsx
- Fixed empty response state - changed to "Awaiting transmission" to match NetrunnerClient.tsx
- Added theme switching between Cyberpunk and One Dark Pro in settings
- Default headers set to `Content-Type: application/json`

### 2026-03-03 - Git Setup
- Created `.gitignore` file
- Encountered Windows "nul" file conflict during git init
- User opted to handle git initialization manually

---

## File Structure
```
D:/Projects/Vortex/
├── src/
│   ├── Vortex.tsx                    # Main app component
│   ├── NetrunnerClient.tsx           # Cyberpunk theme reference
│   ├── main.tsx                      # Entry point
│   ├── domain/
│   │   ├── types/index.ts            # TypeScript interfaces
│   │   ├── constants/index.ts        # App constants
│   │   ├── utils.ts                  # Utility functions
│   │   └── index.ts                  # Domain exports
│   ├── application/
│   │   ├── stores/
│   │   │   ├── requestStore.ts       # Request state management
│   │   │   └── settingsStore.ts      # Settings & environments
│   │   └── hooks/
│   │       └── useRequestExecution.ts
│   ├── infrastructure/
│   │   ├── electron/api.ts           # HTTP client
│   │   └── storage/index.ts          # LocalStorage utilities
│   └── components/
│       ├── layout/
│       │   ├── TitleBar.tsx
│       │   └── BottomBar.tsx
│       ├── request/
│       │   ├── UrlBar.tsx
│       │   ├── ParamsEditor.tsx
│       │   ├── HeadersEditor.tsx
│       │   ├── BodyEditor.tsx
│       │   └── AuthEditor.tsx
│       ├── response/
│       │   └── ResponsePanel.tsx
│       └── shared/
│           ├── Sidebar.tsx
│           ├── TabBar.tsx
│           ├── ResizablePanel.tsx
│           ├── EnvPanel.tsx
│           └── SettingsPanel.tsx
├── electron/
│   ├── main.cjs                      # Electron main process
│   └── preload.cjs                   # IPC bridge
└── package.json
```

---

## Next Steps
1. Fix PARAMS section styles in Vortex.tsx to exactly match NetrunnerClient.tsx
2. Verify all components are using cyberpunk CSS classes correctly
3. Test the app to ensure everything renders properly

---

### 2026-03-03 - Theme System & UI Refinements

**Theme System Implementation**
- Created `src/themes/` directory with separate CSS files:
  - `cyberpunk.css` - Default cyberpunk theme (matches NetrunnerClient.tsx exactly)
  - `one-dark.css` - One Dark Pro theme
  - `light.css` - Light theme
- Themes loaded via Vite's `?raw` import and applied dynamically
- Theme switching works via Settings panel

**UI Refinements**
- Method badges now have consistent width (56px) across all themes
- HTTP methods colored in dropdown and sidebar:
  - GET: green (#00ff88)
  - POST: orange (#ff9500)
  - PUT: yellow (#ffe600)
  - DELETE: red (#ff0040)
- Dropdown options colored by method in all themes
- Sidebar resizable (150px-400px range)
- env-btn and settings-btn styled consistently across all themes

**Bug Fixes**
- Fixed response headers not showing - now properly captures all response headers
- Fixed sidebar history item display using proper CSS classes
- Fixed modal/panel components to work with stores instead of props

**Components Updated**
- Sidebar.tsx - Added resize functionality, connects to store
- TabBar.tsx - Connects to requestStore
- UrlBar.tsx - Full HTTP request functionality with headers
- ParamsEditor.tsx, HeadersEditor.tsx, BodyEditor.tsx, AuthEditor.tsx - Connected to store
- ResponsePanel.tsx - Response display with BODY/HEADERS/TIMELINE tabs

---

### 2026-03-04 - Recent History Delete Functionality

**History Item Delete**
- Added delete button to recent history items (appears on hover)
- Fixed overflow:hidden clipping issue in One Dark and Light themes
- Delete button styled consistently in all 3 themes

---

### 2026-03-04 - Collection Delete Functionality

**Collection Management**
- Added delete button to remove entire collection (appears on hover)
- Added delete button to remove individual requests from collection (appears on hover)
- Delete buttons styled consistently in all 3 themes

---

### 2026-03-04 - Collections Feature

**New Feature - Collections**
- Created `Collection` and `CollectionRequest` types in domain/types
- Added COLLECTIONS storage key for localStorage persistence
- Added collection state and actions to requestStore:
  - createCollection, deleteCollection, renameCollection
  - addRequestToCollection, deleteRequestFromCollection, updateRequestInCollection
  - loadRequestFromCollection
- Updated Sidebar component with:
  - Collections section with expand/collapse functionality
  - Create new collection form
  - Save current request to collection
  - Delete collection and individual requests

**History Grouping by Date**
- History now grouped by date: "Today", "Yesterday", "March 4" format
- Added groupedHistory computed in Sidebar using useMemo

**Sidebar UI Improvements**
- Split sidebar into two scrollable sections (collections and history)
- Visual divider between sections
- Collections max 50% height, history fills remaining

---

### 2026-03-04 - Theme Effects Alignment

**Logo Glow Effects**
- Added exact glitch animation (from cyberpunk) to One Dark and Light themes
- Added box-shadow and inner glow to logo-icon in all 3 themes
- One Dark uses #61afef with #e06c75 glitch color
- Light uses #0066cc with #e06c75 glitch color

**Status Dot Pulse**
- Added pulse animation to status-dot in One Dark and Light themes
- Matches cyberpunk's 2s ease-in-out infinite animation

**Files Modified**
- `src/themes/one-dark.css` - Logo glitch + status pulse
- `src/themes/light.css` - Logo glitch + status pulse

---

### 2026-03-04 - Sidebar CSS Structural Fix

**Sidebar CSS Fixes**
- Fixed `.layout` grid-template-columns from fixed `220px` to `auto` to enable resizer functionality in all 3 themes
- Added scrollbar styling to cyberpunk theme sidebar (height: 100%, scrollbar thumb color #00a8b0)
- Added `.sidebar-resizer` styles to One Dark and Light themes (was missing, resizer was invisible)
- Added `.sidebar-item::before` gradient sweep effect to One Dark and Light themes
- Added `.sidebar-item.active` state styles to One Dark and Light themes
- Added `.sidebar-item` position:relative and overflow:hidden to One Dark and Light themes

**Files Modified**
- `src/themes/cyberpunk.css` - Fixed .layout, added height:100% and scrollbar to .sidebar
- `src/themes/one-dark.css` - All 3 bug fixes applied
- `src/themes/light.css` - All 3 bug fixes applied

**Documentation**
- Created `sidebar-css-fix.md` with detailed fix instructions for all themes

---

## File Structure (Updated)
```
D:/Projects/Vortex/
├── src/
│   ├── Vortex.tsx                    # Main app component
│   ├── NetrunnerClient.tsx           # Cyberpunk theme reference
│   ├── themes/
│   │   ├── cyberpunk.css             # Cyberpunk theme
│   │   ├── one-dark.css              # One Dark Pro theme
│   │   └── light.css                  # Light theme
│   ├── main.tsx                      # Entry point
│   ├── domain/
│   ├── application/
│   │   └── stores/
│   │       ├── requestStore.ts       # Request state management
│   │       └── settingsStore.ts      # Settings & environments
│   ├── infrastructure/
│   └── components/
├── electron/
│   ├── main.cjs
│   └── preload.cjs
├── AGENTS.md                         # Development notes
├── CHANGELOG.md                      # This file
└── package.json
```