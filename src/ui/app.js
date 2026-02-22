// ── ADO TIMELINE — app.js ─────────────────────────────────────────────────────

// ── CONFIG ────────────────────────────────────────────────────────────────────
const config = {
  org: 'fabrikam',
  project: 'Fabrikam-Fiber',
  areaPath: 'Fabrikam-Fiber\\Platform'
};

// ── FAKE DATA STORE ───────────────────────────────────────────────────────────
// Mirrors real ADO REST API shapes: fields from Work Items API, relations from
// $expand=relations, comments from Comments API.

const store = {
  workItems: [
    {
      id: 4521,
      rev: 8,
      fields: {
        'System.Id': 4521,
        'System.WorkItemType': 'Epic',
        'System.Title': 'Platform Authentication Overhaul',
        'System.State': 'Closed',
        'System.AssignedTo': { displayName: 'Jordan Lee', uniqueName: 'jordan@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 2,
        'System.Tags': 'security; auth; Q1-milestone',
        'System.ChangedDate': '2026-02-22T18:30:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 14',
        'System.Description': '<p>Overhaul the authentication subsystem to support federated identity providers. Replace the legacy session-cookie flow with OAuth 2.0 + PKCE for all client applications.</p><ul><li>Migrate existing users without downtime</li><li>Support Azure AD, Google, and GitHub as identity providers</li><li>Deprecate internal password store</li></ul>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>All three identity providers functional in staging</li><li>Zero-downtime migration script tested on production snapshot</li><li>Legacy endpoint returns 301 for 30 days</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 21
      },
      relations: [
        { rel: 'System.LinkTypes.Hierarchy-Forward', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4522', attributes: { name: 'Child' } },
        { rel: 'System.LinkTypes.Hierarchy-Forward', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4530', attributes: { name: 'Child' } },
        { rel: 'System.LinkTypes.Hierarchy-Forward', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4535', attributes: { name: 'Child' } }
      ],
      comments: [
        { commentId: 201, text: 'Migration script passed against prod snapshot — zero rows lost.', createdBy: { displayName: 'Jordan Lee' }, createdDate: '2026-02-21T10:15:00Z' },
        { commentId: 202, text: 'Closing this out. All three IdPs verified in staging and prod.', createdBy: { displayName: 'Sam Patel' }, createdDate: '2026-02-22T17:45:00Z' }
      ]
    },
    {
      id: 4522,
      rev: 5,
      fields: {
        'System.Id': 4522,
        'System.WorkItemType': 'User Story',
        'System.Title': 'Implement OAuth 2.0 PKCE flow for web client',
        'System.State': 'Active',
        'System.AssignedTo': { displayName: 'Sam Patel', uniqueName: 'sam@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 1,
        'System.Tags': 'auth; frontend',
        'System.ChangedDate': '2026-02-22T20:10:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 14',
        'System.Description': '<p>Add PKCE-based OAuth 2.0 authorization code flow to the web client. The token exchange must happen server-side to avoid exposing secrets in the browser.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>Login redirects to IdP and returns with valid access token</li><li>Refresh token rotation works without user interaction</li><li>Session cookie is HttpOnly, Secure, SameSite=Strict</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 8
      },
      relations: [
        { rel: 'System.LinkTypes.Hierarchy-Reverse', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4521', attributes: { name: 'Parent' } },
        { rel: 'ArtifactLink', url: 'vstfs:///Git/PullRequestId/fabrikam%2FFabrikam-Fiber%2F1847', attributes: { name: 'Pull Request', id: 1847, status: 'completed' } }
      ],
      comments: [
        { commentId: 301, text: 'PR #1847 merged. Token rotation tested with 24h fast-forward.', createdBy: { displayName: 'Sam Patel' }, createdDate: '2026-02-22T19:50:00Z' }
      ]
    },
    {
      id: 4530,
      rev: 3,
      fields: {
        'System.Id': 4530,
        'System.WorkItemType': 'Bug',
        'System.Title': 'Token refresh race condition causes double logout',
        'System.State': 'Active',
        'System.AssignedTo': { displayName: 'Maya Chen', uniqueName: 'maya@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 1,
        'System.Tags': 'auth; blocked; regression',
        'System.ChangedDate': '2026-02-22T21:05:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 14',
        'System.Description': '<p>When two tabs simultaneously attempt a token refresh, both receive a 401 on the old token. The second refresh request invalidates the first new token, causing an unexpected logout in both tabs.</p><p><strong>Repro steps:</strong></p><ol><li>Open app in two tabs</li><li>Wait for token to expire (or fast-forward clock)</li><li>Both tabs fire API requests within the same second</li><li>Observe: one or both tabs redirect to login</li></ol>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>Concurrent refresh requests are serialized via mutex/lock</li><li>Only one refresh request reaches the IdP per session</li><li>No logout observed in 100 consecutive multi-tab refresh cycles</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 5
      },
      relations: [
        { rel: 'System.LinkTypes.Hierarchy-Reverse', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4521', attributes: { name: 'Parent' } },
        { rel: 'System.LinkTypes.Related-Forward', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4522', attributes: { name: 'Related' } }
      ],
      comments: [
        { commentId: 401, text: 'Reproduced consistently. The refresh endpoint does not use a nonce — that\'s the root cause.', createdBy: { displayName: 'Maya Chen' }, createdDate: '2026-02-22T15:20:00Z' },
        { commentId: 402, text: 'Blocked until we decide on mutex strategy: in-memory lock vs. BroadcastChannel. Need arch input.', createdBy: { displayName: 'Maya Chen' }, createdDate: '2026-02-22T20:30:00Z' }
      ]
    },
    {
      id: 4535,
      rev: 1,
      fields: {
        'System.Id': 4535,
        'System.WorkItemType': 'Task',
        'System.Title': 'Write migration runbook for legacy password store deprecation',
        'System.State': 'New',
        'System.AssignedTo': null,
        'Microsoft.VSTS.Common.Priority': 3,
        'System.Tags': 'auth; documentation',
        'System.ChangedDate': '2026-02-20T09:00:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 15',
        'System.Description': '<p>Create a step-by-step runbook covering the production migration from the internal password store to federated auth. Include rollback procedures and monitoring checkpoints.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '',
        'Microsoft.VSTS.Scheduling.StoryPoints': null
      },
      relations: [
        { rel: 'System.LinkTypes.Hierarchy-Reverse', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4521', attributes: { name: 'Parent' } }
      ],
      comments: []
    },
    {
      id: 4488,
      rev: 6,
      fields: {
        'System.Id': 4488,
        'System.WorkItemType': 'User Story',
        'System.Title': 'Rate limiting middleware for public API endpoints',
        'System.State': 'Resolved',
        'System.AssignedTo': { displayName: 'Alex Rivera', uniqueName: 'alex@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 2,
        'System.Tags': 'api; security; performance',
        'System.ChangedDate': '2026-02-21T16:45:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 13',
        'System.Description': '<p>Implement token-bucket rate limiting on all <code>/api/v2/*</code> endpoints. Limits should be configurable per-tenant via the admin portal. Default: 100 req/min per API key.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>429 response with Retry-After header when limit exceeded</li><li>Per-tenant override works without restart</li><li>Dashboard shows current utilization per tenant</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 5
      },
      relations: [
        { rel: 'ArtifactLink', url: 'vstfs:///Git/PullRequestId/fabrikam%2FFabrikam-Fiber%2F1832', attributes: { name: 'Pull Request', id: 1832, status: 'completed' } },
        { rel: 'ArtifactLink', url: 'vstfs:///Git/PullRequestId/fabrikam%2FFabrikam-Fiber%2F1839', attributes: { name: 'Pull Request', id: 1839, status: 'active' } }
      ],
      comments: [
        { commentId: 501, text: 'Core middleware merged in PR #1832. Follow-up PR #1839 adds the admin portal config UI.', createdBy: { displayName: 'Alex Rivera' }, createdDate: '2026-02-21T16:40:00Z' }
      ]
    },
    {
      id: 4510,
      rev: 4,
      fields: {
        'System.Id': 4510,
        'System.WorkItemType': 'Bug',
        'System.Title': 'Memory leak in WebSocket connection pool under sustained load',
        'System.State': 'Closed',
        'System.AssignedTo': { displayName: 'Jordan Lee', uniqueName: 'jordan@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 1,
        'System.Tags': 'performance; infrastructure',
        'System.ChangedDate': '2026-02-19T11:20:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 13',
        'System.Description': '<p>Under sustained load (>500 concurrent WebSocket connections), the connection pool grows unbounded. GC never reclaims closed connections because event listeners hold references.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>Heap stays flat under 1000 concurrent connections for 8 hours</li><li>No increase in GC pause times</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 3
      },
      relations: [
        { rel: 'ArtifactLink', url: 'vstfs:///Git/PullRequestId/fabrikam%2FFabrikam-Fiber%2F1825', attributes: { name: 'Pull Request', id: 1825, status: 'completed' } }
      ],
      comments: [
        { commentId: 601, text: 'Root cause: event listeners not removed on socket close. Fixed with WeakRef + FinalizationRegistry.', createdBy: { displayName: 'Jordan Lee' }, createdDate: '2026-02-18T22:10:00Z' },
        { commentId: 602, text: 'Verified: 8h soak test passed. Heap delta < 2MB. Closing.', createdBy: { displayName: 'Jordan Lee' }, createdDate: '2026-02-19T11:15:00Z' }
      ]
    },
    {
      id: 4540,
      rev: 2,
      fields: {
        'System.Id': 4540,
        'System.WorkItemType': 'Task',
        'System.Title': 'Add structured logging to payment reconciliation worker',
        'System.State': 'Active',
        'System.AssignedTo': { displayName: 'Alex Rivera', uniqueName: 'alex@fabrikam.com', imageUrl: '' },
        'Microsoft.VSTS.Common.Priority': 3,
        'System.Tags': 'observability; payments',
        'System.ChangedDate': '2026-02-22T14:00:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 14',
        'System.Description': '<p>Replace <code>console.log</code> calls in the reconciliation worker with structured JSON logging via Pino. Include correlation IDs, payment IDs, and processing durations.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>All log lines are valid JSON</li><li>Each log includes correlationId and durationMs fields</li><li>Dashboards in Grafana updated to parse new format</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 3
      },
      relations: [],
      comments: [
        { commentId: 701, text: 'Started on this — about 60% through the worker. Will need to update the Grafana dashboards too.', createdBy: { displayName: 'Alex Rivera' }, createdDate: '2026-02-22T13:55:00Z' }
      ]
    },
    {
      id: 4545,
      rev: 1,
      fields: {
        'System.Id': 4545,
        'System.WorkItemType': 'User Story',
        'System.Title': 'Support GitHub as a federated identity provider',
        'System.State': 'New',
        'System.AssignedTo': null,
        'Microsoft.VSTS.Common.Priority': 2,
        'System.Tags': 'auth; github-integration',
        'System.ChangedDate': '2026-02-22T08:30:00Z',
        'System.AreaPath': 'Fabrikam-Fiber\\Platform',
        'System.IterationPath': 'Fabrikam-Fiber\\Sprint 15',
        'System.Description': '<p>Extend the federated auth framework (from Epic #4521) to support GitHub as an identity provider. Users should be able to link their GitHub account and use it for SSO.</p>',
        'Microsoft.VSTS.Common.AcceptanceCriteria': '<ul><li>GitHub OAuth app registered and callback URL configured</li><li>User can log in with GitHub and see their avatar/username</li><li>Account linking works for users with existing email-based accounts</li></ul>',
        'Microsoft.VSTS.Scheduling.StoryPoints': 5
      },
      relations: [
        { rel: 'System.LinkTypes.Hierarchy-Reverse', url: 'https://dev.azure.com/fabrikam/_apis/wit/workItems/4521', attributes: { name: 'Parent' } }
      ],
      comments: []
    }
  ]
};

// ── UI STATE ──────────────────────────────────────────────────────────────────
const uiState = {
  expandedId: null
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
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

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function parseTags(tagStr) {
  if (!tagStr) return [];
  return tagStr.split(';').map(t => t.trim()).filter(Boolean);
}

// ── RENDER: TOPBAR ────────────────────────────────────────────────────────────
function renderTopbar() {
  document.getElementById('topbar-project').textContent = config.project;
  document.getElementById('topbar-area').textContent = config.areaPath;

  const open = store.workItems.filter(i => i.fields['System.State'] !== 'Closed' && i.fields['System.State'] !== 'Done').length;
  const total = store.workItems.length;
  document.getElementById('topbar-count').textContent = `${open} open · ${total} total`;
}

// ── RENDER: TIMELINE ──────────────────────────────────────────────────────────
function renderTimeline() {
  const sorted = [...store.workItems].sort((a, b) =>
    new Date(b.fields['System.ChangedDate']) - new Date(a.fields['System.ChangedDate'])
  );

  const timeline = document.getElementById('timeline');
  timeline.innerHTML = `
    <div class="timeline-heading">Work Items</div>
    ${sorted.map(item => buildCardHTML(item)).join('')}
  `;

  attachListeners();

  if (uiState.expandedId) {
    renderExpandedContent(uiState.expandedId);
  }
}

// ── RENDER: CARD ──────────────────────────────────────────────────────────────
function buildCardHTML(item) {
  const f = item.fields;
  const signal = stateToSignal(item);
  const isExpanded = uiState.expandedId === item.id;
  const assignee = f['System.AssignedTo'];
  const priority = f['Microsoft.VSTS.Common.Priority'];
  const tags = parseTags(f['System.Tags']);

  return `
    <div class="timeline-item" data-id="${item.id}">
      <div class="timeline-dot ${signalDotClass(signal)}"></div>
      <div class="timeline-card${isExpanded ? ' is-expanded' : ''}" data-id="${item.id}">

        <div class="card-compact" data-toggle="${item.id}">
          <span class="compact-type-icon">${typeIcon(f['System.WorkItemType'])}</span>
          <span class="compact-id">#${f['System.Id']}</span>
          <span class="compact-title">${escapeHtml(f['System.Title'])}</span>
          <div class="compact-meta">
            <span class="badge ${stateBadgeClass(f['System.State'])}">${f['System.State']}</span>
            ${priority ? `<span class="compact-priority p${priority <= 2 ? priority : ''}">P${priority}</span>` : ''}
            ${tags.map(t => `<span class="tag-pill${t.toLowerCase() === 'blocked' ? ' tag-blocked' : ''}">${escapeHtml(t)}</span>`).join('')}
            <span class="compact-owner">${assignee ? escapeHtml(assignee.displayName) : '<em>Unassigned</em>'}</span>
            <span class="compact-time">${relativeTime(f['System.ChangedDate'])}</span>
          </div>
          <span class="expand-icon">▾</span>
        </div>

        <div class="card-expand-wrapper">
          <div class="card-expand-inner">
            <div class="card-close-row">
              <button class="card-close-btn" data-close="${item.id}">✕</button>
            </div>
            <div class="card-sections" id="card-sections-${item.id}"></div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ── RENDER: EXPANDED SECTIONS ─────────────────────────────────────────────────
function renderExpandedContent(id) {
  const item = store.workItems.find(i => i.id === id);
  if (!item) return;
  const container = document.getElementById(`card-sections-${id}`);
  if (!container) return;

  container.innerHTML = `
    ${renderDetailsSection(item)}
    ${renderActivitySection(item)}
    ${renderLinksSection(item)}
  `;
}

function renderDetailsSection(item) {
  const f = item.fields;
  const sp = f['Microsoft.VSTS.Scheduling.StoryPoints'];
  const ac = f['Microsoft.VSTS.Common.AcceptanceCriteria'];

  return `
    <div class="card-section">
      <div class="section-label">Details</div>
      <div class="section-grid">
        <div class="section-field">
          <label>Iteration</label>
          <div class="field-value">${escapeHtml(f['System.IterationPath'] || '—')}</div>
        </div>
        <div class="section-field">
          <label>Story Points</label>
          <div class="field-value">${sp != null ? sp : '—'}</div>
        </div>
        <div class="section-field">
          <label>Type</label>
          <div class="field-value">${typeIcon(f['System.WorkItemType'])} ${escapeHtml(f['System.WorkItemType'])}</div>
        </div>
        <div class="section-field">
          <label>Area Path</label>
          <div class="field-value">${escapeHtml(f['System.AreaPath'] || '—')}</div>
        </div>
      </div>
      ${f['System.Description'] ? `
        <label>Description</label>
        <div class="section-html">${f['System.Description']}</div>
      ` : ''}
      ${ac ? `
        <label>Acceptance Criteria</label>
        <div class="section-html">${ac}</div>
      ` : ''}
    </div>
  `;
}

function renderActivitySection(item) {
  if (!item.comments || item.comments.length === 0) {
    return `
      <div class="card-section">
        <div class="section-label">Activity</div>
        <div class="empty-section">No comments yet.</div>
      </div>
    `;
  }

  return `
    <div class="card-section">
      <div class="section-label">Activity</div>
      ${item.comments.map(c => `
        <div class="comment-item">
          <div class="comment-avatar">${initials(c.createdBy.displayName)}</div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author">${escapeHtml(c.createdBy.displayName)}</span>
              <span class="comment-date">${relativeTime(c.createdDate)}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLinksSection(item) {
  if (!item.relations || item.relations.length === 0) {
    return `
      <div class="card-section">
        <div class="section-label">Links</div>
        <div class="empty-section">No linked items.</div>
      </div>
    `;
  }

  // Group relations by type
  const workItemLinks = [];
  const prLinks = [];

  for (const rel of item.relations) {
    if (rel.rel === 'ArtifactLink') {
      prLinks.push(rel);
    } else {
      workItemLinks.push(rel);
    }
  }

  return `
    <div class="card-section">
      <div class="section-label">Links</div>
      ${workItemLinks.length ? `
        <div class="link-group-title">Work Items</div>
        ${workItemLinks.map(rel => {
          const targetId = extractIdFromUrl(rel.url);
          const name = rel.attributes.name;
          return `
            <div class="link-item">
              <span class="link-type-label">${escapeHtml(name)}</span>
              <span class="link-target">#${targetId}</span>
            </div>
          `;
        }).join('')}
      ` : ''}
      ${prLinks.length ? `
        <div class="link-group-title">Pull Requests</div>
        ${prLinks.map(rel => {
          const prId = rel.attributes.id || '?';
          const status = rel.attributes.status || 'unknown';
          const statusClass = status === 'completed' ? 'ok' : status === 'active' ? 'info' : 'neutral';
          return `
            <div class="link-item">
              <span class="link-type-label">PR</span>
              <span class="link-target">#${prId}</span>
              <span class="badge ${statusClass}">${status}</span>
            </div>
          `;
        }).join('')}
      ` : ''}
    </div>
  `;
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
function attachListeners() {
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleCard(parseInt(el.dataset.toggle, 10)));
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      collapseCard(parseInt(btn.dataset.close, 10));
    });
  });
}

function toggleCard(id) {
  if (uiState.expandedId === id) { collapseCard(id); return; }

  const prevId = uiState.expandedId;
  uiState.expandedId = id;

  if (prevId) {
    const prevCard = document.querySelector(`.timeline-card[data-id="${prevId}"]`);
    if (prevCard) prevCard.classList.remove('is-expanded');
  }

  const card = document.querySelector(`.timeline-card[data-id="${id}"]`);
  if (!card) return;
  card.classList.add('is-expanded');
  renderExpandedContent(id);
}

function collapseCard(id) {
  uiState.expandedId = null;
  const card = document.querySelector(`.timeline-card[data-id="${id}"]`);
  if (card) card.classList.remove('is-expanded');
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  renderTopbar();
  renderTimeline();
}

init();
