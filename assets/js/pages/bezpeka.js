/* Сторінка bezpeka.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  fetch('/content/bezpeka.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('bezIntro'); if(i)kalynkaSetRich(i,d.intro);}
    if(d.alarmSteps&&d.alarmSteps.length){
      document.getElementById('alarmBox').hidden=false;
      if(d.alarmTitle)document.getElementById('alarmTitle').textContent=d.alarmTitle;
      document.getElementById('alarmSteps').innerHTML=d.alarmSteps.map(function(s){return '<li>'+esc(s)+'</li>';}).join('');
    }
    var box=document.getElementById('safeGrid');
    if(box&&d.items&&d.items.length){
      box.innerHTML=d.items.map(function(x,i){
        return '<div class="pcard reveal">'+(window.kalynkaCover||function(){return ''})(x)+'<div class="pe">'+esc(x.icon||'🛡️')+'</div><h3>'+esc(x.title)+'</h3><div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(x.text)+'</div>'+(window.kalynkaCardMeta||function(){return ''})('bezpeka',i,x)+'</div>';
      }).join('');
    }
  }).catch(function(){});
})();
