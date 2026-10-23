/* Сторінка menu.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  fetch('/content/menu.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('menuIntro'); if(i)kalynkaSetRich(i,d.intro);}
    if(d.note){var n=document.getElementById('menuNote'); if(n)kalynkaSetRich(n,d.note,'ℹ️');}
    var box=document.getElementById('menuGrid');
    if(box&&d.days&&d.days.length){
      box.innerHTML=d.days.map(function(day){
        function meal(ic,label,val){ if(!val)return ''; return '<div class="meal"><div class="ml">'+ic+' '+label+'</div><p>'+esc(val)+'</p></div>'; }
        return '<div class="mcard reveal"><div class="mhead">'+esc(day.day)+'</div><div class="mbody">'+
          meal('🥣','Сніданок',day.breakfast)+
          meal('🍲','Обід',day.lunch)+
          meal('🍎','Підвечірок',day.snack)+
          (day.breakfast||day.lunch||day.snack ? '' : '<p class="meal-empty">Меню незабаром зʼявиться 🍽️</p>')+
        '</div></div>';
      }).join('');
    }
  }).catch(function(){});
})();
