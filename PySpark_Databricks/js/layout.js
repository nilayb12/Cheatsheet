/* ================================================================
   PySpark & Databricks Cheatsheet — layout.js
   Single-page: sidebar toggle + mobile drawer + scroll-offset sync
   ================================================================ */
(function () {
  'use strict';

  function syncLayout() {
    var header = document.querySelector('#chrome > header');
    if (!header) return;
    var h = header.getBoundingClientRect().height;

    var wrapper = document.getElementById('main-wrapper');
    if (wrapper) wrapper.style.paddingTop = h + 'px';

    var footer = document.getElementById('page-footer');
    if (footer) {
      var collapsed = document.body.classList.contains('nav-collapsed');
      footer.style.marginLeft = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)';
      footer.style.transition = 'margin-left var(--transition)';
    }

    var gap = h + 16;
    document.querySelectorAll('.section, .part-divider, .part-heading')
      .forEach(function (el) { el.style.scrollMarginTop = gap + 'px'; });
  }

  function toggleNav() {
    var sidebar = document.getElementById('sidebar');
    var navIcon = document.getElementById('nav-icon');
    var footer  = document.getElementById('page-footer');
    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('nav-collapsed');
    var collapsed = sidebar.classList.contains('collapsed');
    if (navIcon) navIcon.textContent = collapsed ? '☰' : '✕';
    if (footer) footer.style.marginLeft = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)';
  }

  /* ── Mobile drawer ── */
  function mobDrawerOpen() {
    document.getElementById('mob-drawer').classList.add('open');
    document.getElementById('mob-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    syncMobTheme();
  }
  function mobDrawerClose() {
    document.getElementById('mob-drawer').classList.remove('open');
    document.getElementById('mob-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  function syncMobTheme() {
    var desk = document.getElementById('theme-input');
    var mob  = document.getElementById('theme-input-mob');
    if (desk && mob) mob.checked = desk.checked;
    var lbl = document.getElementById('mob-theme-label');
    if (lbl) lbl.textContent = document.body.classList.contains('light') ? 'Light mode' : 'Dark mode';
  }

  function onKeydown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === '[') toggleNav();
    if (e.key === 'Escape') mobDrawerClose();
  }

  window.addEventListener('DOMContentLoaded', function () {
    syncLayout();
    // Mobile theme toggle → drive theme through desktop toggle
    var mob = document.getElementById('theme-input-mob');
    var desk = document.getElementById('theme-input');
    if (mob && desk) {
      mob.addEventListener('change', function () {
        desk.checked = mob.checked;
        desk.dispatchEvent(new Event('change'));
        var lbl = document.getElementById('mob-theme-label');
        if (lbl) lbl.textContent = mob.checked ? 'Dark mode' : 'Light mode';
      });
    }
  });
  window.addEventListener('resize', syncLayout);
  document.addEventListener('keydown', onKeydown);

  window.toggleNav = toggleNav;
  window.mobDrawerOpen = mobDrawerOpen;
  window.mobDrawerClose = mobDrawerClose;
}());
