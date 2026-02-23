---
title: "Show titles for linked work items"
status: open
priority: medium
created: 2026-02-23
---

# Show Titles for Linked Work Items

## Summary

Display the title of linked work items in the Links section instead of bare IDs like `#4522`.

## Motivation

The Links section currently shows `Parent #4521` or `Child #4522` with no title. Users must expand or mentally map IDs to understand the relationship. Since most linked items are already loaded in the work items array, we can show titles at near-zero cost.

## Proposal

### Goals

- Linked work items show their title alongside the ID (e.g., `#4521 — Platform Authentication Overhaul`)
- Titles are resolved from already-loaded work items when available
- Gracefully fall back to ID-only when the target isn't in the loaded set

### Non-Goals

- Fetching titles for work items not already loaded (would require additional API calls)

## Design

Create a lookup `Map<id, title>` from `getWorkItems()` at render time. In `renderLinksSection()`, extract the target ID from the relation URL via `extractIdFromUrl()`, look up the title, and append it to the `.link-target` span. If not found, keep current ID-only display.

## Tasks

- [ ] Build an ID→title Map from loaded work items
- [ ] Update `renderLinksSection()` to display title when available
- [ ] Truncate long titles with ellipsis to prevent layout overflow
- [ ] Test with sample data where some links resolve and some don't
