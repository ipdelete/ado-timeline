---
title: "Summary stats row with clickable counters"
status: open
priority: low
created: 2026-02-23
---

# Summary Stats Row with Clickable Counters

## Summary

Add a row of status counters above the timeline (e.g., `3 Active · 1 Blocked · 2 Closed`) that double as quick filters when clicked.

## Motivation

The topbar shows "X open · Y total" but doesn't break down by state or highlight blocked items. A visual summary row gives instant situational awareness and lets users drill into a specific state with one click.

## Proposal

### Goals

- Display count badges for each state (New, Active, Blocked, Closed/Done/Resolved)
- Badges use existing dot/badge color system for visual consistency
- Clicking a badge filters the timeline to that state
- Active filter is visually highlighted; click again to clear

### Non-Goals

- Charts or graphs (keep it text/badge-based)
- Counts for assignee or type (could be added later)

## Design

Add a `.summary-row` div between the topbar and timeline area. Compute counts from `getWorkItems()` grouped by `stateToSignal()`. Render as a flex row of badge-style elements. On click, set a state filter in `uiState` and re-render the timeline. Integrate with the search/filter system if that plan is implemented first, otherwise standalone.

## Tasks

- [ ] Add `.summary-row` HTML container between topbar and timeline
- [ ] Compute state counts from loaded work items
- [ ] Render count badges with dot-color styling
- [ ] Wire click handlers to filter timeline by state
- [ ] Highlight the active filter badge
- [ ] Style responsive layout for the summary row
