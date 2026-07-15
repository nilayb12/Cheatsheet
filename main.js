// ── Inline SVG icons ──
const ICON_LIVE = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
</svg>`;

const ICON_SOURCE = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35
           6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0
           19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1
           5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0
           5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
</svg>`;

const STATUS_LABEL = { live: 'live', wip: 'wip', archived: 'archived' };
const STATUS_CLASS = { live: 'badge-live', wip: 'badge-wip', archived: 'badge-archived' };
const STATUS_ORDER = { live: 0, wip: 1, archived: 2 };
const VALID_STATUSES = new Set(['live', 'wip', 'archived']);
const VALID_PATH_RE  = /^[a-zA-Z0-9_-]+$/;

// ─────────────────────────────────────────────────────────────
//  Validation (unchanged)
// ─────────────────────────────────────────────────────────────

function validateEntry(p, idx) {
  const warnings = [];
  const label = `projects.json[${idx}]`;
  if (typeof p !== 'object' || p === null || Array.isArray(p))
    return { valid: false, warnings: [`${label}: entry must be an object, got ${typeof p}`] };
  if (!p.name || typeof p.name !== 'string' || !p.name.trim())
    warnings.push(`${label}: "name" is required and must be a non-empty string`);
  if (!p.path || typeof p.path !== 'string' || !p.path.trim())
    warnings.push(`${label} ("${p.name || '?'}"): "path" is required`);
  else if (!VALID_PATH_RE.test(p.path))
    warnings.push(`${label} ("${p.name}"): "path" must contain only letters, numbers, hyphens, and underscores`);
  if ('desc'   in p && typeof p.desc   !== 'string') warnings.push(`${label} ("${p.name}"): "desc" must be a string`);
  if ('icon'   in p && typeof p.icon   !== 'string') warnings.push(`${label} ("${p.name}"): "icon" must be a string`);
  if ('status' in p && !VALID_STATUSES.has(p.status)) warnings.push(`${label} ("${p.name}"): "status" must be one of: live, wip, archived`);
  if ('tags'   in p) {
    if (!Array.isArray(p.tags)) warnings.push(`${label} ("${p.name}"): "tags" must be an array`);
    else p.tags.forEach((t, ti) => {
      if (typeof t !== 'string' || !t.trim())
        warnings.push(`${label} ("${p.name}"): tags[${ti}] must be a non-empty string`);
    });
  }
  const known = new Set(['name', 'path', 'desc', 'icon', 'status', 'tags']);
  Object.keys(p).forEach(k => {
    if (!known.has(k)) warnings.push(`${label} ("${p.name}"): unknown field "${k}"`);
  });
  return { valid: !warnings.some(w => w.includes('required') || w.includes('must be')), warnings };
}

function validatePayload(data) {
  let raw;
  if (Array.isArray(data)) { raw = data; }
  else if (data && typeof data === 'object' && Array.isArray(data.projects)) { raw = data.projects; }
  else throw new Error('projects.json must be an array or an object with a "projects" array.');

  let totalWarnings = 0;
  const valid = [];
  raw.forEach((entry, idx) => {
    const { valid: ok, warnings } = validateEntry(entry, idx);
    warnings.forEach(w => console.warn(`⚠ ${w}`));
    totalWarnings += warnings.length;
    if (ok) valid.push(entry);
    else console.error(`✖ projects.json[${idx}] skipped.`);
  });

  const paths = valid.map(p => p.path);
  const seen = new Set();
  const deduped = valid.filter(p => { if (seen.has(p.path)) return false; seen.add(p.path); return true; });

  totalWarnings === 0
    ? console.info(`✔ projects.json: ${deduped.length} project(s) loaded.`)
    : console.warn(`projects.json: ${deduped.length} project(s) loaded with ${totalWarnings} warning(s).`);

  return { projects: deduped };
}

// ─────────────────────────────────────────────────────────────
//  Rendering
// ─────────────────────────────────────────────────────────────

function sourceUrl(projectPath) {
  try {
    const { hostname, pathname } = window.location;
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'github' && parts[2] === 'io') {
      const user = parts[0];
      const repo = pathname.split('/').filter(Boolean)[0] || '';
      if (repo) return `https://github.com/${user}/${repo}/tree/main/${projectPath}`;
    }
  } catch (_) {}
  return `https://github.com/your-username/your-repo/tree/main/${projectPath}`;
}

