# AI Notes — Log

## 2026-02-22
- architecture: Vanilla JS, no build step — three files in src/ui/ (index.html, styles.css, app.js). Modeled after directive-plane's structure.
- data model: Work item objects use real ADO REST API field reference names as keys (e.g., `System.Title`, not `title`). This eliminates a mapping layer when wiring up live API.
- data model: Relations follow ADO `$expand=relations` shape; comments follow Comments API shape. Both are stored alongside work items in the `store` object.
- ui pattern: Card expand/collapse uses CSS `grid-template-rows: 0fr/1fr` — only one card expanded at a time. Expanding a new card auto-collapses the previous.
- ui pattern: Status signal derived from state + tags — "blocked" is a tag-based signal, not a state value. Priority: blocked > closed > active > new.
- tooling: Use Playwright CLI for screenshots, not headless Chrome directly (chromium --headless worked but is fragile).
- css: All colors via CSS custom properties in :root. Badge classes are semantic (ok/warn/danger/info/neutral). Dot classes are dot-ok/dot-warn/dot-danger/dot-new.
- auth: ADO REST API supports CORS from localhost, so no proxy needed. Token acquisition is the only server-side concern.
- config: .env file stores ADO_ORG, ADO_PROJECT, ADO_AREA_PATH, ADO_ITERATION_PATH, ADO_TOKEN. Gitignored. scripts/start.ps1 refreshes token and starts server.

## 2026-02-23
- security: ADO Description and AcceptanceCriteria fields return HTML — must sanitize before innerHTML injection. DOMPurify via CDN handles this.
- robustness: Promise.all for comment fetches is all-or-nothing — one 403/404 kills all items. Use Promise.allSettled to isolate per-item failures.
- robustness: Rapid iteration dropdown changes can cause race conditions — older responses overwrite newer ones. A generation counter in uiState guards against stale responses.
- api: WIQL can return thousands of items but the batch detail endpoint is capped at 200 IDs per call. The 200-item slice is silent unless the topbar shows "showing N of M".
- config: config.local.js is gitignored and only exists after running start.ps1. An inline `window.__ADO_CONFIG = window.__ADO_CONFIG || {}` in index.html prevents 404 console noise.
- testing: playwright-cli `select` command fails with backslash-containing option values — use JS `selectedIndex` + `dispatchEvent` as a workaround.
- architecture: Pure helper functions (relativeTime, stateToSignal, parseTags, etc.) extracted to helpers.js with conditional `module.exports` for Node.js testability. DOM-dependent helpers (escapeHtml, hasLiveConfig) stay in app.js.
- testing: Unit tests use Node built-in `node:test` — zero dependencies. Run with `node --test src/ui/tests/unit.test.js`.
- testing: E2e evals must return `{ pass: boolean, reason: string }` — never return raw data for human interpretation. This caught a missed failure where fallback data was treated as live.
