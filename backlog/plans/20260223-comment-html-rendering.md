---
title: "Render comment HTML with DOMPurify"
status: open
priority: high
created: 2026-02-23
---

# Render Comment HTML with DOMPurify

## Summary

Switch comment rendering from `escapeHtml()` to `DOMPurify.sanitize()` so that ADO comment formatting (bold, lists, links, code) renders correctly.

## Motivation

ADO comments are stored as HTML. The current code escapes them to plain text via `escapeHtml()`, stripping all formatting. Meanwhile, description and acceptance criteria fields already use `DOMPurify.sanitize()`. This inconsistency makes comments harder to read — especially ones with code blocks, links, or lists.

## Proposal

### Goals

- Comments render rich HTML (bold, italic, lists, links, code)
- HTML is sanitized via DOMPurify (already loaded on page)
- Visual styling matches the existing `.section-html` class

### Non-Goals

- Rendering inline images from comments (defer to later)

## Design

In `renderActivitySection()` in app.js, change `escapeHtml(c.text)` to `DOMPurify.sanitize(c.text)` and add the `section-html` class to the `.comment-text` div. DOMPurify is already loaded via CDN in index.html. No new dependencies needed.

## Tasks

- [ ] Replace `escapeHtml(c.text)` with `DOMPurify.sanitize(c.text)` in `renderActivitySection()`
- [ ] Add `section-html` class to `.comment-text` elements
- [ ] Verify formatted comments render correctly with sample data