/** Renders one <tr> for a project entry. */
function renderRow(p) {
  const tr = document.createElement('tr');

  // Data attributes for filtering and sorting
  tr.dataset.search = `${p.name} ${p.desc || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
  tr.dataset.tags   = (p.tags || []).map(t => t.toLowerCase()).join(',');
  tr.dataset.name   = p.name.toLowerCase();
  tr.dataset.status = STATUS_ORDER[p.status || 'live'] ?? 0;

  const status = p.status || 'live';
  const tagsHtml = Array.isArray(p.tags) && p.tags.length
    ? p.tags.map(t => `<span class="tag">${t}</span>`).join('')
    : '—';

  tr.innerHTML = `
    <td class="col-name">
      <a class="td-name-link" href="${p.path}/" target="_blank" rel="noopener"
         aria-label="Open ${p.name}">
        <span class="td-name">${p.icon ? p.icon + ' ' : ''}${p.name}</span>
        <span class="td-path">./${p.path}/</span>
      </a>
    </td>
    <td class="col-desc">
      <span class="td-desc">${p.desc || '—'}</span>
    </td>
    <td class="col-tags">
      <div class="td-tags">${tagsHtml}</div>
    </td>
    <td class="col-status">
      <span class="badge ${STATUS_CLASS[status]}">${STATUS_LABEL[status]}</span>
    </td>
    <td class="col-actions">
      <div class="td-actions">
        <a class="td-action" href="${p.path}/" target="_blank" rel="noopener"
           aria-label="Open live site: ${p.name}">
          ${ICON_LIVE} Live
        </a>
        <a class="td-action" href="${sourceUrl(p.path)}" target="_blank" rel="noopener"
           aria-label="View source for ${p.name}">
          ${ICON_SOURCE} Source
        </a>
      </div>
    </td>
  `;
  return tr;
}

// ─────────────────────────────────────────────────────────────
//  Sorting
// ─────────────────────────────────────────────────────────────

/** Current sort state */
const sortState = { col: null, dir: 'asc' };

function initSort(projects) {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.col;
      if (sortState.col === col) {
        sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
      } else {
        sortState.col = col;
        sortState.dir = 'asc';
      }
      updateSortUI();
      sortRows();
    });
  });
}

function updateSortUI() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    const isActive = btn.dataset.col === sortState.col;
    btn.classList.toggle('active', isActive);
    btn.dataset.dir = isActive ? sortState.dir : '';
    const th = btn.closest('th');
    if (th) th.setAttribute('aria-sort', isActive
      ? (sortState.dir === 'asc' ? 'ascending' : 'descending')
      : 'none');
  });
}

function sortRows() {
  const tbody = document.getElementById('project-tbody');
  if (!tbody) return;
  const rows = [...tbody.querySelectorAll('tr[data-name]')];

  rows.sort((a, b) => {
    let av, bv;
    if (sortState.col === 'name') {
      av = a.dataset.name;
      bv = b.dataset.name;
    } else if (sortState.col === 'status') {
      av = Number(a.dataset.status);
      bv = Number(b.dataset.status);
    } else {
      return 0;
    }
    if (av < bv) return sortState.dir === 'asc' ? -1 : 1;
    if (av > bv) return sortState.dir === 'asc' ?  1 : -1;
    return 0;
  });

  rows.forEach(r => tbody.appendChild(r));
}

// ─────────────────────────────────────────────────────────────
//  Search & filter
// ─────────────────────────────────────────────────────────────

function buildTagFilters(projects) {
  const container = document.getElementById('tag-filters');
  if (!container) return;

  const allTags = [...new Set(
    projects.flatMap(p => (p.tags || []).map(t => t.toLowerCase()))
  )].sort();

  if (!allTags.length) return;

  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-filter';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      const active = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!active));
      btn.classList.toggle('active', !active);
      applyFilters({ pushState: true });
    });
    container.appendChild(btn);
  });
}

function applyFilters({ pushState = false } = {}) {
  const input      = document.getElementById('search-input');
  const clearBtn   = document.getElementById('search-clear');
  const noResults  = document.getElementById('no-results');
  const noResTerm  = document.getElementById('no-results-term');
  const countBar   = document.getElementById('count-bar');
  const countText  = document.getElementById('count-text');
  const resetBtn   = document.getElementById('count-reset');

  const query      = (input?.value || '').toLowerCase().trim();
  const activeTags = [...document.querySelectorAll('.tag-filter.active')].map(b => b.dataset.tag);
  const isFiltered = query || activeTags.length;

  const rows  = document.querySelectorAll('#project-tbody tr[data-name]');
  const total = rows.length;
  let visible = 0;

  rows.forEach(row => {
    const matchesSearch = !query || row.dataset.search.includes(query);
    const rowTags       = row.dataset.tags ? row.dataset.tags.split(',') : [];
    const matchesTags   = !activeTags.length || activeTags.every(t => rowTags.includes(t));
    const show          = matchesSearch && matchesTags;
    row.hidden = !show;
    if (show) visible++;
  });

  // Count bar
  if (countBar && countText) {
    countBar.hidden = false;
    countText.textContent = isFiltered
      ? `${visible} of ${total} cheatsheet${total !== 1 ? 's' : ''}`
      : `${total} cheatsheet${total !== 1 ? 's' : ''}`;
    if (resetBtn) resetBtn.hidden = !isFiltered;
  }

  // No-results
  if (noResults) {
    noResults.hidden = visible > 0;
    if (noResTerm) {
      const parts = [];
      if (query)             parts.push(`"${query}"`);
      if (activeTags.length) parts.push(activeTags.map(t => `#${t}`).join(' '));
      noResTerm.textContent = parts.join(' + ');
    }
  }

  if (pushState) syncUrl(query, activeTags);
}

