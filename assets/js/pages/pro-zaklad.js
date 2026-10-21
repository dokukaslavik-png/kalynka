/* «Про заклад»: вступ, історія, адміністрація — з content/about.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var roleColors=['','pt-leaf','pt-sky','pt-lilac','pt-sun'];
  fetch('/content/about.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;
    var intro=document.getElementById('aboutIntro');
    if(intro&&d.intro&&d.intro.length) intro.innerHTML=d.intro.map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    var hist=document.getElementById('aboutHistory');
    if(hist&&d.history&&d.history.length) hist.innerHTML=d.history.map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    var P=window.kalynkaPersonCard;
    var adm=document.getElementById('adminGrid');
    if(adm&&P&&d.admin&&d.admin.length){
      adm.innerHTML=d.admin.map(function(m,i){ return P(m, roleColors[i%5]); }).join('');
    }
    var sp=document.getElementById('specGrid');
    if(sp&&P&&d.specialists&&d.specialists.length){
      sp.innerHTML=d.specialists.map(function(m,i){ return P(m, roleColors[(i+1)%5]); }).join('');
    } else if(sp){ var sec=document.getElementById('fahivtsi'); if(sec) sec.style.display='none'; }
  }).catch(function(){});
})();
