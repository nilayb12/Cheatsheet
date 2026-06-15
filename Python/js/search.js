/* Python Cheatsheet — search.js */
(function(){
'use strict';

// ── Page mapping ──────────────────────────────────────────────────
var PAGE_OF = {
  // Core Language
  'types & literals':'core','strings':'core','lists':'core','tuples':'core',
  'sets & frozensets':'core','dictionaries':'core','control flow':'core',
  'functions':'core','comprehensions & generators':'core',
  'error handling':'core','file i/o & context managers':'core',
  'builtins & operators':'core',
  // Advanced
  'classes & inheritance':'advanced','protocols & abstract classes':'advanced',
  'dunder methods':'advanced','decorators':'advanced',
  'generators & iterators':'advanced','async / await':'advanced',
  'type hints':'advanced','dataclasses':'advanced',
  'memory & performance':'advanced','concurrency':'advanced',
  // Stdlib
  'imports & packages':'stdlib','os':'stdlib','sys':'stdlib','pathlib':'stdlib','collections':'stdlib',
  'enum':'stdlib',
  'itertools':'stdlib','functools':'stdlib','datetime':'stdlib',
  'regular expressions':'stdlib','json & csv':'stdlib','logging':'stdlib',
  'subprocess':'stdlib','argparse':'stdlib','virtual environments & packaging':'stdlib','unittest':'stdlib',
  // Data Science
  'numpy — arrays':'datascience','numpy — operations':'datascience',
  'pandas — series & dataframe':'datascience',
  'pandas — transform & clean':'datascience',
  'pandas — groupby & merge':'datascience',
  'matplotlib':'datascience','requests':'datascience',
  'pydantic v2':'datascience','pytest':'datascience',
  'sqlalchemy 2.0':'datascience'
};
var PAGE_LABEL = {
  core:'Core', advanced:'Advanced', stdlib:'Stdlib', datascience:'Data Science'
};

// ── Build index from DOM ──────────────────────────────────────────
// Each entry: { label, section, page, cardEl }
var INDEX = [];
function buildIndex(){
  document.querySelectorAll('.section').forEach(function(sec){
    var titleEl = sec.querySelector('.section-title');
    if(!titleEl) return;
    var section = titleEl.textContent.trim();
    var sectionLow = section.toLowerCase();
    var page = null;
    for(var k in PAGE_OF){
      if(sectionLow.includes(k)){ page = PAGE_OF[k]; break; }
    }
    if(!page) page = 'core';
    sec.querySelectorAll('.card').forEach(function(card){
      var lblEl = card.querySelector('.card-label');
      if(!lblEl) return;
      INDEX.push({
        label: Array.from(lblEl.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.textContent;}).join('').trim(),
        section: section,
        page: page,
        cardEl: card
      });
    });
  });
}

// ── Fuzzy/substring match with score ─────────────────────────────
function score(entry, q){
  var lbl   = entry.label.toLowerCase();
  var sec   = entry.section.toLowerCase();
  var ql    = q.toLowerCase().trim();
  if(!ql) return -1;
  // Exact label start: highest priority
  if(lbl.startsWith(ql)) return 100 + (10 - ql.length);
  // Exact label contains
  if(lbl.includes(ql)) return 80;
  // Section contains
  if(sec.includes(ql)) return 60;
  // All query words present somewhere
  var words = ql.split(/\s+/);
  var combined = lbl + ' ' + sec;
  if(words.every(function(w){ return combined.includes(w); })) return 40;
  return -1;
}

function highlight(text, q){
  if(!q) return esc(text);
  var escaped = esc(text);
  var eQ = escRe(q.toLowerCase().trim());
  return escaped.replace(new RegExp('(' + eQ + ')', 'gi'),
    '<span class="sr-match">$1</span>');
}
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// ── Render results ────────────────────────────────────────────────
var activeIdx = -1;

function showResults(q){
  var box = document.getElementById('search-results');
  if(!q.trim()){
    box.innerHTML=''; box.classList.remove('open'); activeIdx=-1; return;
  }
  var scored = INDEX.map(function(e){ return {e:e, s:score(e,q)}; })
    .filter(function(x){ return x.s >= 0; })
    .sort(function(a,b){ return b.s - a.s; })
    .slice(0, 12);

  if(!scored.length){
    box.innerHTML = '<div class="sr-empty">No results for "'+esc(q)+'"</div>';
    box.classList.add('open'); activeIdx=-1; return;
  }

  box.innerHTML = scored.map(function(x, i){
    var e = x.e;
    return '<div class="sr-item" data-idx="'+i+'" role="option">'
      + '<span class="sr-label">'+highlight(e.label, q)+'</span>'
      + '<span class="sr-section">'+highlight(e.section, q)+'</span>'
      + '<span class="sr-page">'+esc(PAGE_LABEL[e.page]||e.page)+'</span>'
      + '</div>';
  }).join('');

  // Store scored list for keyboard nav
  box._scored = scored;
  box.classList.add('open');
  activeIdx = -1;

  // Click handlers
  box.querySelectorAll('.sr-item').forEach(function(item){
    item.addEventListener('mousedown', function(ev){
      ev.preventDefault(); // don't blur input
      var idx = parseInt(item.getAttribute('data-idx'));
      pick(scored[idx].e);
    });
  });
}

function setActive(box, idx){
  var items = box.querySelectorAll('.sr-item');
  items.forEach(function(it){ it.classList.remove('active'); });
  if(idx >= 0 && idx < items.length){
    items[idx].classList.add('active');
    items[idx].scrollIntoView({block:'nearest'});
  }
  activeIdx = idx;
}

function pick(entry){
  // Switch to the right page
  if(typeof window.switchPage === 'function') window.switchPage(entry.page);
  // Small delay to let page render before opening panel
  setTimeout(function(){
    // Scroll card into view then simulate click
    entry.cardEl.scrollIntoView({behavior:'smooth', block:'center'});
    entry.cardEl.click();
  }, 80);
  // Clear search
  var input = document.getElementById('search-input');
  var box   = document.getElementById('search-results');
  input.value = '';
  box.innerHTML = '';
  box.classList.remove('open');
  input.blur();
  activeIdx = -1;
}

// ── Wire up events ────────────────────────────────────────────────
function init(){
  buildIndex();

  var input = document.getElementById('search-input');
  var box   = document.getElementById('search-results');
  if(!input || !box) return;

  // Update shortcut hint (⌘K on Mac, Ctrl+K elsewhere)
  var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform||'');
  var kbdEl = document.getElementById('search-kbd');
  if(kbdEl) kbdEl.textContent = isMac ? '⌘K' : 'Ctrl+K';

  input.addEventListener('input', function(){
    showResults(input.value);
  });

  input.addEventListener('keydown', function(e){
    var scored = box._scored || [];
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      setActive(box, Math.min(activeIdx + 1, scored.length - 1));
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      setActive(box, Math.max(activeIdx - 1, 0));
    } else if(e.key === 'Enter'){
      e.preventDefault();
      if(activeIdx >= 0 && scored[activeIdx]) pick(scored[activeIdx].e);
      else if(scored.length) pick(scored[0].e);
    } else if(e.key === 'Escape'){
      input.value = '';
      box.innerHTML = '';
      box.classList.remove('open');
      input.blur();
      activeIdx = -1;
    }
  });

  // Close on click outside
  document.addEventListener('mousedown', function(e){
    if(!input.contains(e.target) && !box.contains(e.target)){
      box.classList.remove('open');
      activeIdx = -1;
    }
  });

  // Global shortcut: Ctrl+K / Cmd+K or "/" to focus search
  document.addEventListener('keydown', function(e){
    var tag = document.activeElement && document.activeElement.tagName;
    // Ctrl+K / Cmd+K anywhere
    if((e.ctrlKey || e.metaKey) && e.key === 'k'){
      e.preventDefault();
      input.focus();
      input.select();
      return;
    }
    // "/" when not in an input
    if(e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA'){
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}

if(document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init);
else
  init();


}());
