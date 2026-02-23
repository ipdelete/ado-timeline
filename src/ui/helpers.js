// ── ADO TIMELINE — helpers.js ──────────────────────────────────────────────────
// Pure helper functions extracted for unit-testability.
// Loaded before app.js in the browser; importable via require() in Node.

function relativeTime(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function stateToSignal(item) {
  const state = item.fields['System.State'];
  const tags = (item.fields['System.Tags'] || '').toLowerCase();
  if (tags.includes('blocked')) return 'danger';
  if (state === 'Closed' || state === 'Done' || state === 'Resolved') return 'ok';
  if (state === 'Active' || state === 'In Progress') return 'warn';
  return 'new';
}

function signalDotClass(signal) {
  return { ok: 'dot-ok', warn: 'dot-warn', danger: 'dot-danger', new: 'dot-new' }[signal] || 'dot-new';
}

function stateBadgeClass(state) {
  if (state === 'Closed' || state === 'Done' || state === 'Resolved') return 'ok';
  if (state === 'Active' || state === 'In Progress') return 'warn';
  return 'neutral';
}

function typeIcon(type) {
  return { 'Bug': '🐛', 'User Story': '📖', 'Task': '✅', 'Epic': '🏔️', 'Feature': '🎯' }[type] || '📋';
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function extractIdFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

function parseTags(tagStr) {
  if (!tagStr) return [];
  return tagStr.split(';').map(t => t.trim()).filter(Boolean);
}

function escapeWiqlString(value) {
  return String(value).replace(/'/g, "''");
}

// ── Node.js export (no-op in browser) ─────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { relativeTime, stateToSignal, signalDotClass, stateBadgeClass, typeIcon, initials, extractIdFromUrl, parseTags, escapeWiqlString };
}
