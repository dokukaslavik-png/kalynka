/* Сторінка vstup.html — дані з content/*.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  fetch('/content/vstup.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    if(d.intro){var i=document.getElementById('vstIntro'); if(i)kalynkaSetRich(i,d.intro);}
    if(d.note){var n=document.getElementById('vstNote'); if(n)kalynkaSetRich(n,d.note,'ℹ️');}
    var sb=document.getElementById('stepsBox');
    if(sb&&d.steps&&d.steps.length){
      sb.innerHTML=d.steps.map(function(x,idx){
        var link=x.url?'<a class="step-link" href="'+esc(x.url).replace(/"/g,'&quot;')+'" target="_blank" rel="noopener">Перейти до реєстрації →</a>':'';
        return '<div class="step reveal"><div class="num">'+(idx+1)+'</div><div><h3>'+esc(x.title)+'</h3><div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(x.text)+'</div>'+link+(window.kalynkaCardMeta||function(){return ''})('vstup',idx,x)+'</div></div>';
      }).join('');
    }
    var db=document.getElementById('docsBox');
    if(db&&d.documents&&d.documents.length){
      db.innerHTML=d.documents.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    }
  }).catch(function(){});
})();
