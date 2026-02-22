# ADO Timeline Dashboard — Feature Spec

## Overview

A standalone web dashboard that displays Azure DevOps work items as a vertical timeline with collapsible detail cards. The visual style borrows the timeline UX and theme from [directive-plane](https://github.com/ipdelete/directive-plane) but the data, content, and purpose are entirely independent.

## What It Does

- Fetches work items from Azure DevOps filtered by a configurable **area path**
- Displays both **open and closed** items on a vertical timeline
- Each work item renders as a collapsible card with status dot, summary badges, and expandable detail sections
- Timeline is ordered by last-changed date (most recent at top)

## Data Source

### Azure DevOps REST API

```
POST https://dev.azure.com/{org}/{project}/_apis/wit/wiql?api-version=7.1
```

WIQL query filtered by area path:

```sql
SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo],
       [Microsoft.VSTS.Common.Priority], [System.Tags], [System.ChangedDate]
FROM WorkItems
WHERE [System.AreaPath] UNDER '{areaPath}'
ORDER BY [System.ChangedDate] DESC
```

Work item details fetched via batch:

```
GET https://dev.azure.com/{org}/{project}/_apis/wit/workitems?ids={ids}&$expand=relations&api-version=7.1
```

### Authentication

Shell out to `az` CLI for token acquisition — no credential management needed:

```bash
az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv
```

The app calls this at startup (and on token expiry) to get a Bearer token. The user must have `az login` completed beforehand.

## UX Design

### Timeline Structure

Vertical timeline with a left-side rail, colored status dots, and right-aligned cards — same pattern as directive-plane.

**Status dot colors:**
- 🟢 Green — Closed / Done / Resolved
- 🟡 Yellow — Active / In Progress
- 🔴 Red — Blocked (has blocking link or tag)
- ⚪ Grey — New / Not Started

### Card Compact View (Collapsed)

Each card shows at a glance:

| Element         | Source Field                          |
|-----------------|---------------------------------------|
| Work Item ID    | `System.Id` (formatted as link)       |
| Title           | `System.Title`                        |
| State badge     | `System.State`                        |
| Type icon       | `System.WorkItemType` (Bug/Story/Task/Epic) |
| Priority        | `Microsoft.VSTS.Common.Priority`      |
| Assigned To     | `System.AssignedTo`                   |
| Changed Date    | `System.ChangedDate` (relative time)  |
| Tags            | `System.Tags` (pill badges)           |

### Card Expanded View

On click, card expands to show full detail. Content is organized into sections (not tabs — work items don't have the same phase model as directive-plane):

**Details Section**
- Description (`System.Description`) rendered as HTML
- Acceptance criteria (`Microsoft.VSTS.Common.AcceptanceCriteria`)
- Iteration path
- Story points / effort

**Activity Section**
- Work item comments/discussion (via Comments API)
- State change history

**Links Section**
- Related work items (parent, child, related)
- Linked pull requests (with status: active/completed/abandoned)
- Linked commits

## Configuration

Minimal config via a `config.json` or environment variables:

```json
{
  "org": "my-org",
  "project": "my-project",
  "areaPath": "MyProject\\MyTeam"
}
```

## Tech Stack

- **Vanilla JavaScript** — no framework, same approach as directive-plane
- **CSS** — custom properties for theming, grid-based card expansion
- **No build step** — single HTML file + JS + CSS, served statically
- **Node.js wrapper** (optional) — thin server to handle `az` token refresh and proxy API calls (avoids CORS)

## Key Design Decisions

1. **Area path filter, not WIQL builder** — keep it simple. One area path, all items. No query builder UI.
2. **Sections over tabs** — work items don't have workflow phases. Expanded cards show all detail in scrollable sections instead of a tab switcher.
3. **`az` CLI auth over PAT** — no secrets to manage, leverages existing SSO/MFA. Trade-off: requires `az` CLI installed.
4. **Closed items included** — useful for seeing recent completions alongside active work. Could add a toggle later.
5. **No state persistence** — pure read-only dashboard. No local storage, no caching (initially).
6. **Relative timestamps** — "2h ago", "3d ago" style, matching directive-plane's approach.
