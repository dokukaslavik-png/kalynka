/* Новини з content/news.json (редагується в адмінці) */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var box=document.getElementById('newsList');
  fetch('/content/news.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d||!d.items||!d.items.length)return;
    box.innerHTML=d.items.map(function(n,i){
      var thumb=n.image?'<div class="thumb thumb-img"><img src="'+esc(n.image)+'" alt=""></div>':'<div class="thumb">📰</div>';
      var body='<div class="date">'+esc(n.date)+'</div><h3>'+esc(n.title)+'</h3>'+
        (n.text?'<div class="rtx news-text">'+(window.kalynkaRich||function(x){return esc(x)})(n.text)+'</div>':'');
      return '<div class="nitem">'+thumb+'<div>'+body+(window.kalynkaCardMeta||function(){return ''})('news',i,n)+'</div></div>';
    }).join('');
  }).catch(function(){});
})();
