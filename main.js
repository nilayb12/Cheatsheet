// ── Inline SVG icons (no external dependency) ──
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
const VALID_STATUSES = new Set(['live', 'wip', 'archived']);
const VALID_PATH_RE  = /^[a-zA-Z0-9_-]+$/;

// ─────────────────────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────────────────────

function validateEntry(p, idx) {
  const warnings = [];
  const label = `projects.json[${idx}]`;

  if (typeof p !== 'object' || p === null || Array.isArray(p)) {
    return { valid: false, warnings: [`${label}: entry must be an object, got ${typeof p}`] };
  }
  if (!p.name || typeof p.name !== 'string' || !p.name.trim())
    warnings.push(`${label}: "name" is required and must be a non-empty string`);
  if (!p.path || typeof p.path !== 'string' || !p.path.trim())
    warnings.push(`${label} ("${p.name || '?'}"): "path" is required and must be a non-empty string`);
  else if (!VALID_PATH_RE.test(p.path))
    warnings.push(`${label} ("${p.name}"): "path" must contain only letters, numbers, hyphens, and underscores — got "${p.path}"`);
  if ('desc'   in p && typeof p.desc   !== 'string') warnings.push(`${label} ("${p.name}"): "desc" must be a string`);
  if ('icon'   in p && typeof p.icon   !== 'string') warnings.push(`${label} ("${p.name}"): "icon" must be a string (emoji)`);
  if ('status' in p && !VALID_STATUSES.has(p.status)) warnings.push(`${label} ("${p.name}"): "status" must be one of: live, wip, archived — got "${p.status}"`);
  if ('tags'   in p) {
    if (!Array.isArray(p.tags)) warnings.push(`${label} ("${p.name}"): "tags" must be an array`);
    else p.tags.forEach((t, ti) => {
      if (typeof t !== 'string' || !t.trim())
        warnings.push(`${label} ("${p.name}"): tags[${ti}] must be a non-empty string`);
    });
  }
  const known = new Set(['name', 'path', 'desc', 'icon', 'status', 'tags']);
  Object.keys(p).forEach(k => {
    if (!known.has(k))
      warnings.push(`${label} ("${p.name}"): unknown field "${k}" — known fields: ${[...known].join(', ')}`);
  });

  return { valid: !warnings.some(w => w.includes('required') || w.includes('must be')), warnings };
}

function validatePayload(data) {
  let raw;
  if (Array.isArray(data)) {
    console.info('projects.json: loaded as array. Consider switching to the object format with a $schema reference.');
    raw = data;
  } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
    raw = data.projects;
  } else {
    throw new Error('projects.json must be an array of projects, or an object with a "projects" array.');
  }

  let totalWarnings = 0;
  const valid = [];
  raw.forEach((entry, idx) => {
    const { valid: ok, warnings } = validateEntry(entry, idx);
    warnings.forEach(w => console.warn(`⚠ ${w}`));
    totalWarnings += warnings.length;
    if (ok) valid.push(entry);
    else console.error(`✖ projects.json[${idx}] skipped due to validation errors above.`);
  });

  const paths = valid.map(p => p.path);
  paths.forEach((p, i) => {
    if (paths.indexOf(p) !== i) { console.warn(`⚠ duplicate path "${p}" — first occurrence kept`); totalWarnings++; }
  });
  const seen = new Set();
  const deduped = valid.filter(p => { if (seen.has(p.path)) return false; seen.add(p.path); return true; });

  totalWarnings === 0
    ? console.info(`✔ projects.json: ${deduped.length} project(s) loaded, no issues.`)
    : console.warn(`projects.json: ${deduped.length} project(s) loaded with ${totalWarnings} warning(s).`);

  return { projects: deduped, totalWarnings };
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

