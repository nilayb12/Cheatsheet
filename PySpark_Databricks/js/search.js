/* ================================================================
   PySpark & Databricks Cheatsheet — search.js
   Single-page search: filters cards, scrolls to & highlights match.
   Ctrl/Cmd+K or "/" focuses; ↑↓ navigate; Enter opens.
   ================================================================ */
(function () {
  'use strict';

  var INDEX = [];
  function buildIndex() {
    document.querySelectorAll('.section').forEach(function (sec) {
      var titleEl = sec.querySelector('.section-title');
      if (!titleEl) return;
      var section = titleEl.textContent.trim();
      // Is this section under the Databricks part?
      var isDb = !!sec.closest('[data-part="databricks"]') ||
                 sec.querySelector('.db-badge') !== null;
      sec.querySelectorAll('.card').forEach(function (card) {
        var lblEl = card.querySelector('.card-label');
        if (!lblEl) return;
        var label = Array.prototype.filter
          .call(lblEl.childNodes, function (n) { return n.nodeType === 3; })
          .map(function (n) { return n.textContent; }).join('').trim();
        INDEX.push({ label: label, section: section, group: isDb ? 'Databricks' : 'PySpark', cardEl: card });
      });
    });
  }

  function score(entry, q) {
    var lbl = entry.label.toLowerCase();
    var sec = entry.section.toLowerCase();
    var ql = q.toLowerCase().trim();
    if (!ql) return -1;
    if (lbl.indexOf(ql) === 0) return 100 + (10 - ql.length);
    if (lbl.indexOf(ql) !== -1) return 80;
    if (sec.indexOf(ql) !== -1) return 60;
    var words = ql.split(/\s+/);
    var combined = lbl + ' ' + sec;
    if (words.every(function (w) { return combined.indexOf(w) !== -1; })) return 40;
    return -1;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlight(text, q) {
    if (!q) return esc(text);
    return esc(text).replace(new RegExp('(' + escRe(q.toLowerCase().trim()) + ')', 'gi'), '<span class="sr-match">$1</span>');
  }

  var activeIdx = -1;
  var current = [];

  function showResults(q) {
    var box = document.getElementById('search-results');
    if (!q.trim()) { box.innerHTML = ''; box.classList.remove('open'); activeIdx = -1; current = []; return; }
    current = INDEX.map(function (e) { return { e: e, s: score(e, q) }; })
      .filter(function (x) { return x.s >= 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12).map(function (x) { return x.e; });

    if (!current.length) {
      box.innerHTML = '<div class="sr-empty">No results for "' + esc(q) + '"</div>';
      box.classList.add('open'); activeIdx = -1; return;
    }
    box.innerHTML = current.map(function (e, i) {
      return '<div class="sr-item" data-idx="' + i + '" role="option">'
        + '<span class="sr-label">' + highlight(e.label, q) + '</span>'
        + '<span class="sr-section">' + highlight(e.section, q) + '</span>'
        + '<span class="sr-page">' + esc(e.group) + '</span></div>';
    }).join('');
    box.classList.add('open');
    activeIdx = -1;
    box.querySelectorAll('.sr-item').forEach(function (item) {
      item.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        pick(current[parseInt(item.getAttribute('data-idx'))]);
      });
    });
  }

  function setActive(idx) {
    var box = document.getElementById('search-results');
    var items = box.querySelectorAll('.sr-item');
    if (!items.length) return;
    if (idx < 0) idx = items.length - 1;
    if (idx >= items.length) idx = 0;
    activeIdx = idx;
    items.forEach(function (it, i) { it.classList.toggle('active', i === idx); });
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  function pick(entry) {
    if (!entry) return;
    var box = document.getElementById('search-results');
    var input = document.getElementById('search-input');
    box.classList.remove('open'); box.innerHTML = '';
    if (input) input.value = '';
    activeIdx = -1;
    // Expand any collapsed sidebar? Not needed. Scroll to card & flash.
    entry.cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    entry.cardEl.classList.add('sr-flash');
    setTimeout(function () { entry.cardEl.classList.remove('sr-flash'); }, 1600);
    // Open the detail panel after the scroll settles
    setTimeout(function () { entry.cardEl.click(); }, 320);
  }

  function init() {
    buildIndex();
    var input = document.getElementById('search-input');
    var box = document.getElementById('search-results');
    if (!input || !box) return;

    input.addEventListener('input', function () { showResults(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && current[activeIdx]) pick(current[activeIdx]);
        else if (current.length) pick(current[0]);
      } else if (e.key === 'Escape') {
        input.value = ''; box.innerHTML = ''; box.classList.remove('open'); input.blur();
      }
    });
    document.addEventListener('mousedown', function (ev) {
      if (!input.contains(ev.target) && !box.contains(ev.target)) box.classList.remove('open');
    });
    // Global shortcuts: Ctrl/Cmd+K or "/"
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
      else if (e.key === '/' && document.activeElement !== input) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); input.focus(); }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
