---
title: "Search and filter bar"
status: open
priority: medium
created: 2026-02-23
---

# Search and Filter Bar

## Summary

Add client-side search and filter controls to narrow the timeline by title text, assignee, work item type, or state.

## Motivation

With many work items on screen, users can't quickly find what they're looking for. The iteration dropdown is the only filter. Adding text search and faceted filters makes the dashboard useful for larger backlogs without additional API calls.

## Proposal

### Goals

- Text search filters by title (case-insensitive substring match)
- Dropdown or pill filters for: State, Work Item Type, Assignee
- Filters apply client-side to the already-loaded array
- Filter state is visible and clearable

### Non-Goals

- Server-side/WIQL filtering (iteration dropdown already handles that)
- Saved/persistent filter presets

## Design

Add a filter bar below the topbar (or within `.topbar-meta`). Text input for search, `<select>` elements for State/Type/Assignee populated from unique values in the loaded data. Store active filters in `uiState`. Add a `filterWorkItems()` function that `renderTimeline()` calls instead of using raw `getWorkItems()`. Update the count display to reflect filtered results.

## Tasks

- [ ] Add filter bar HTML to index.html (search input + dropdowns)
- [ ] Style filter bar consistent with topbar design
- [ ] Populate filter dropdowns dynamically from loaded work items
- [ ] Implement `filterWorkItems()` function in app.js
- [ ] Wire filter controls to re-render timeline on change
- [ ] Update topbar count to reflect filtered vs total
- [ ] Add "Clear filters" action
