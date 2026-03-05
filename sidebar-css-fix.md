# Sidebar CSS — Structural Fix
> Aligning all 3 themes to the same structural baseline

---

## Classes used by the component

| Class | Purpose |
|---|---|
| `sidebar-container` | Outer flex wrapper (`display:flex; height:100%`) |
| `sidebar` | The `<aside>` with dynamic width via inline style |
| `sidebar-section` | Inner scroll area (`height:100%; overflow-y:auto`) |
| `sidebar-label` | Section heading |
| `sidebar-item` | Each history row — needs `position:relative; overflow:hidden` |
| `sidebar-item.active` | Selected item highlight state |
| `sidebar-item::before` | Gradient sweep on hover/active |
| `sidebar-path` | URL text inside each item |
| `sidebar-empty` | Empty state message |
| `sidebar-resizer` | 4px drag handle on the right edge |

---

## Bugs Found

### Bug 1 — All 3 themes: `.layout` uses fixed column width

`.layout` has `grid-template-columns: 220px 1fr`. This hardcodes the sidebar width and makes the resizer useless — dragging it changes the `<aside>` inline style but the grid never follows.

| | |
|---|---|
| **Current** | `grid-template-columns: 220px 1fr` |
| **Fix** | `grid-template-columns: auto 1fr` |

---

### Bug 2 — One Dark & One Light: `.sidebar-resizer` missing

The drag handle has no CSS in these two themes. It renders as a 0×0 invisible element with no cursor change.

---

### Bug 3 — One Dark & One Light: `.sidebar-item` missing position and pseudo-element

The `.sidebar-item` rule lacks `position: relative` and `overflow: hidden`, and there is no `.sidebar-item::before` rule for the gradient sweep. The `.sidebar-item.active` state is also missing.

---

## Fixes per Theme

### Theme 1 · Cyberpunk

Only Bug 1 applies. The resizer, `sidebar-item::before`, and active state are already defined correctly.

```css
/* BEFORE */
.layout {
  display: grid; grid-template-columns: 220px 1fr;
  flex: 1; overflow: hidden; position: relative; z-index: 1;
}

/* AFTER — change only grid-template-columns */
.layout {
  display: grid; grid-template-columns: auto 1fr;
  flex: 1; overflow: hidden; position: relative; z-index: 1;
}
```

---

### Theme 2 · One Dark

Apply all 3 bugs.

#### 1 — Fix `.layout`

```css
/* BEFORE */
.layout { display: grid; grid-template-columns: 220px 1fr; flex: 1; overflow: hidden; }

/* AFTER */
.layout { display: grid; grid-template-columns: auto 1fr; flex: 1; overflow: hidden; }
```

#### 2 — Fix `.sidebar-item` (add position + overflow)

```css
/* BEFORE */
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 2px; cursor: pointer;
  border: 1px solid transparent; margin-bottom: 2px; transition: all 0.15s;
}

/* AFTER — add position:relative and overflow:hidden */
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 2px; cursor: pointer;
  border: 1px solid transparent; margin-bottom: 2px;
  transition: all 0.15s; position: relative; overflow: hidden;
}
```

#### 3 — Add `.sidebar-item::before`, `.sidebar-item.active`, `.sidebar-resizer`

```css
/* ADD — gradient sweep on hover/active */
.sidebar-item::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0;
  background: linear-gradient(90deg, rgba(97,175,239,0.15), transparent);
  transition: width 0.2s;
}
.sidebar-item:hover::before,
.sidebar-item.active::before { width: 100%; }

/* ADD — active state */
.sidebar-item:hover,
.sidebar-item.active { border-color: #3e4451; background: #2c313a; }
.sidebar-item.active  { border-color: rgba(97,175,239,0.3); }

/* ADD — resizer handle */
.sidebar-resizer {
  width: 4px; background: transparent;
  cursor: col-resize; transition: background 0.2s; flex-shrink: 0;
}
.sidebar-resizer:hover { background: #61afef; }
```

---

### Theme 3 · One Light

Same 3 fixes as One Dark, adapted for light colors.

#### 1 — Fix `.layout`

```css
/* BEFORE */
.layout { display: grid; grid-template-columns: 220px 1fr; flex: 1; overflow: hidden; }

/* AFTER */
.layout { display: grid; grid-template-columns: auto 1fr; flex: 1; overflow: hidden; }
```

#### 2 — Fix `.sidebar-item` (add position + overflow)

```css
/* BEFORE */
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 2px; cursor: pointer;
  border: 1px solid transparent; margin-bottom: 2px; transition: all 0.15s;
}

/* AFTER */
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 2px; cursor: pointer;
  border: 1px solid transparent; margin-bottom: 2px;
  transition: all 0.15s; position: relative; overflow: hidden;
}
```

#### 3 — Add `.sidebar-item::before`, `.sidebar-item.active`, `.sidebar-resizer`

```css
/* ADD — gradient sweep on hover/active */
.sidebar-item::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0;
  background: linear-gradient(90deg, rgba(0,102,204,0.1), transparent);
  transition: width 0.2s;
}
.sidebar-item:hover::before,
.sidebar-item.active::before { width: 100%; }

/* ADD — active state */
.sidebar-item:hover,
.sidebar-item.active { border-color: #e5e5e5; background: #f0f0f0; }
.sidebar-item.active  { border-color: rgba(0,102,204,0.3); }

/* ADD — resizer handle */
.sidebar-resizer {
  width: 4px; background: transparent;
  cursor: col-resize; transition: background 0.2s; flex-shrink: 0;
}
.sidebar-resizer:hover { background: #0066cc; }
```

---

## Quick Reference

| Fix | Cyberpunk | One Dark | One Light |
|---|:---:|:---:|:---:|
| `.layout → auto 1fr` | ✅ Apply | ✅ Apply | ✅ Apply |
| `.sidebar-item` + `position` / `overflow` | Already correct | ✅ Apply | ✅ Apply |
| `.sidebar-item::before` | Already correct | ✅ Apply | ✅ Apply |
| `.sidebar-item.active` | Already correct | ✅ Apply | ✅ Apply |
| `.sidebar-resizer` | Already correct | ✅ Apply | ✅ Apply |
