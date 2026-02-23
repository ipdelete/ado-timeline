// ── ADO TIMELINE — Unit Tests ──────────────────────────────────────────────────
// Run: node --test src/ui/tests/unit.test.js

const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const {
  relativeTime,
  stateToSignal,
  signalDotClass,
  stateBadgeClass,
  typeIcon,
  initials,
  extractIdFromUrl,
  parseTags,
  escapeWiqlString,
  buildWorkItemUrl,
  buildPullRequestUrl
} = require('../helpers.js');

// ── relativeTime ──────────────────────────────────────────────────────────────

describe('relativeTime', () => {
  it('returns "just now" for timestamps less than a minute ago', () => {
    const now = new Date().toISOString();
    assert.equal(relativeTime(now), 'just now');
  });

  it('returns minutes for timestamps under an hour ago', () => {
    const date = new Date(Date.now() - 5 * 60000).toISOString();
    assert.equal(relativeTime(date), '5m ago');
  });

  it('returns hours for timestamps under a day ago', () => {
    const date = new Date(Date.now() - 3 * 3600000).toISOString();
    assert.equal(relativeTime(date), '3h ago');
  });

  it('returns days for timestamps under 30 days ago', () => {
    const date = new Date(Date.now() - 7 * 86400000).toISOString();
    assert.equal(relativeTime(date), '7d ago');
  });

  it('returns months for timestamps 30+ days ago', () => {
    const date = new Date(Date.now() - 65 * 86400000).toISOString();
    assert.equal(relativeTime(date), '2mo ago');
  });

  it('handles boundary at exactly 60 minutes', () => {
    const date = new Date(Date.now() - 60 * 60000).toISOString();
    assert.equal(relativeTime(date), '1h ago');
  });

  it('handles boundary at exactly 24 hours', () => {
    const date = new Date(Date.now() - 24 * 3600000).toISOString();
    assert.equal(relativeTime(date), '1d ago');
  });
});

// ── stateToSignal ─────────────────────────────────────────────────────────────

describe('stateToSignal', () => {
  function item(state, tags) {
    return { fields: { 'System.State': state, 'System.Tags': tags || '' } };
  }

  it('returns "danger" when tags include "blocked" regardless of state', () => {
    assert.equal(stateToSignal(item('Active', 'frontend; blocked')), 'danger');
  });

  it('returns "danger" for blocked tag with Closed state (blocked overrides)', () => {
    assert.equal(stateToSignal(item('Closed', 'blocked')), 'danger');
  });

  it('returns "ok" for Closed state', () => {
    assert.equal(stateToSignal(item('Closed')), 'ok');
  });

  it('returns "ok" for Done state', () => {
    assert.equal(stateToSignal(item('Done')), 'ok');
  });

  it('returns "ok" for Resolved state', () => {
    assert.equal(stateToSignal(item('Resolved')), 'ok');
  });

  it('returns "warn" for Active state', () => {
    assert.equal(stateToSignal(item('Active')), 'warn');
  });

  it('returns "warn" for In Progress state', () => {
    assert.equal(stateToSignal(item('In Progress')), 'warn');
  });

  it('returns "new" for New state', () => {
    assert.equal(stateToSignal(item('New')), 'new');
  });

  it('returns "new" for unknown state', () => {
    assert.equal(stateToSignal(item('Design')), 'new');
  });

  it('handles missing tags field gracefully', () => {
    assert.equal(stateToSignal({ fields: { 'System.State': 'Active' } }), 'warn');
  });

  it('blocked detection is case-insensitive', () => {
    assert.equal(stateToSignal(item('Active', 'BLOCKED; urgent')), 'danger');
  });
});

// ── signalDotClass ────────────────────────────────────────────────────────────

describe('signalDotClass', () => {
  it('maps ok → dot-ok', () => assert.equal(signalDotClass('ok'), 'dot-ok'));
  it('maps warn → dot-warn', () => assert.equal(signalDotClass('warn'), 'dot-warn'));
  it('maps danger → dot-danger', () => assert.equal(signalDotClass('danger'), 'dot-danger'));
  it('maps new → dot-new', () => assert.equal(signalDotClass('new'), 'dot-new'));
  it('falls back to dot-new for unknown signal', () => assert.equal(signalDotClass('unknown'), 'dot-new'));
  it('falls back to dot-new for undefined', () => assert.equal(signalDotClass(undefined), 'dot-new'));
});

// ── stateBadgeClass ───────────────────────────────────────────────────────────

describe('stateBadgeClass', () => {
  it('returns "ok" for Closed', () => assert.equal(stateBadgeClass('Closed'), 'ok'));
  it('returns "ok" for Done', () => assert.equal(stateBadgeClass('Done'), 'ok'));
  it('returns "ok" for Resolved', () => assert.equal(stateBadgeClass('Resolved'), 'ok'));
  it('returns "warn" for Active', () => assert.equal(stateBadgeClass('Active'), 'warn'));
  it('returns "warn" for In Progress', () => assert.equal(stateBadgeClass('In Progress'), 'warn'));
  it('returns "neutral" for New', () => assert.equal(stateBadgeClass('New'), 'neutral'));
  it('returns "neutral" for unknown state', () => assert.equal(stateBadgeClass('Custom'), 'neutral'));
});

// ── typeIcon ──────────────────────────────────────────────────────────────────

