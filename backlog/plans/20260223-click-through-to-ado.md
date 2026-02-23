---
title: "Click-through links to Azure DevOps"
status: open
priority: high
created: 2026-02-23
---

# Click-through Links to Azure DevOps

## Summary

Make work item IDs in timeline cards clickable links that open the actual work item in Azure DevOps.

## Motivation

Card IDs like `#4521` are plain text. Users see something interesting and have to manually navigate to ADO to take action. A direct link removes friction and makes the dashboard actionable, not just informational.

## Proposal

### Goals

- Work item IDs link to `https://dev.azure.com/{org}/{project}/_workitems/edit/{id}`
- Links open in a new tab (`target="_blank"`)
- PR links in the Links section also become clickable

### Non-Goals

- Deep-linking to specific comments or relation targets beyond what's already shown

## Design

In `buildCardHTML()`, wrap `.compact-id` in an `<a>` tag using `config.org` and `config.project` to build the URL. Same treatment for PR links in `renderLinksSection()`. Add minimal CSS so links inherit card styling but show underline on hover. Stop click propagation on links so they don't trigger card expand/collapse.

## Tasks

- [ ] Wrap `.compact-id` in an anchor tag with ADO work item URL
- [ ] Make PR IDs in Links section clickable to ADO PR URL
- [ ] Add CSS for link styling within cards
- [ ] Prevent link clicks from toggling card expand/collapse
- [ ] Verify links work with both sample data and live config
