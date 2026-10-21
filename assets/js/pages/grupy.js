/* Опис, заняття та вихователі групи з content/groups.json (редагується в адмінці) */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var key=document.body.getAttribute('data-group')||'';
  if(!key)return;
  var acc=['','pt-leaf','pt-sky'];
  fetch('/content/groups.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    var g=d&&d[key]; if(!g)return;
    var ab=document.getElementById('gAbout');
    if(ab&&g.about&&g.about.length) ab.innerHTML=g.about.map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    var dv=document.getElementById('gDevelop');
    if(dv&&g.develop&&g.develop.length) dv.innerHTML=g.develop.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    var ac=document.getElementById('gActs');
    if(ac&&g.activities&&g.activities.length) ac.innerHTML=g.activities.map(function(a,i){
      return '<div class="pcard '+acc[i%3]+' reveal">'+(window.kalynkaCover||function(){return ''})(a)+'<div class="pe">'+esc(a.emoji||'🌟')+'</div><h3>'+esc(a.title)+'</h3><div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(a.text)+'</div>'+(window.kalynkaCardMeta||function(){return ''})('act',i,a)+'</div>';
    }).join('');
    var te=document.getElementById('teachers');
    if(te&&g.teachers&&g.teachers.length) te.innerHTML=g.teachers.map(function(m){
      var pe=m.photo?'<div class="pe pe-photo"><img src="'+esc(m.photo)+'" alt=""></div>':'<div class="pe">\uD83D\uDC69\u200D\uD83C\uDFEB</div>';
      return '<div class="pcard center">'+pe+'<h3>'+esc(m.role)+'</h3><p>'+esc(m.name)+'</p></div>';
    }).join('');
  }).catch(function(){});
})();
