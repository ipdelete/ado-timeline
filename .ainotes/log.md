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