function renderCard(p) {
  const el = document.createElement('div');
  el.className = 'card';
  el.setAttribute('role', 'listitem');
  // Store normalised text for search matching
  el.dataset.search = `${p.name} ${p.desc || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
  el.dataset.tags   = (p.tags || []).map(t => t.toLowerCase()).join(',');

  const status = p.status || 'live';
  const tags = Array.isArray(p.tags) && p.tags.length
    ? `<div class="card-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
    : '';

  el.innerHTML = `
    <a class="card-body" href="${p.path}/" target="_blank" rel="noopener"
       aria-label="Open live site: ${p.name}">
      <div class="card-top">
        <span class="card-icon" aria-hidden="true">${p.icon || '📁'}</span>
      </div>
      <div class="card-name-row">
        <span class="card-name">${p.name}</span>
        <span class="badge ${STATUS_CLASS[status] || 'badge-live'}">${STATUS_LABEL[status] || status}</span>
      </div>
      <div class="card-path">./${p.path}/</div>
      ${p.desc ? `<div class="card-desc">${p.desc}</div>` : ''}
      ${tags}
    </a>
    <div class="card-actions">
      <a href="${p.path}/" target="_blank" rel="noopener"
         aria-label="Open live site: ${p.name}" tabindex="-1" aria-hidden="true">
        ${ICON_LIVE} Live site
      </a>
      <div class="sep" aria-hidden="true"></div>
      <a href="${sourceUrl(p.path)}" target="_blank" rel="noopener"
         aria-label="View source for ${p.name} on GitHub">
        ${ICON_SOURCE} Source
      </a>
    </div>
  `;
  return el;
}

// ─────────────────────────────────────────────────────────────
//  Search & filter
// ─────────────────────────────────────────────────────────────

/**
 * Builds the tag filter chips from the full project list.
 * Chips are sorted alphabetically; clicking one toggles it.
 */
function buildTagFilters(projects) {
  const container = document.getElementById('tag-filters');
  if (!container) return;

  // Collect unique tags across all projects
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
      applyFilters();
    });
    container.appendChild(btn);
  });
}

/**
 * Reads the current search query and active tag chips,
 * then shows/hides cards accordingly.
 */
function applyFilters() {
  const query      = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const clearBtn   = document.getElementById('search-clear');
  const noResults  = document.getElementById('no-results');
  const noResTerm  = document.getElementById('no-results-term');
  const activeTags = [...document.querySelectorAll('.tag-filter.active')].map(b => b.dataset.tag);

  if (clearBtn) clearBtn.hidden = !query;

  const cards = document.querySelectorAll('#project-grid .card');
  let visible = 0;

  cards.forEach(card => {
    const matchesSearch = !query || card.dataset.search.includes(query);
    const cardTags      = card.dataset.tags ? card.dataset.tags.split(',') : [];
    const matchesTags   = !activeTags.length || activeTags.every(t => cardTags.includes(t));
    const show          = matchesSearch && matchesTags;

    card.hidden = !show;
    if (show) visible++;
  });

  if (noResults) {
    noResults.hidden = visible > 0;
    if (noResTerm) {
      const parts = [];
      if (query)             parts.push(`"${query}"`);
      if (activeTags.length) parts.push(activeTags.map(t => `#${t}`).join(' '));
      noResTerm.textContent = parts.join(' + ');
    }
  }
}

function initSearch() {
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (!input) return;

  input.addEventListener('input', applyFilters);
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; applyFilters(); input.blur(); }
  });

  clearBtn?.addEventListener('click', () => { input.value = ''; applyFilters(); input.focus(); });
}

// ─────────────────────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────────────────────

async function loadProjects() {
  const grid = document.getElementById('project-grid');
  try {
    const res = await fetch('./projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status} — make sure projects.json exists in the repo root`);

    const data = await res.json();
    const { projects } = validatePayload(data);

    grid.innerHTML = '';
    if (!projects.length) {
      grid.outerHTML = `
        <div class="empty-state" role="status" aria-label="No projects yet">
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
          <p class="empty-title">No projects yet</p>
          <p class="empty-hint">Add entries to <code>projects.json</code> to see them here.</p>
        </div>`;
      return;
    }

    projects.forEach(p => grid.appendChild(renderCard(p)));
    buildTagFilters(projects);
    initSearch();

  } catch (err) {
    console.error('Failed to load projects.json:', err);
    grid.innerHTML = `
      <p class="state-msg">
        Could not load projects.json — check the browser console for details.<br>
        <span style="font-size:11px;opacity:0.6">${err.message}</span>
      </p>`;
  }
}

loadProjects();