function syncUrl(query, activeTags) {
  const params = new URLSearchParams();
  if (query)             params.set('q', query);
  if (activeTags.length) params.set('tags', activeTags.join(','));
  const newUrl = params.toString() ? `${location.pathname}?${params}` : location.pathname;
  history.pushState({ query, activeTags }, '', newUrl);
}

function restoreFromUrl() {
  const params = new URLSearchParams(location.search);
  const q    = params.get('q')    || '';
  const tags = params.get('tags') ? params.get('tags').split(',') : [];

  const input = document.getElementById('search-input');
  if (input && q) input.value = q;

  tags.forEach(tag => {
    const btn = document.querySelector(`.tag-filter[data-tag="${tag}"]`);
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }
  });

  applyFilters({ pushState: false });
}

function initSearch() {
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  const resetBtn = document.getElementById('count-reset');
  if (!input) return;

  // Set correct initial state before any interaction
  input.addEventListener('input', () => applyFilters({ pushState: true }));
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; applyFilters({ pushState: true }); input.blur(); }
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    applyFilters({ pushState: true });
    input.focus();
  });
  resetBtn?.addEventListener('click', () => {
    input.value = '';
    document.querySelectorAll('.tag-filter.active').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    applyFilters({ pushState: true });
  });
  window.addEventListener('popstate', () => restoreFromUrl());
}

// ─────────────────────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────────────────────

async function loadProjects() {
  const tbody   = document.getElementById('project-tbody');
  const tableWrap = document.getElementById('table-wrap');

  try {
    const res = await fetch('./projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const { projects } = validatePayload(data);

    tbody.innerHTML = '';

    if (!projects.length) {
      // Replace the whole table with an empty state
      tableWrap.outerHTML = `
        <div class="empty-state" role="status" aria-label="No cheatsheets yet">
          <svg class="empty-illustration" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="30" y="20" width="140" height="100" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
            <rect x="44" y="36" width="56" height="7" rx="3" fill="currentColor" opacity="0.25"/>
            <rect x="44" y="50" width="90" height="5" rx="2.5" fill="currentColor" opacity="0.13"/>
            <rect x="44" y="62" width="72" height="5" rx="2.5" fill="currentColor" opacity="0.10"/>
            <rect x="44" y="80" width="28" height="22" rx="4" fill="currentColor" opacity="0.08"/>
            <rect x="78" y="80" width="28" height="22" rx="4" fill="currentColor" opacity="0.08"/>
            <circle cx="155" cy="110" r="22" fill="#c8f060" opacity="0.12"/>
            <circle cx="155" cy="110" r="22" fill="none" stroke="#c8f060" stroke-width="1.5" opacity="0.3"/>
            <line x1="155" y1="102" x2="155" y2="118" stroke="#c8f060" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <line x1="147" y1="110" x2="163" y2="110" stroke="#c8f060" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
          </svg>
          <p class="empty-title">No cheatsheets yet</p>
          <p class="empty-hint">Add entries to <code>projects.json</code> to see them here.</p>
        </div>`;
      return;
    }

    projects.forEach(p => tbody.appendChild(renderRow(p)));
    buildTagFilters(projects);
    initSort(projects);
    initSearch();
    restoreFromUrl();

  } catch (err) {
    console.error('Failed to load projects.json:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="state-msg">
      Could not load projects.json — check the console for details.<br>
      <span style="font-size:11px;opacity:0.6">${err.message}</span>
    </td></tr>`;
  }
}

loadProjects();
