/* Python Cheatsheet — panel.js */
(function(){
'use strict';
var DOC={
  'types & literals':'https://docs.python.org/3/library/stdtypes.html',
  'strings':'https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str',
  'lists':'https://docs.python.org/3/library/stdtypes.html#lists',
  'tuples':'https://docs.python.org/3/library/stdtypes.html#tuples',
  'sets & frozensets':'https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset',
  'dictionaries':'https://docs.python.org/3/library/stdtypes.html#mapping-types-dict',
  'control flow':'https://docs.python.org/3/reference/compound_stmts.html',
  'functions':'https://docs.python.org/3/reference/compound_stmts.html#function-definitions',
  'comprehensions':'https://docs.python.org/3/reference/expressions.html#displays-for-lists-sets-and-dictionaries',
  'error handling':'https://docs.python.org/3/tutorial/errors.html',
  'file i/o':'https://docs.python.org/3/tutorial/inputoutput.html',
  'context managers':'https://docs.python.org/3/reference/datamodel.html#context-managers',
  'builtins':'https://docs.python.org/3/library/functions.html',
  'operators & expressions':'https://docs.python.org/3/reference/expressions.html',
  'oop':'https://docs.python.org/3/tutorial/classes.html',
  'special methods':'https://docs.python.org/3/reference/datamodel.html#special-method-names',
  'decorators':'https://docs.python.org/3/glossary.html#term-decorator',
  'generators & iterators':'https://docs.python.org/3/howto/functional.html#generators',
  'async / await':'https://docs.python.org/3/library/asyncio.html',
  'type hints':'https://docs.python.org/3/library/typing.html',
  'dataclasses':'https://docs.python.org/3/library/dataclasses.html',
  'descriptors':'https://docs.python.org/3/howto/descriptor.html',
  'metaclasses':'https://docs.python.org/3/reference/datamodel.html#metaclasses',
  'memory & performance':'https://docs.python.org/3/library/gc.html',
  'concurrency':'https://docs.python.org/3/library/concurrent.futures.html',
  'os & sys':'https://docs.python.org/3/library/os.html',
  'os':'https://docs.python.org/3/library/os.html',
  'sys':'https://docs.python.org/3/library/sys.html',
  'pathlib':'https://docs.python.org/3/library/pathlib.html',
  'collections':'https://docs.python.org/3/library/collections.html',
  'itertools':'https://docs.python.org/3/library/itertools.html',
  'functools':'https://docs.python.org/3/library/functools.html',
  'datetime':'https://docs.python.org/3/library/datetime.html',
  'regular expressions':'https://docs.python.org/3/library/re.html',
  'json & csv':'https://docs.python.org/3/library/json.html',
  'logging':'https://docs.python.org/3/library/logging.html',
  'subprocess':'https://docs.python.org/3/library/subprocess.html',
  'threading & multiprocessing':'https://docs.python.org/3/library/threading.html',
  'argparse':'https://docs.python.org/3/library/argparse.html',
  'unittest & doctest':'https://docs.python.org/3/library/unittest.html',
  'numpy':'https://numpy.org/doc/stable/reference/',
  'pandas':'https://pandas.pydata.org/docs/reference/',
  'matplotlib':'https://matplotlib.org/stable/api/index.html',
  'requests':'https://requests.readthedocs.io/en/latest/api/',
  'pydantic':'https://docs.pydantic.dev/latest/',
  'pytest':'https://docs.pytest.org/en/stable/',
  'sqlalchemy':'https://docs.sqlalchemy.org/en/20/',
};
function getDoc(section){
  var sl=section.toLowerCase();
  for(var k in DOC){ if(sl.includes(k)) return DOC[k]; }
  return 'https://docs.python.org/3/';
}
function makeKey(section,card){
  return section.toLowerCase().trim()+'::'+card.toLowerCase().trim();
}
function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function hi(code){
  // Expand compressed code tokens before highlighting
  code = code.replace(/§c§/g,'<code>').replace(/§\/c§/g,'</code>');
  var KW='False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield';
  return esc(code)
    .replace(new RegExp('\\b('+KW+')\\b','g'),'<span class="kw">$1</span>')
    .replace(/(#[^\n]*)/g,'<span class="cm">$1</span>');
}
function rp(t){
  return String(t)
    .replace(/§c§/g,'<code>')
    .replace(/§\/c§/g,'</code>')
    .replace(/<code>(.*?)<\/code>/g,function(_,i){return '<code>'+i+'</code>';});
}
function copyCode(btn){
  var block=btn.parentElement;
  var raw=block.getAttribute('data-raw')||'';
  // Unescape HTML entities stored in data-raw
  var txt=raw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){flash(btn);},function(){fallback(btn,txt);});
  } else { fallback(btn,txt); }
}
function fallback(btn,txt){
  var ta=document.createElement('textarea');
  ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); flash(btn); }catch(e){}
  document.body.removeChild(ta);
}
function flash(btn){
  btn.textContent='Copied!'; btn.classList.add('copied');
  setTimeout(function(){ btn.textContent='Copy'; btn.classList.remove('copied'); },2000);
}
function getCardData(key){
  // Try each lazily-loaded page object in turn
  var pages=[
    window.CARD_DATA_CORE,
    window.CARD_DATA_ADVANCED,
    window.CARD_DATA_STDLIB,
    window.CARD_DATA_DATASCIENCE
  ];
  for(var i=0;i<pages.length;i++){
    if(pages[i] && pages[i][key]) return pages[i][key];
  }
  return null;
}
function skel(){
  return {
    left:'<div class="detail-heading">Overview</div>'
      +'<div class="skeleton w-full"></div><div class="skeleton w-3-4"></div><div class="skeleton w-1-2"></div>'
      +'<div class="detail-heading" style="margin-top:1rem">When to use</div>'
      +'<div class="skeleton w-full"></div><div class="skeleton w-3-4"></div>'
      +'<div class="detail-heading" style="margin-top:1rem">Watch out for</div>'
      +'<div class="skeleton w-full" style="height:30px;border-radius:6px"></div>'
      +'<div class="skeleton w-full" style="height:30px;border-radius:6px;margin-top:5px"></div>',
    right:'<div class="detail-heading">Example</div><div class="skeleton h-tall"></div>'
  };
}
function render(data,section){
  var url=getDoc(section);
  var gotchas=(data.gotchas||[]).map(function(g){
    return '<div class="gotcha-tag">\u26a0 '+rp(g)+'</div>';
  }).join('');
  return {
    left:'<div class="detail-heading">Overview</div>'
      +'<div class="detail-prose">'+rp(data.summary||'')+'</div>'
      +'<div class="detail-heading">When to use</div>'
      +'<div class="detail-prose">'+rp(data.when_to_use||'')+'</div>'
      +(gotchas?'<div class="detail-heading">Watch out for</div><div class="gotcha-list">'+gotchas+'</div>':'')
      +'<a class="doc-link" href="'+esc(url)+'" target="_blank" rel="noopener">\u2197 Official docs</a>',
    right:'<div class="detail-heading">Example</div>'
      +'<div class="detail-code-block" data-raw="'+esc(data.example||'')+'">'
      +'<button class="copy-btn" onclick="copyCode(this)" title="Copy to clipboard">Copy</button>'
      +hi(data.example||'')
      +'</div>'
  };
}
function open(card){
  var lbl=card.querySelector('.card-label');
  var sec=card.closest('.section')&&card.closest('.section').querySelector('.section-title');
  // Read only direct text nodes, ignoring child elements like .new-badge
  var cardLabel=lbl?Array.from(lbl.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.textContent;}).join('').trim():'';
  var section=sec&&sec.textContent.trim()||'';
  document.getElementById('detail-section-label').textContent=section.toUpperCase();
  document.getElementById('detail-card-title').textContent=cardLabel;
  var sk=skel();
  document.getElementById('detail-left').innerHTML=sk.left;
  document.getElementById('detail-right').innerHTML=sk.right;
  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('detail-overlay').classList.add('open');
  var key=makeKey(section,cardLabel);
  var data=getCardData(key);
  setTimeout(function(){
    if(data){
      var r=render(data,section);
      document.getElementById('detail-left').innerHTML=r.left;
      document.getElementById('detail-right').innerHTML=r.right;
    } else {
      document.getElementById('detail-left').innerHTML=
        '<div class="detail-heading">Overview</div>'
        +'<p class="detail-prose">Card data loading...</p>';
      document.getElementById('detail-right').innerHTML='';
    }
  },80);
}
function close(){
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('detail-overlay').classList.remove('open');
}
function init(){
  document.querySelectorAll('.card').forEach(function(c){c.addEventListener('click',function(){open(c);});});
  document.getElementById('detail-overlay').addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape') close();});
}
window.closePanel=close;
window.copyCode=copyCode;
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
}());
