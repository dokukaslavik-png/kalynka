/* Гуртки з content/gurtky.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var acc=['','pt-leaf','pt-sky','pt-lilac','pt-sun',''];
  var box=document.getElementById('gurtkyGrid');
  fetch('/content/gurtky.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!box||!d||!d.items||!d.items.length)return;
    box.innerHTML=d.items.map(function(x,i){
      return '<div class="pcard '+acc[i%6]+' reveal">'+(window.kalynkaCover||function(){return ''})(x)+'<div class="pe">'+esc(x.emoji||'🌟')+'</div><h3>'+esc(x.title)+'</h3><div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(x.text)+'</div>'+(window.kalynkaCardMeta||function(){return ''})('gurtky',i,x)+'</div>';
    }).join('');
  }).catch(function(){});
})();
