---
title: "Group work items by iteration, assignee, or state"
status: open
priority: low
created: 2026-02-23
---

# Group Work Items by Iteration, Assignee, or State

## Summary

Add a "Group by" control that organizes timeline cards into labeled sections instead of a flat chronological list.

## Motivation

A flat timeline works for small backlogs but becomes hard to scan at scale. Grouping by iteration shows sprint boundaries, grouping by assignee shows workload distribution, and grouping by state shows pipeline flow — all without leaving the page.

## Proposal

### Goals

- Group by: None (default chronological), Iteration, Assignee, State
- Each group renders as a labeled section with its own heading
- Groups are collapsible
- Within each group, items remain sorted by changed date

### Non-Goals

- Multi-level grouping (e.g., group by state then by assignee)
- Drag-and-drop between groups

## Design

Add a "Group by" dropdown to the topbar or filter bar. Store `groupBy` in `uiState`. In `renderTimeline()`, if `groupBy` is set, bucket items using a `groupWorkItems(items, field)` function, then render each bucket as a section with a `.timeline-heading`. Reuse existing card rendering within each group.

## Tasks

- [ ] Add "Group by" dropdown to topbar (None / Iteration / Assignee / State)
- [ ] Implement `groupWorkItems(items, groupBy)` function
- [ ] Update `renderTimeline()` to render grouped sections
- [ ] Add collapsible group headers with item count
- [ ] Style group headings distinct from the existing timeline heading
- [ ] Maintain sort order within groups
