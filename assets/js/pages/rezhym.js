/* Сторінка rezhym.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  fetch('/content/rezhym.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('rezIntro'); if(i)kalynkaSetRich(i,d.intro);}
    if(d.note){var n=document.getElementById('rezNote'); if(n)kalynkaSetRich(n,d.note,'ℹ️');}
    var box=document.getElementById('rezTimeline');
    if(box&&d.items&&d.items.length){
      box.innerHTML=d.items.map(function(x){
        return '<div class="tl-item reveal"><div class="tl-ic">'+esc(x.icon||'⏰')+'</div>'+
          '<div class="tl-mid"><span class="tl-dot"></span><span class="tl-line"></span></div>'+
          '<div class="tl-body"><div class="tl-time">'+esc(x.time)+'</div><div class="tl-title">'+esc(x.title)+'</div></div></div>';
      }).join('');
    }
  }).catch(function(){});
})();