describe('typeIcon', () => {
  it('returns 🐛 for Bug', () => assert.equal(typeIcon('Bug'), '🐛'));
  it('returns 📖 for User Story', () => assert.equal(typeIcon('User Story'), '📖'));
  it('returns ✅ for Task', () => assert.equal(typeIcon('Task'), '✅'));
  it('returns 🏔️ for Epic', () => assert.equal(typeIcon('Epic'), '🏔️'));
  it('returns 🎯 for Feature', () => assert.equal(typeIcon('Feature'), '🎯'));
  it('returns 📋 for unknown type', () => assert.equal(typeIcon('Issue'), '📋'));
  it('returns 📋 for undefined', () => assert.equal(typeIcon(undefined), '📋'));
});

// ── initials ──────────────────────────────────────────────────────────────────

describe('initials', () => {
  it('returns two-letter initials from full name', () => {
    assert.equal(initials('Jordan Lee'), 'JL');
  });

  it('truncates to 2 chars for three-word names', () => {
    assert.equal(initials('Mary Jane Watson'), 'MJ');
  });

  it('returns single initial for single name', () => {
    assert.equal(initials('Jordan'), 'J');
  });

  it('returns "?" for empty string', () => {
    assert.equal(initials(''), '?');
  });

  it('returns "?" for null', () => {
    assert.equal(initials(null), '?');
  });

  it('returns "?" for undefined', () => {
    assert.equal(initials(undefined), '?');
  });

  it('uppercases lowercase names', () => {
    assert.equal(initials('sam patel'), 'SP');
  });
});

// ── extractIdFromUrl ──────────────────────────────────────────────────────────

describe('extractIdFromUrl', () => {
  it('extracts ID from ADO work item URL', () => {
    assert.equal(extractIdFromUrl('https://dev.azure.com/fabrikam/_apis/wit/workItems/4521'), '4521');
  });

  it('extracts last segment from any URL', () => {
    assert.equal(extractIdFromUrl('https://example.com/a/b/123'), '123');
  });

  it('handles single-segment URL', () => {
    assert.equal(extractIdFromUrl('4521'), '4521');
  });
});

// ── parseTags ─────────────────────────────────────────────────────────────────

describe('parseTags', () => {
  it('splits semicolon-delimited tags', () => {
    assert.deepEqual(parseTags('auth; frontend; Q1'), ['auth', 'frontend', 'Q1']);
  });

  it('trims whitespace', () => {
    assert.deepEqual(parseTags('  auth ;  frontend  '), ['auth', 'frontend']);
  });

  it('returns empty array for null', () => {
    assert.deepEqual(parseTags(null), []);
  });

  it('returns empty array for empty string', () => {
    assert.deepEqual(parseTags(''), []);
  });

  it('returns empty array for undefined', () => {
    assert.deepEqual(parseTags(undefined), []);
  });

  it('filters out empty segments from trailing semicolons', () => {
    assert.deepEqual(parseTags('auth;; ;frontend;'), ['auth', 'frontend']);
  });

  it('handles single tag without semicolons', () => {
    assert.deepEqual(parseTags('security'), ['security']);
  });
});

// ── escapeWiqlString ──────────────────────────────────────────────────────────

describe('escapeWiqlString', () => {
  it('doubles single quotes', () => {
    assert.equal(escapeWiqlString("O'Brien"), "O''Brien");
  });

  it('handles strings without quotes', () => {
    assert.equal(escapeWiqlString('hello'), 'hello');
  });

  it('handles multiple quotes', () => {
    assert.equal(escapeWiqlString("it's a 'test'"), "it''s a ''test''");
  });

  it('coerces numbers to string', () => {
    assert.equal(escapeWiqlString(42), '42');
  });

  it('handles empty string', () => {
    assert.equal(escapeWiqlString(''), '');
  });
});

// ── ADO link builders ──────────────────────────────────────────────────────────

describe('buildWorkItemUrl', () => {
  it('builds a work item edit URL', () => {
    assert.equal(
      buildWorkItemUrl('fabrikam', 'Fabrikam-Fiber', 4521),
      'https://dev.azure.com/fabrikam/Fabrikam-Fiber/_workitems/edit/4521'
    );
  });

  it('encodes org and project path segments', () => {
    assert.equal(
      buildWorkItemUrl('my org', 'proj/name', 100),
      'https://dev.azure.com/my%20org/proj%2Fname/_workitems/edit/100'
    );
  });

  it('returns empty string when org, project, or id is missing', () => {
    assert.equal(buildWorkItemUrl('', 'proj', 1), '');
    assert.equal(buildWorkItemUrl('org', '', 1), '');
    assert.equal(buildWorkItemUrl('org', 'proj', ''), '');
  });
});

describe('buildPullRequestUrl', () => {
  it('builds a pull request URL', () => {
    assert.equal(
      buildPullRequestUrl('fabrikam', 'Fabrikam-Fiber', 1847),
      'https://dev.azure.com/fabrikam/Fabrikam-Fiber/_git/Fabrikam-Fiber/pullrequest/1847'
    );
  });

  it('encodes org and project path segments', () => {
    assert.equal(
      buildPullRequestUrl('my org', 'proj/name', 99),
      'https://dev.azure.com/my%20org/proj%2Fname/_git/proj%2Fname/pullrequest/99'
    );
  });

  it('returns empty string when org, project, or prId is missing', () => {
    assert.equal(buildPullRequestUrl('', 'proj', 1), '');
    assert.equal(buildPullRequestUrl('org', '', 1), '');
    assert.equal(buildPullRequestUrl('org', 'proj', ''), '');
  });
});
