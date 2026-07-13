/* PySpark & Databricks Cheatsheet — theme.js */
/* Toggle logic based on OfficialKovid/animated-toggle-button-uiverse (MIT) */
(function(){
'use strict';

var STORAGE_KEY = 'spark-theme';
var DARK  = 'dark';
var LIGHT = 'light';

function getStored(){
  try{ return sessionStorage.getItem(STORAGE_KEY); }catch(e){ return null; }
}
function setStored(t){
  try{ sessionStorage.setItem(STORAGE_KEY, t); }catch(e){}
}
function systemPrefers(){
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
    ? LIGHT : DARK;
}

// Apply theme: sets body class and syncs checkbox
// suppressAnim=true during init so the knob doesn't animate on page load
function applyTheme(theme, suppressAnim){
  if(theme === LIGHT){
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
  var cb = document.getElementById('theme-input');
  if(cb){
    if(suppressAnim) document.body.classList.add('preload');
    // checked=true → dark (night sky), checked=false → light (blue sky)
    cb.checked = (theme === DARK);
    // Keep drawer toggle in sync
    var mobCb = document.getElementById('theme-input-mob');
    if(mobCb) mobCb.checked = (theme === DARK);
    if(suppressAnim){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          document.body.classList.remove('preload');
        });
      });
    }
  }
  setStored(theme);
}

document.addEventListener('DOMContentLoaded', function(){
  var cb = document.getElementById('theme-input');
  if(!cb) return;

  // Restore saved preference or detect system preference
  var stored = getStored();
  applyTheme(stored || systemPrefers(), true);

  // User click → animate normally
  cb.addEventListener('change', function(){
    applyTheme(this.checked ? DARK : LIGHT, false);
  });

  // Follow OS theme changes only when user hasn't manually set a preference
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e){
      if(!getStored()) applyTheme(e.matches ? LIGHT : DARK, true);
    });
  }
});

// Early flash prevention — runs before DOMContentLoaded
(function(){
  var t;
  try{ t = sessionStorage.getItem(STORAGE_KEY); }catch(e){}
  if(!t) t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
    ? LIGHT : DARK;
  document.body.classList.add('preload');
  if(t === LIGHT) document.body.classList.add('light');
})();

}());
