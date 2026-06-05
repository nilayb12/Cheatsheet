/* ================================================================
   PySpark & Databricks Cheatsheet — layout.js
   Sidebar toggle + scroll offset sync
   ================================================================ */

(function () {
  'use strict';

  function syncLayout() {
    const header  = document.querySelector('#chrome > header');
    if (!header) return;
    const headerH = header.getBoundingClientRect().height;

    // Push scrollable content below fixed chrome
    const wrapper = document.getElementById('main-wrapper');
    if (wrapper) wrapper.style.paddingTop = headerH + 'px';

    // Footer margin mirrors main-wrapper
    const footer = document.getElementById('page-footer');
    if (footer) {
      const collapsed = document.body.classList.contains('nav-collapsed');
      footer.style.marginLeft = collapsed
        ? 'var(--sidebar-collapsed)'
        : 'var(--sidebar-w)';
      footer.style.transition = 'margin-left var(--transition)';
    }

    // Anchor scroll offset = header height + small breathing room
    const scrollGap = headerH + 16;
    document.querySelectorAll('.section, .part-divider, .part-heading')
      .forEach(el => { el.style.scrollMarginTop = scrollGap + 'px'; });
  }

  function toggleNav() {
    const sidebar  = document.getElementById('sidebar');
    const navIcon  = document.getElementById('nav-icon');
    const footer   = document.getElementById('page-footer');

    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('nav-collapsed');

    const collapsed = sidebar.classList.contains('collapsed');
    if (navIcon) navIcon.textContent = collapsed ? '☰' : '✕';

    if (footer) {
      footer.style.marginLeft = collapsed
        ? 'var(--sidebar-collapsed)'
        : 'var(--sidebar-w)';
    }
  }

  // Keyboard shortcut: [ to toggle sidebar
  function onKeydown(e) {
    if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        toggleNav();
      }
    }
  }

  window.addEventListener('DOMContentLoaded', syncLayout);
  window.addEventListener('resize', syncLayout);
  document.addEventListener('keydown', onKeydown);

  // Expose globally for inline onclick
  window.toggleNav = toggleNav;

}());
