/* Політика конфіденційності: текст із content/privacy.json */
(function(){
  var box=document.getElementById('pvText');
  window.kalynkaPageDefaults={text:box.innerHTML};
  fetch('/content/privacy.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(d&&d.text&&window.kalynkaRich) box.innerHTML=kalynkaRich(d.text);
  }).catch(function(){});
})();
