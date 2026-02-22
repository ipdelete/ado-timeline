# Copilot Instructions — ADO Timeline

## Running

No build step. Serve `src/ui/` with any static file server:

```bash
cd src/ui && python3 -m http.server 8080
```

There are no tests or linters configured.

## Architecture

Vanilla JS app in `src/ui/` — three files, no framework, no bundler:

- **`index.html`** — shell with topbar and `#timeline` container
- **`styles.css`** — CSS custom properties for theming; timeline/card/badge system
- **`app.js`** — data store → UI state → helpers → render functions → init

The app currently uses a **fake data store** (`store.workItems` array in app.js) that mirrors real Azure DevOps REST API response shapes. When wiring up the live API, replace the store contents — the render functions consume the same field names the API returns.

## Key Conventions

### ADO field names as object keys

Work item objects use **real ADO reference names** as field keys (e.g., `System.Title`, `Microsoft.VSTS.Common.Priority`), not camelCase aliases. This is intentional — it matches the REST API response shape so the UI layer doesn't need a mapping step.

### Relations and comments follow API shape

Relations use the `$expand=relations` structure: `{ rel, url, attributes: { name } }`. Comments use the Comments API shape: `{ commentId, text, createdBy: { displayName }, createdDate }`. Keep this contract when adding real API calls.

### Status signal derivation

`stateToSignal(item)` maps work item state + tags to a timeline dot color. "Blocked" is detected from tags (not a state value) — check for `blocked` in `System.Tags`. The priority order is: blocked → closed/done/resolved → active → new.

### Sections, not tabs

Expanded cards render three scrollable **sections** (Details, Activity, Links) — not a tab switcher. This is a deliberate design choice since work items don't have workflow phases.

### Card expand/collapse

Uses CSS `grid-template-rows: 0fr → 1fr` animation. Only one card can be expanded at a time — expanding a new card collapses the previous one.

### UI Testing and Screenshots

Use **Playwright CLI** directly for UI testing and screenshots. Do not use MCP servers.

### Theming

All colors flow through CSS custom properties in `:root`. The badge system uses semantic classes: `ok`, `warn`, `danger`, `info`, `neutral`. Dots use `dot-ok`, `dot-warn`, `dot-danger`, `dot-new`.
