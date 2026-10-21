/* Сторінка prozorist.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  fetch('/content/prozorist.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('pzIntro'); if(i)kalynkaSetRich(i,d.intro);}
    var box=document.getElementById('pzList');
    if(box&&d.items&&d.items.length){
      box.innerHTML=d.items.map(function(x,idx){
        var docs=(x.docs||[]).filter(function(dd){return dd&&(dd.file||dd.link);});
        var href = x.file || x.link || '';
        var act;
        if(href) act='<a class="open" href="'+esc(href)+'" target="_blank" rel="noopener">📄 Відкрити</a>';
        else if(docs.length) act='<span class="cnt">'+docs.length+' '+(docs.length===1?'документ':(docs.length<5?'документи':'документів'))+'</span>';
        else if(x.note) act='';
        else act='<span class="soon">незабаром</span>';
        var noteHtml = x.note ? (window.kalynkaRich?kalynkaRich(x.note):esc(x.note)) : '';
        var note = noteHtml ? '<div class="pz-note rtx">'+noteHtml+'</div>' : '';
        var sub = docs.length ? '<div class="pz-docs">'+docs.map(function(dd){
            return '<a class="pz-doc" href="'+esc(dd.file||dd.link)+'" target="_blank" rel="noopener"><span class="di">📄</span><span class="dt">'+esc(dd.title||'Документ')+'</span><span class="dg">Відкрити →</span></a>';
          }).join('')+'</div>' : '';
        return '<div class="pz reveal'+(docs.length||noteHtml.length>260?' has-docs':'')+'"><div class="n">'+(idx+1)+'</div>'+
          '<div class="pz-main"><div class="pz-title">'+esc(x.title)+'</div>'+note+sub+'</div>'+
          (act?'<div class="pz-act">'+act+'</div>':'')+'</div>';
      }).join('');
      // довгі тексти — згорнуті, з кнопкою «Читати повністю»
      Array.prototype.forEach.call(box.querySelectorAll('.pz-note'), function(n){
        if(n.scrollHeight <= 190) return;
        n.classList.add('clamped');
        var b=document.createElement('button'); b.type='button'; b.className='pz-more'; b.textContent='Читати повністю ▾';
        b.addEventListener('click', function(){ var open=n.classList.toggle('clamped'); b.textContent=open?'Читати повністю ▾':'Згорнути ▴'; });
        n.parentNode.insertBefore(b, n.nextSibling);
      });
    }
  }).catch(function(){});
})();
