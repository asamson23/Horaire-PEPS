// filters.js — Faceted filters that display available options under each category
// (Heures / Informations / Configuration) and search suggestions.

(function() {
  let initialized = false;
  const TYPES = ['heure', 'informations', 'configuration'];
  const labels = {
    heure: 'Heures',
    informations: 'Informations',
    configuration: 'Configuration'
  };

  const optionsByType = { heure: new Map(), informations: new Map(), configuration: new Map() };
  const selectedByType = { heure: new Set(), informations: new Set(), configuration: new Set() };
  const selectedKeywords = new Set();

  function ensureToolbar() {
    if (document.getElementById('filtersBar')) return;
    const container = document.querySelector('.container');
    if (!container) return;

    const bar = document.createElement('div');
    bar.id = 'filtersBar';
    bar.className = 'mb-3';
    bar.innerHTML = `
      <div class="row gy-3 align-items-start">
        <div class="col-12 col-lg-4">
          <h6 class="mb-2"><i class="fa-solid fa-clock"></i> Heures</h6>
          <div id="opts-heure" class="filters-list small"></div>
        </div>
        <div class="col-12 col-lg-4">
          <h6 class="mb-2"><i class="fa-solid fa-circle-info"></i> Informations</h6>
          <div id="opts-informations" class="filters-list small"></div>
        </div>
        <div class="col-12 col-lg-4">
          <h6 class="mb-2"><i class="fa-solid fa-water"></i> Configuration</h6>
          <div id="opts-configuration" class="filters-list small"></div>
        </div>
        <div class="col-12">
          <div class="input-group" style="max-width: 520px;">
            <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input id="searchInput" type="search" class="form-control" placeholder="Rechercher dans toutes les sections...">
            <button id="clearSearch" class="btn btn-outline-secondary" type="button" title="Effacer">&times;</button>
          </div>
          <div id="search-suggestions" class="mt-2 d-flex flex-wrap gap-2"></div>
          <div id="search-selected" class="mt-2 d-flex flex-wrap gap-2"></div>
        </div>
      </div>
    `;

    const schedule = document.getElementById('schedule');
    container.insertBefore(bar, schedule || container.firstChild);
  }

  function annotateSections() {
    const cards = document.querySelectorAll('#schedule .card .card-text');
    cards.forEach(card => {
      if (card.querySelector('.section[data-section]')) return;
      const headings = Array.from(card.querySelectorAll('h3'));
      headings.forEach(h => {
        const t = (h.textContent || '').trim().toLowerCase();
        let type = null;
        if (t.includes('heure')) type = 'heure';
        else if (t.includes('informations')) type = 'informations';
        else if (t.includes('configuration')) type = 'configuration';
        if (!type) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'section';
        wrapper.setAttribute('data-section', type);
        h.parentNode.insertBefore(wrapper, h);

        let node = h; // start at heading
        while (node) {
          const next = node.nextSibling;
          wrapper.appendChild(node);
          if (!next || (next.nodeType === 1 && next.tagName === 'H3')) break;
          node = next;
        }
      });
    });
  }

  function normalizeOption(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function extractLinesFromSection(sec) {
    let items = Array.from(sec.querySelectorAll('li, .activite-schedule-row, p, tr, h4, h5, span'))
      .map(el => normalizeOption(el.textContent || ''))
      .filter(t => t.length > 0);
    if (items.length === 0) {
      items = (sec.textContent || '')
        .split(/\n|•|\u2022| - | \| /)
        .map(normalizeOption)
        .filter(t => t.length > 0);
    }
    // Deduplicate within the section
    return Array.from(new Set(items));
  }

  function collectOptions() {
    TYPES.forEach(t => optionsByType[t].clear());
    const sections = document.querySelectorAll('#schedule .section[data-section]');
    sections.forEach(sec => {
      const type = sec.getAttribute('data-section');
      if (!TYPES.includes(type)) return;
      const lines = extractLinesFromSection(sec);
      lines.forEach(line => {
        const key = line.toLowerCase();
        const map = optionsByType[type];
        map.set(key, { label: line, count: (map.get(key)?.count || 0) + 1 });
      });
    });
  }

  function renderOptions() {
    TYPES.forEach(type => {
      const host = document.getElementById(`opts-${type}`);
      if (!host) return;
      const entries = Array.from(optionsByType[type].values())
        .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
      host.innerHTML = entries.map((opt, idx) => {
        const id = `filter-${type}-${idx}`;
        const checked = selectedByType[type].has(opt.label) ? 'checked' : '';
        return `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${encodeURIComponent(opt.label)}" id="${id}" ${checked}>
            <label class="form-check-label" for="${id}">${opt.label} <span class="text-muted">(${opt.count})</span></label>
          </div>`;
      }).join('');

      host.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
          const value = decodeURIComponent(input.value);
          if (input.checked) selectedByType[type].add(value);
          else selectedByType[type].delete(value);
          applyFilters();
        });
      });
    });
  }

  function gatherCardText(card) {
    return (card.textContent || '').toLowerCase();
  }

  function cardMatchesSelections(card) {
    // Per-type selections: card must match each selected group if any selected in that group
    for (const type of TYPES) {
      const sel = selectedByType[type];
      if (sel.size === 0) continue; // no constraint for this group
      const sec = card.querySelector(`.section[data-section="${type}"]`);
      if (!sec) return false;
      const text = (sec.textContent || '').toLowerCase();
      const any = Array.from(sel).some(label => text.includes(label.toLowerCase()));
      if (!any) return false;
    }

    // Keyword selections from search: must match all selected keywords
    if (selectedKeywords.size > 0) {
      const text = gatherCardText(card);
      for (const kw of selectedKeywords) {
        if (!text.includes(kw.toLowerCase())) return false;
      }
    }
    return true;
  }

  function applyFilters() {
    document.querySelectorAll('#schedule .card').forEach(card => {
      card.classList.toggle('d-none', !cardMatchesSelections(card));
    });
  }

  function updateSearchSuggestions() {
    const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    const suggestionsHost = document.getElementById('search-suggestions');
    if (!suggestionsHost) return;

    if (!q) { suggestionsHost.innerHTML = ''; return; }

    // Build list of distinct options across all types that include the query
    const pool = new Map();
    TYPES.forEach(t => {
      optionsByType[t].forEach(v => {
        const key = v.label.toLowerCase();
        if (key.includes(q)) pool.set(key, v.label);
      });
    });
    // Also include free-text suggestions from current visible content could be added here if desired

    const suggestions = Array.from(pool.values()).sort((a,b) => a.localeCompare(b, 'fr')).slice(0, 30);
    suggestionsHost.innerHTML = suggestions.map(label => {
      const disabled = selectedKeywords.has(label) ? 'disabled' : '';
      return `<button type="button" class="btn btn-sm btn-outline-secondary" data-label="${encodeURIComponent(label)}" ${disabled}>${label}</button>`;
    }).join('');

    suggestionsHost.querySelectorAll('button[data-label]').forEach(btn => {
      btn.addEventListener('click', () => {
        const label = decodeURIComponent(btn.getAttribute('data-label') || '');
        selectedKeywords.add(label);
        renderSelectedKeywords();
        applyFilters();
        updateSearchSuggestions();
      });
    });
  }

  function renderSelectedKeywords() {
    const host = document.getElementById('search-selected');
    if (!host) return;
    const arr = Array.from(selectedKeywords).sort((a,b)=>a.localeCompare(b, 'fr'));
    host.innerHTML = arr.map(label => `
      <span class="badge text-bg-secondary">
        ${label}
        <button type="button" class="btn btn-sm btn-link text-white ms-1 p-0 align-baseline" data-remove="${encodeURIComponent(label)}" title="Retirer">&times;</button>
      </span>
    `).join('');
    host.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const label = decodeURIComponent(btn.getAttribute('data-remove') || '');
        selectedKeywords.delete(label);
        renderSelectedKeywords();
        applyFilters();
        updateSearchSuggestions();
      });
    });
  }

  function bindEvents() {
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('clearSearch');
    if (input) input.addEventListener('input', updateSearchSuggestions);
    if (clear) clear.addEventListener('click', () => {
      if (input) input.value = '';
      updateSearchSuggestions();
    });
  }

  function setup() {
    if (initialized) return;
    const schedule = document.getElementById('schedule');
    if (!schedule || schedule.children.length === 0) return; // wait until content is present

    ensureToolbar();
    annotateSections();
    collectOptions();
    renderOptions();
    bindEvents();
    applyFilters();
    updateSearchSuggestions();
    renderSelectedKeywords();

    initialized = true;
  }

  window.addEventListener('schedule:ready', setup);
  document.addEventListener('DOMContentLoaded', () => setTimeout(setup, 0));
})();

