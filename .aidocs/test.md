# ADO Timeline — Test Guide

Uses [playwright-cli](https://github.com/microsoft/playwright-cli) for browser automation.

## Assertion Convention

> **Every `eval` returns a `pass` boolean.** If `pass` is `false`, the test **FAILED** —
> stop, read the `reason` field, and investigate before continuing.
>
> Do NOT interpret raw data and decide yourself. The eval does the checking.

## Prerequisites

1. `az login` completed with access to the `msazuredev` org
2. `.env` file in repo root with `ADO_ORG`, `ADO_PROJECT`, `ADO_AREA_PATH`, `ADO_TEAM`
3. `playwright-cli` installed (`npm install -g @playwright/cli@latest`)

## Start the App

```powershell
.\scripts\start.ps1
```

> **Required for live-data e2e:** Do **not** start a plain static server directly (for example, `python -m http.server`).  
> That serves files but does **not** refresh `ADO_TOKEN` or regenerate `src/ui/config.local.js`, so live ADO tests will fail or fall back to sample data.

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
playwright-cli eval "() => { const id = document.querySelector('.compact-id')?.textContent; const count = document.querySelectorAll('.timeline-item').length; const err = document.querySelector('.empty-section')?.textContent || ''; const hasError = err.includes('failed') || err.includes('sample data'); const idOk = /^#\d+$/.test(id); return { pass: idOk && count > 0 && !hasError, reason: !idOk ? 'firstId is not numeric: ' + id : count === 0 ? 'no cards rendered' : hasError ? 'error/fallback detected: ' + err : 'ok', firstId: id, cardCount: count }; }"
playwright-cli screenshot --filename=tmp/test-live-data.png
```

**Pass criteria:** `pass: true` — `firstId` matches `#\d+`, `cardCount` > 0, no error/fallback message visible.

### 2. Fallback to Sample Data

```bash
# Navigate with a busted config to trigger fallback
playwright-cli eval "() => { delete window.__ADO_CONFIG; }"
playwright-cli open http://localhost:8080
playwright-cli eval "() => { const msg = document.querySelector('.empty-section')?.textContent || ''; const expected = 'Missing runtime ADO config/token. Showing bundled sample data.'; return { pass: msg === expected, reason: msg === expected ? 'ok' : 'expected fallback message, got: ' + msg, message: msg }; }"
```

**Pass criteria:** `pass: true` — fallback message matches exactly.

### 3. Iteration Dropdown — Current Sprint Default

```bash
playwright-cli open http://localhost:8080
playwright-cli eval "() => { const v = document.getElementById('topbar-iteration').value; const hasValue = v && v.length > 0; return { pass: hasValue, reason: hasValue ? 'ok' : 'iteration dropdown is empty — no current sprint selected', value: v }; }"
```

**Pass criteria:** `pass: true` — dropdown has a non-empty value (the team's current iteration).

### 4. Iteration Dropdown — Change Selection

```bash
playwright-cli snapshot
# Find the iteration select ref (e.g., e7) from snapshot, then:
playwright-cli select <ref> "Secure Cloud Access\\Krypton\\CY25Q4"
playwright-cli eval "() => { const count = document.querySelectorAll('.timeline-item').length; return { pass: count > 0, reason: count > 0 ? 'ok' : 'no cards after iteration change', cardCount: count }; }"
playwright-cli screenshot --filename=tmp/test-iteration-change.png
```

**Pass criteria:** `pass: true` — cards rendered after changing iteration.

### 5. Iteration Dropdown — All Iterations

```bash
playwright-cli snapshot
playwright-cli select <ref> ""
playwright-cli eval "() => { const count = document.querySelectorAll('.timeline-item').length; return { pass: count > 0, reason: count > 0 ? 'ok' : 'no cards for all-iterations view', cardCount: count }; }"
```

**Pass criteria:** `pass: true` — card count > 0 (typically increases vs. single iteration).

### 6. Iteration Dropdown — Team Scoped

```bash
playwright-cli eval "() => { const opts = Array.from(document.getElementById('topbar-iteration').options).map(o => o.value); const hasOptions = opts.length > 1; return { pass: hasOptions, reason: hasOptions ? 'ok' : 'dropdown has no team iterations (only All)', options: opts }; }"
```

**Pass criteria:** `pass: true` — dropdown has team-scoped iteration options beyond "All iterations".

### 7. Card Expand / Collapse

```bash
playwright-cli snapshot
# Click first card-compact ref from snapshot:
playwright-cli click <ref>
playwright-cli eval "() => { const expanded = document.querySelector('.timeline-card.is-expanded'); const sections = expanded ? expanded.querySelectorAll('.section-label') : []; const labels = Array.from(sections).map(s => s.textContent); const hasClose = !!expanded?.querySelector('.card-close-btn'); const ok = labels.includes('Details') && labels.includes('Activity') && labels.includes('Links') && hasClose; return { pass: ok, reason: !expanded ? 'no card expanded' : !hasClose ? 'close button missing' : !ok ? 'missing sections: ' + labels.join(', ') : 'ok', sections: labels, hasClose }; }"
playwright-cli screenshot --filename=tmp/test-card-expanded.png
```

**Pass criteria:** `pass: true` — expanded card has Details, Activity, Links sections and ✕ close button.

### 8. Status Dots

```bash
playwright-cli eval "() => { const dots = Array.from(document.querySelectorAll('.timeline-dot')).map(d => d.className); const validClasses = ['dot-ok', 'dot-warn', 'dot-danger', 'dot-new']; const allValid = dots.every(c => validClasses.some(vc => c.includes(vc))); return { pass: dots.length > 0 && allValid, reason: dots.length === 0 ? 'no dots found' : !allValid ? 'invalid dot class found' : 'ok', count: dots.length, sample: dots.slice(0, 5) }; }"
```

**Pass criteria:** `pass: true` — all timeline dots use valid signal classes.

### 9. Click-through Links (No Toggle Side Effect)

```bash
playwright-cli eval "() => { const firstCard = document.querySelector('.timeline-card'); const idLink = firstCard?.querySelector('.compact-id.wi-link'); const prLink = firstCard?.querySelector('.pr-link') || document.querySelector('.pr-link'); if (!idLink) return { pass: false, reason: 'work item ID link not found' }; const idHrefOk = /_workitems\\/edit\\/\\d+/.test(idLink.getAttribute('href') || ''); const idTargetOk = idLink.getAttribute('target') === '_blank'; const hadExpanded = firstCard?.classList.contains('is-expanded') || false; idLink.dispatchEvent(new MouseEvent('click', { bubbles: true })); const stillSame = (firstCard?.classList.contains('is-expanded') || false) === hadExpanded; const prHrefOk = prLink ? /\\/pullrequest\\/\\d+/.test(prLink.getAttribute('href') || '') : true; const pass = idHrefOk && idTargetOk && stillSame && prHrefOk; return { pass, reason: !idHrefOk ? 'work item href malformed' : !idTargetOk ? 'work item link target is not _blank' : !stillSame ? 'link click toggled card state' : !prHrefOk ? 'PR href malformed' : 'ok', idHref: idLink.getAttribute('href'), prHref: prLink?.getAttribute('href') || 'not-present' }; }"
```

**Pass criteria:** `pass: true` — work item ID link has `_workitems/edit/<id>`, opens in new tab, card expand state does not toggle on link click, and PR links (if present) have `/pullrequest/<id>` URLs.

### 10. Comment HTML Rendering

```bash
playwright-cli eval "() => { const target = uiState.workItems.find(i => i.comments && i.comments.length > 0); if (!target) return { pass: false, reason: 'no work item with comments found' }; target.comments[0].text = '<strong>formatted</strong> <code>inline</code> <a href=\"https://example.com\">link</a>'; uiState.expandedId = target.id; renderTimeline(); const comment = document.querySelector('.timeline-card.is-expanded .comment-text'); if (!comment) return { pass: false, reason: 'no comment text found in expanded card' }; const hasRenderedHtml = !!comment.querySelector('strong, code, a'); const hasEscapedHtml = /&lt;\\/?(strong|code|a)/i.test(comment.innerHTML); return { pass: hasRenderedHtml && !hasEscapedHtml, reason: !hasRenderedHtml ? 'comment HTML is not rendered as elements' : hasEscapedHtml ? 'comment contains escaped HTML text' : 'ok', htmlSnippet: comment.innerHTML.slice(0, 180) }; }"
```

**Pass criteria:** `pass: true` — expanded comment content renders HTML elements (for example, `<strong>` / `<code>` / `<a>`) and does not show escaped tag text.

### 11. Auto-refresh + Token Expiry Handling

```bash
playwright-cli eval "() => { const refreshBtn = document.getElementById('topbar-refresh'); const stamp = document.getElementById('topbar-last-updated'); if (!refreshBtn || !stamp) return { pass: false, reason: 'missing refresh controls in topbar' }; const before = stamp.textContent || ''; refreshBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return { pass: true, reason: 'ok', before }; }"
playwright-cli eval "() => { const stamp = document.getElementById('topbar-last-updated')?.textContent || ''; const ok = stamp.startsWith('Last updated:'); return { pass: ok, reason: ok ? 'ok' : 'last-updated label missing after manual refresh', stamp }; }"
playwright-cli eval "() => { const originalFetch = window.fetch; window.fetch = async (...args) => { if (String(args[0]).includes('/_apis/wit/wiql')) return { ok: false, status: 401, json: async () => ({}) }; return originalFetch(...args); }; return { pass: true, reason: 'ok' }; }"
playwright-cli eval "() => { const refreshBtn = document.getElementById('topbar-refresh'); refreshBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })); const msg = document.querySelector('.empty-section')?.textContent || ''; const pass = msg.includes('token expired') || msg.includes('start.ps1'); return { pass, reason: pass ? 'ok' : 'token-expired message not shown', message: msg }; }"
```

**Pass criteria:** `pass: true` — manual refresh keeps/updates last-updated label, and simulated 401 shows explicit token-expired guidance.

### 12. Cleanup

```bash
playwright-cli close
```
