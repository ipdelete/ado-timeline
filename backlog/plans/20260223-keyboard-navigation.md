---
title: "Keyboard navigation and accessibility"
status: open
priority: low
created: 2026-02-23
---

# Keyboard Navigation and Accessibility

## Summary

Add keyboard support for navigating and interacting with timeline cards, plus basic ARIA roles for screen reader support.

## Motivation

The app is mouse-only. Users who rely on keyboard navigation or assistive technology can't interact with cards. Adding keyboard support also improves power-user efficiency.

## Proposal

### Goals

- Arrow keys (↑/↓) move focus between timeline cards
- Enter expands/collapses the focused card
- Escape collapses the currently expanded card
- ARIA roles and labels for timeline, cards, and interactive elements

### Non-Goals

- Full WCAG AA compliance audit (but moves toward it)
- Focus trapping within expanded cards

## Design

Add `tabindex="0"` and `role="button"` to `.card-compact` elements. Track `focusedIndex` in `uiState`. Add a global `keydown` listener that handles ArrowUp, ArrowDown, Enter, and Escape. On arrow keys, update `focusedIndex` and call `.focus()` on the target card. Add `role="list"` to `.timeline` and `role="listitem"` to `.timeline-item`. Add `aria-expanded` to cards.

## Tasks

- [ ] Add `tabindex` and `role` attributes to card elements
- [ ] Add `role="list"`/`role="listitem"` to timeline structure
- [ ] Add `aria-expanded` attribute that toggles with card state
- [ ] Implement global keydown handler for arrow/enter/escape
- [ ] Track focused card index in uiState
- [ ] Add visible focus ring styling for keyboard users
