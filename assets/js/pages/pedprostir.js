/* Сторінка pedprostir.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var RICH=window.kalynkaRich||function(x){return esc(x);};
  function ext(u){ var m=String(u||'').toLowerCase().split(/[?#]/)[0].match(/\.([a-z0-9]+)$/); return m?m[1]:''; }
  function docIcon(u){ var e=ext(u); if(e==='pdf')return '📕'; if(/^(doc|docx|odt|rtf|txt)$/.test(e))return '📘'; if(/^(xls|xlsx|ods)$/.test(e))return '📗'; if(/^(ppt|pptx|odp)$/.test(e))return '📙'; if(/^(jpg|jpeg|png|webp|gif)$/.test(e))return '🖼️'; return '🔗'; }
  function docKind(u){ var e=ext(u); return e?e.toUpperCase():'Посилання'; }
  var ITEMS=[];
  function detail(i){
    var x=ITEMS[i]; if(!x) return;
    var photos=(x.photos||[]).filter(Boolean), docs=(x.docs||[]).filter(function(d){return d&&(d.file||d.link);});
    var html='<div class="pp-sheet" role="dialog" aria-modal="true" aria-label="'+esc(x.title)+'">'+
      '<div class="pp-head"><span class="pp-ico">'+esc(x.icon||'📌')+'</span><h2>'+esc(x.title)+'</h2><button type="button" class="pp-x" aria-label="Закрити">✕</button></div>'+
      '<div class="pp-body">'+
        (x.text?'<div class="rtx pp-text">'+RICH(x.text)+'</div>':'')+
        (photos.length?'<h3 class="pp-sub">📷 Фото <span>'+photos.length+'</span></h3><div class="pp-photos">'+photos.map(function(src){
          return '<button type="button" class="pzoom" data-set="pp'+i+'" data-full="'+esc(src)+'" data-cap="'+esc(x.title)+'"><img src="'+esc(src)+'" alt="" loading="lazy"></button>';
        }).join('')+'</div>':'')+
        (docs.length?'<h3 class="pp-sub">📄 Документи <span>'+docs.length+'</span></h3><div class="pp-docs">'+docs.map(function(d){
          var u=d.file||d.link;
          return '<a class="pp-doc" href="'+esc(u)+'" target="_blank" rel="noopener"><span class="di">'+docIcon(u)+'</span><span class="dt">'+esc(d.title||'Документ')+'</span><span class="dk">'+esc(docKind(u))+'</span><span class="dg">Відкрити →</span></a>';
        }).join('')+'</div>':'')+
        (!x.text&&!photos.length&&!docs.length?'<p class="pp-empty">Матеріали зʼявляться незабаром 🌱</p>':'')+
      '</div></div>';
    var bg=document.createElement('div'); bg.className='pp-bg'; bg.innerHTML=html;
    function close(){ bg.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',onKey); if(location.hash) history.replaceState(null,'',location.pathname); }
    function onKey(e){ if(e.key==='Escape' && !document.querySelector('.k-lb')) close(); }
    bg.addEventListener('click',function(e){ if(e.target===bg||e.target.classList.contains('pp-x')) close(); });
    document.addEventListener('keydown',onKey);
    document.body.appendChild(bg); document.body.style.overflow='hidden';
    history.replaceState(null,'','#rozdil-'+(i+1));
  }
  fetch('/content/pedprostir.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('ppIntro'); if(i)kalynkaSetRich(i,d.intro);}
    var box=document.getElementById('ppGrid');
    ITEMS=d.items||[];
    if(box&&ITEMS.length){
      box.innerHTML=ITEMS.map(function(x,i){
        var ph=(x.photos||[]).filter(Boolean).length, dc=(x.docs||[]).filter(function(q){return q&&(q.file||q.link);}).length;
        var has=ph||dc;
        var meta=has?'<div class="pp-meta">'+(ph?'<span>📷 '+ph+' фото</span>':'')+(dc?'<span>📄 '+dc+' '+(dc===1?'документ':(dc<5?'документи':'документів'))+'</span>':'')+'</div><span class="pp-open">Переглянути →</span>':'';
        var cover=ph?'<div class="pp-cover"><img src="'+esc(x.photos[0])+'" alt="" loading="lazy"></div>':'';
        return '<div class="pcard reveal pp-card'+(has?' clickable':'')+'"'+(has?' data-i="'+i+'" tabindex="0" role="button"':'')+'>'+cover+'<div class="pe">'+esc(x.icon||'📌')+'</div><h3>'+esc(x.title)+'</h3><div class="rtx">'+RICH(x.text)+'</div>'+meta+'</div>';
      }).join('');
      box.addEventListener('click',function(e){ var c=e.target.closest('.pp-card.clickable'); if(c) detail(+c.getAttribute('data-i')); });
      box.addEventListener('keydown',function(e){ if(e.key==='Enter'){ var c=e.target.closest('.pp-card.clickable'); if(c) detail(+c.getAttribute('data-i')); } });
      var m=location.hash.match(/^#rozdil-(\d+)$/); if(m) detail(+m[1]-1);
    }
  }).catch(function(){});
})();
