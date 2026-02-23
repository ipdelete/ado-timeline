# ADO Timeline — Manual Test Guide

Uses [playwright-cli](https://github.com/microsoft/playwright-cli) for browser automation.

## Prerequisites

1. `az login` completed with access to the `msazuredev` org
2. `.env` file in repo root with `ADO_ORG`, `ADO_PROJECT`, `ADO_AREA_PATH`, `ADO_TEAM`
3. `playwright-cli` installed (`npm install -g @playwright/cli@latest`)

## Start the App

```powershell
.\scripts\start.ps1
```

Verify output shows token written, config.local.js generated, and server on port 8080.

---

## Playwright CLI Usage Notes

**Session management:** `playwright-cli` runs a daemon per session. The browser stays alive between commands — no need to relaunch for each step.

```bash
playwright-cli open http://localhost:8080 --headed   # launch browser (visible)
playwright-cli open http://localhost:8080             # headless (default)
playwright-cli close                                  # stop session when done
```

**Headless gotcha on Windows:** Headless msedge may fail with `Protocol error (Browser.getWindowForTarget)` if Edge is already running. Use `--headed` or `--browser=chromium` (if installed). The `--headed` flag is most reliable when Edge is your daily browser.

**Wait for async data:** The app loads data asynchronously. After `open`, add `Start-Sleep -Seconds 8` (PowerShell) before running assertions, or chain with `&&`:

```powershell
playwright-cli open http://localhost:8080; Start-Sleep -Seconds 8; playwright-cli eval "() => document.querySelectorAll('.timeline-item').length"
```

**`eval` for assertions:** Use `eval` with JS arrow functions returning objects — this is the most token-efficient way to check page state:

```bash
playwright-cli eval "() => ({ count: document.querySelectorAll('.timeline-item').length, firstId: document.querySelector('.compact-id')?.textContent })"
```

**`snapshot` for element refs:** Call `snapshot` to get a YAML accessibility tree with `ref=eN` attributes. Use those refs with `click`, `select`, etc:

```bash
playwright-cli snapshot          # dumps tree with refs
playwright-cli click e15         # click element ref e15
playwright-cli select e7 "val"   # select dropdown option
```

**`open` navigates too:** `playwright-cli open <url>` navigates an existing session — no need for a separate `goto` command.

**Screenshots:** Save to a `tmp/` directory (gitignored) to avoid polluting the repo root:

```bash
playwright-cli screenshot --filename=tmp/test-screenshot.png
```

---

## Test Cases

### 1. Live Data Load

```bash
playwright-cli open http://localhost:8080 --headed
# Wait for async load
playwright-cli eval "() => ({ firstId: document.querySelector('.compact-id')?.textContent, cardCount: document.querySelectorAll('.timeline-item').length, hasError: !!document.querySelector('.empty-section')?.textContent?.includes('failed') })"
playwright-cli screenshot --filename=tmp/test-live-data.png
```

**Expected:** `firstId` is a numeric `#ID` (not `#undefined`), `cardCount` > 0, `hasError` false.

### 2. Fallback to Sample Data

```bash
# Navigate with a busted config to trigger fallback
playwright-cli eval "() => { delete window.__ADO_CONFIG; }"
playwright-cli open http://localhost:8080
playwright-cli eval "() => document.querySelector('.empty-section')?.textContent"
```

**Expected:** Returns "Missing runtime ADO config/token. Showing bundled sample data."

### 3. Iteration Dropdown — Current Sprint Default

```bash
playwright-cli open http://localhost:8080
playwright-cli eval "() => document.getElementById('topbar-iteration').value"
```

**Expected:** Returns the team's current iteration path (e.g., `Secure Cloud Access\Krypton\CY26Q1`) — sourced from the Team Settings API with `$timeframe=current`.

### 4. Iteration Dropdown — Change Selection

```bash
playwright-cli snapshot
# Find the iteration select ref (e.g., e7) from snapshot, then:
playwright-cli select <ref> "Secure Cloud Access\\Krypton\\CY25Q4"
playwright-cli eval "() => document.querySelectorAll('.timeline-item').length"
playwright-cli screenshot --filename=tmp/test-iteration-change.png
```

**Expected:** Work item count changes. Topbar count updates.

### 5. Iteration Dropdown — All Iterations

```bash
playwright-cli snapshot
playwright-cli select <ref> ""
playwright-cli eval "() => document.querySelectorAll('.timeline-item').length"
```

**Expected:** Count increases — all area path work items load (no iteration filter).

### 6. Iteration Dropdown — Team Scoped

```bash
playwright-cli eval "() => Array.from(document.getElementById('topbar-iteration').options).map(o => o.value)"
```

**Expected:** Only iterations configured for the team (via `ADO_TEAM`). Not the full project iteration tree.

### 7. Card Expand / Collapse

```bash
playwright-cli snapshot
# Click first card-compact ref from snapshot:
playwright-cli click <ref>
playwright-cli snapshot
playwright-cli screenshot --filename=tmp/test-card-expanded.png
```

**Expected:** Card expands with Details, Activity, Links sections. Tags visible in expanded pane (not compact bar). Close button (✕) present.

### 8. Status Dots

```bash
playwright-cli eval "() => Array.from(document.querySelectorAll('.timeline-dot')).slice(0,5).map(d => d.className)"
```

**Expected:** Classes include `dot-ok` (green), `dot-warn` (yellow), `dot-danger` (red/blocked), `dot-new` (grey) matching work item states.

### 9. Cleanup

```bash
playwright-cli close
```
