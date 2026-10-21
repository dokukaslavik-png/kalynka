/* Сторінка korysni.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dom(u){try{return new URL(u).hostname.replace(/^www\./,'');}catch(e){return '';}}
  fetch('/content/korysni.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('pgIntro'); if(i)kalynkaSetRich(i,d.intro);}
    var box=document.getElementById('lkGrid');
    if(box&&d.items&&d.items.length){
      box.innerHTML=d.items.filter(function(x){return x.url;}).map(function(x){
        return '<a class="lk reveal" href="'+esc(x.url)+'" target="_blank" rel="noopener"><div class="li">'+esc(x.icon||'🔗')+'</div><div>'+
          '<h3>'+esc(x.title)+'</h3>'+(x.text?'<p>'+esc(x.text)+'</p>':'')+'<span class="go">Перейти →</span><span class="dom">'+esc(dom(x.url))+'</span></div></a>';
      }).join('');
    }
  }).catch(function(){});
})();
