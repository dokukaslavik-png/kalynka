/* Сторінка dosyahnennya.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  fetch('/content/dosyahnennya.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('pgIntro'); if(i)kalynkaSetRich(i,d.intro);}
    var box=document.getElementById('achGrid');
    if(box&&d.items&&d.items.length){
      box.innerHTML=d.items.map(function(x,i){
        var img=x.image?'<img src="'+esc(x.image)+'" alt="'+esc(x.title)+'" loading="lazy">':esc(x.icon||'🏆');
        return '<div class="ach reveal"><div class="aimg">'+img+'</div><div class="abody">'+
          (x.date?'<span class="adate">'+esc(x.date)+'</span>':'')+'<h3>'+esc(x.title)+'</h3>'+(x.text?'<div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(x.text)+'</div>':'')+(window.kalynkaCardMeta||function(){return ''})('dosyahnennya',i,x)+'</div></div>';
      }).join('');
    }
  }).catch(function(){});
})();
