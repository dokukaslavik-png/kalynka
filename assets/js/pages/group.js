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
    var P=window.kalynkaPersonCard;
    var AGE={ranniy:'ранній вік',molodshi:'молодший вік',seredni:'середній вік',starshi:'старший вік'};
    var list=(g.groups||[]).map(function(x){return {gr:x,age:''};});
    if(key==='inklyuziya'){
      Object.keys(d).forEach(function(k){ if(k==='inklyuziya')return;
        (d[k].groups||[]).forEach(function(x){ if(x.inclusive) list.push({gr:x,age:AGE[k]||''}); });
      });
    }
    list.sort(function(a,b){return (parseInt(a.gr.num,10)||999)-(parseInt(b.gr.num,10)||999);});
    if(te&&P&&list.length){
      te.className='';
      te.innerHTML=list.map(function(it){
        var gr=it.gr;
        var h=(gr.num?'Група <span class="num">№'+esc(gr.num)+'</span> ':'')+(gr.name?'«'+esc(gr.name)+'»':'');
        if(it.age) h+=' <span class="tage">· '+esc(it.age)+'</span>';
        if(gr.inclusive&&key!=='inklyuziya') h+=' <span class="tinc">💛 інклюзивна</span>';
        return '<div class="tgroup">'+(h?'<div class="tgroup-h">'+h+'</div>':'')+
          '<div class="grid-3">'+(gr.teachers||[]).map(function(m,i){return P(m,acc[i%3]);}).join('')+'</div></div>';
      }).join('');
      var note=te.parentNode.querySelector('.ph-note'); if(note&&note.parentNode) note.parentNode.style.display='none';
    } else if(te&&P&&g.teachers&&g.teachers.length){
      te.innerHTML=g.teachers.map(function(m,i){return P(m,acc[i%3]);}).join('');
    }
  }).catch(function(){});
})();
