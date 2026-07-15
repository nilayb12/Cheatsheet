/* Python Cheatsheet — layout.js */
(function(){
'use strict';
function syncLayout(){
  var hdr=document.querySelector('#chrome > header');
  if(!hdr) return;
  var h=hdr.getBoundingClientRect().height;
  var w=document.getElementById('main-wrapper');
  if(w) w.style.paddingTop=h+'px';
  var ft=document.getElementById('page-footer');
  if(ft) ft.style.marginLeft=document.body.classList.contains('nav-collapsed')?'var(--sc)':'var(--sw)';
  document.querySelectorAll('.section,.part-divider,.part-heading')
    .forEach(function(el){el.style.scrollMarginTop=(h+14)+'px';});
}
function toggleNav(){
  var sb=document.getElementById('sidebar');
  var ic=document.getElementById('nav-icon');
  var ft=document.getElementById('page-footer');
  sb.classList.toggle('collapsed');
  document.body.classList.toggle('nav-collapsed');
  var c=sb.classList.contains('collapsed');
  if(ic) ic.textContent=c?'☰':'✕';
  if(ft) ft.style.marginLeft=c?'var(--sc)':'var(--sw)';
}
function switchPage(pid, keepScroll){
  if(window.loadPageCards) window.loadPageCards(pid);
  document.querySelectorAll('.page-panel').forEach(function(p){p.classList.remove('active');});
  var panel=document.getElementById('page-'+pid);
  if(panel) panel.classList.add('active');
  document.querySelectorAll('.page-tab').forEach(function(t){
    t.classList.toggle('active',t.dataset.page===pid);
  });
  document.querySelectorAll('.nav-page-btn').forEach(function(btn){
    var active=btn.dataset.page===pid;
    btn.classList.toggle('active',active);
    btn.classList.toggle('pg-closed',!active);
    var links=document.getElementById('nav-links-'+btn.dataset.page);
    if(links) links.classList.toggle('hidden',!active);
  });
  if(!keepScroll){
    var w=document.getElementById('main-wrapper');
    if(w) w.scrollTop=0;
    window.scrollTo(0,0);
  }
  try{sessionStorage.setItem('py-page',pid);}catch(e){}
}
function onKey(e){
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  var tag=document.activeElement&&document.activeElement.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA') return;
  if(e.key==='['){toggleNav();return;}
  var pages=['core','advanced','stdlib','datascience'];
  if(['1','2','3','4'].includes(e.key)) switchPage(pages[parseInt(e.key)-1]);
}
function init(){
  syncLayout();
  var p='core';
  try{p=sessionStorage.getItem('py-page')||'core';}catch(e){}
  switchPage(p);
}
window.addEventListener('DOMContentLoaded',init);
window.addEventListener('resize',syncLayout);
document.addEventListener('keydown',onKey);
window.toggleNav=toggleNav;
window.switchPage=switchPage;
}());
