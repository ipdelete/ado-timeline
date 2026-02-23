---
title: "Auto-refresh and token expiry handling"
status: open
priority: medium
created: 2026-02-23
---

# Auto-refresh and Token Expiry Handling

## Summary

Add periodic data refresh and detect token expiry so the dashboard stays current without manual page reloads.

## Motivation

The dashboard fetches data once on load. Work items change frequently during a sprint, and the `az` CLI token expires after ~1 hour. Without refresh, users see stale data and eventually get silent 401 errors.

## Proposal

### Goals

- Auto-refresh work items every 60 seconds (configurable)
- Show a subtle "last updated" timestamp in the topbar
- Detect 401 responses and show a "token expired" banner with instructions
- Add a manual refresh button

### Non-Goals

- Automatic token renewal (requires shell access — out of scope for browser app)
- WebSocket/SSE push updates

## Design

Add a `setInterval` in `init()` that calls `loadWorkItems()` every 60s. Preserve expanded card state across refreshes (already works since `uiState.expandedId` persists). On 401, set `uiState.error` to a token-expiry message and stop the interval. Add a refresh icon button in the topbar that manually triggers `loadWorkItems()`. Track `lastRefreshed` timestamp in `uiState`.

## Tasks

- [ ] Add `setInterval` polling in `init()` with 60s default
- [ ] Display "last updated" relative timestamp in topbar
- [ ] Detect 401 in `fetchAdoWorkItems()` and surface token-expiry message
- [ ] Stop polling on token expiry to avoid repeated 401s
- [ ] Add manual refresh button in topbar
- [ ] Preserve expanded card state across refreshes
