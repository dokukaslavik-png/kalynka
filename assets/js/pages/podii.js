/* Події з content/events.json (редагується в адмінці) */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var box=document.getElementById('eventsList');
  fetch('/content/events.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!box||!d||!d.items||!d.items.length)return;
    box.innerHTML=d.items.map(function(e,i){
      return '<div class="nitem"><div class="thumb">'+esc(e.icon||'📅')+'</div><div>'+
        '<div class="date">'+esc(e.date)+'</div><h3>'+esc(e.title)+'</h3>'+
        (e.desc?'<span class="more">'+esc(e.desc)+'</span>':'')+(window.kalynkaCardMeta||function(){return ''})('events',i,e)+'</div></div>';
    }).join('');
  }).catch(function(){});
})();
