/* Сторінка galereya.html — дані з content/*.json */
(function(){
  var lb=document.getElementById('lb'), img=document.getElementById('lbImg');
  var grid=document.getElementById('galGrid');
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function bind(){
    grid.querySelectorAll('.gal-item img').forEach(function(i){
      i.addEventListener('click',function(){img.src=i.src; lb.classList.add('open');});
    });
  }
  fetch('/content/gallery.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(d&&d.items&&d.items.length){
      grid.innerHTML=d.items.map(function(g){
        return '<div class="gal-item"><img src="'+esc(g.image)+'" alt="'+esc(g.caption||'Фото садочка')+'"></div>';
      }).join('');
    }
    bind();
  }).catch(bind);
  lb.addEventListener('click',function(){lb.classList.remove('open');});
})();
